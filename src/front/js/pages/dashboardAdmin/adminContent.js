import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FiSearch } from "react-icons/fi";
import "../../../styles/adminContent.css";

export const AdminContent = ({
  activeView,
  setActiveView,
  users,
  activeTab,
  setActiveTab,
  searchAdmins,
  setSearchAdmins,
  searchTeachers,
  setSearchTeachers,
  searchStudents,
  setSearchStudents,
  getUserStats,
  filterUsers,
  setSelectedUser,
  setShowModal,
  setUserToDelete,
  setShowDeleteModal,
  handleBlockUser,
  handleUnblockUser,
  courseFormData,
  learningObjectives,
  requirements,
  courseCreationStatus,
  handleCourseInputChange,
  handleLearningObjectiveChange,
  handleRequirementChange,
  addLearningObjective,
  removeLearningObjective,
  addRequirement,
  removeRequirement,
  handleCreateCourse,
  courses,
  coursesLoading,
  coursesError,
  onRefreshCourses,
  onDeleteCourse,
  modules,
  setModules,
  addModule,
  removeModule,
  updateModule,
  addLesson,
  removeLesson,
  updateLesson,
  onViewCourseDetails,
  teachers,
  teachersLoading,
  teachersError,
  currentUser,
  onEditCourse,
  validationErrors,
  setValidationErrors,
  userStatsPerMonth,
  schedules,
  setSchedules,
  addSchedule,
  removeSchedule,
  updateSchedule,
  toggleScheduleDay,
}) => {
  // Función para renderizar la tabla de usuarios
  const renderUserTable = (usersToRender) => {
    if (usersToRender.length === 0) {
      return (
        <div className="empty-state">
          <span>
            <span
              className="💀"
              data-content="📫"
              data-hover-content="📪"
              data-active-content="📬"
            ></span>
          </span>
          <p>No users found</p>
        </div>
      );
    }

    return (
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Country</th>
              <th>Role</th>
              <th>Status</th>
              <th>Blocks</th>
              <th>Registration</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersToRender.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.first_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <strong>{user.first_name || "N/A"}</strong>{" "}
                      <span>{user.last_name || ""}</span>
                    </div>
                  </div>
                </td>
                <td>{user.email || "N/A"}</td>
                <td>
                  <span className="country-badge">{user.country || "N/A"}</span>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {getRoleName(user.role)}
                  </span>
                </td>
                <td>
                  <div className="status-badge">
                    {user.is_blocked ? (
                      <span className="blocked-badge">
                        Bloqueado
                        {user.block_reason && (
                          <span className="block-reason">
                            {" "}
                            ({user.block_reason})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="active-badge">Active</span>
                    )}
                  </div>
                </td>
                <td>
                  {/* Contador de bloqueos */}
                  <span
                    className={`block-count ${
                      user.block_count > 0 ? "has-blocks" : ""
                    }`}
                  >
                    {user.block_count || 0}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.last_login ? (
                    <div className="last-login-info">
                      <div className="last-login-date">
                        {new Date(user.last_login).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <span className="never-logged">Never</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn details-btn"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    {user.role !== "admin" && (
                      <>
                        {!user.is_blocked ? (
                          <button
                            className="action-btn block-btn"
                            onClick={() => handleBlockUser(user.id)}
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            className="action-btn unblock-btn"
                            onClick={() => handleUnblockUser(user.id)}
                          >
                            Unblock
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Función auxiliar para nombres de roles
  const getRoleName = (role) => {
    const roles = {
      admin: "Admin",
      teacher: "Teacher",
      student: "Student",
      user: "User",
    };
    return roles[role] || "User";
  };

  // Renderizado del dashboard
  // Renderizado del dashboard
  // Renderizado del dashboard
  const renderDashboard = () => {
    const userStats = getUserStats();
    const courseStats = getCourseStats();

    // Íconos para usuarios
    const userIcons = {
      total: {
        icon: <i className="fa-solid fa-users"></i>,
        color: "#3b82f6",
      },
      admins: {
        icon: <i className="fa-solid fa-user-tie"></i>,
        color: "#10b981",
      },
      teachers: {
        icon: <i className="fa-solid fa-chalkboard-user"></i>,
        color: "#f59e0b",
      },
      students: {
        icon: <i className="fa-solid fa-graduation-cap"></i>,
        color: "#8b5cf6",
      },
    };

    // Íconos para cursos
    const courseIcons = {
      total: {
        icon: <i className="fa-solid fa-book"></i>,
        color: "#6366f1",
      },
      published: {
        icon: <i className="fa-solid fa-bullhorn"></i>,
        color: "#22c55e",
      },
      drafts: {
        icon: <i className="fa-solid fa-pen-to-square"></i>,
        color: "#f87171",
      },
    };

    // Labels personalizados
    const userLabels = {
      total: "Total Users",
      admins: "Admins",
      teachers: "Teachers",
      students: "Students",
    };

    const courseLabels = {
      total: "Total Courses",
      published: "Published",
      drafts: "Drafts",
    };

    return (
      <div className="admin-controls">
        {/* Usuarios */}
        <div className="stats-container">
          {Object.keys(userStats).map((key) => (
            <div key={key} className="stat-card">
              <div
                className="stat-icon"
                style={{ backgroundColor: userIcons[key].color }}
              >
                {userIcons[key].icon}
              </div>
              <span>{userLabels[key]}</span> {/* Aquí cambiamos el label */}
              <strong>{userStats[key]}</strong>
            </div>
          ))}
        </div>

        {/* Cursos */}
        <div className="stats-container">
          {Object.keys(courseStats).map((key) => (
            <div key={key} className="stat-card">
              <div
                className="stat-icon"
                style={{ backgroundColor: courseIcons[key].color }}
              >
                {courseIcons[key].icon}
              </div>
              <span>{courseLabels[key]}</span> {/* Aquí también */}
              <strong>{courseStats[key]}</strong>
            </div>
          ))}

          <h3 className="chart-title">Registered Users per Month</h3>
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={userStatsPerMonth}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />

                <XAxis
                  dataKey="month_name"
                  tick={{ className: "chart-axis-tick" }}
                />
                <YAxis tick={{ className: "chart-axis-tick" }} />

                <Tooltip
                  contentStyle={{}}
                  wrapperClassName="chart-tooltip"
                  cursor={{ className: "chart-cursor" }}
                />

                <Bar dataKey="count" className="chart-bar" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderUsersView = () => {
    const stats = getUserStats();

    const icons = {
      total: { icon: <i className="fa-solid fa-users"></i>, color: "#3b82f6" },
      admins: {
        icon: <i className="fa-solid fa-user-tie"></i>,
        color: "#10b981",
      },
      teachers: {
        icon: <i className="fa-solid fa-chalkboard-user"></i>,
        color: "#f59e0b",
      },
      students: {
        icon: <i className="fa-solid fa-graduation-cap"></i>,
        color: "#8b5cf6",
      },
    };

    return (
      <>
        <div className="admin-controls">
          <div className="stats-container">
            {["total", "admins", "teachers", "students"].map((key) => (
              <div key={key} className="stat-card">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: icons[key].color }}
                >
                  {icons[key].icon}
                </div>
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <strong>{stats[key]}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="users-tabs-container">
          <div className="tabs-header">
            {["admins", "teachers", "students"].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "admins"
                  ? "Admins"
                  : tab === "teachers"
                  ? "Teachers"
                  : "Students"}{" "}
                ({stats[tab]})
              </button>
            ))}
          </div>

          <div className="tab-content">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "admins"
                    ? "Admins..."
                    : activeTab === "teachers"
                    ? "Teachers..."
                    : "Students..."
                }`}
                value={
                  activeTab === "admins"
                    ? searchAdmins
                    : activeTab === "teachers"
                    ? searchTeachers
                    : searchStudents
                }
                onChange={(e) =>
                  activeTab === "admins"
                    ? setSearchAdmins(e.target.value)
                    : activeTab === "teachers"
                    ? setSearchTeachers(e.target.value)
                    : setSearchStudents(e.target.value)
                }
                className="search-input"
              />
            </div>

            {activeTab === "admins" &&
              renderUserTable(filterUsers("admin", searchAdmins))}
            {activeTab === "teachers" &&
              renderUserTable(filterUsers("teacher", searchTeachers))}
            {activeTab === "students" &&
              renderUserTable(filterUsers("student", searchStudents))}
          </div>
        </div>
      </>
    );
  };

  const getCourseStats = () => ({
    total: courses.length,
    published: courses.filter((c) => c.is_published).length,
    drafts: courses.filter((c) => !c.is_published).length,
  });

  // Función para renderizar la creación de cursos
  const renderCourseCreation = () => {
    return (
      <div className="course-creation-container">
        <div className="creation-header">
          <h2>Create New Course</h2>
          <p>Complete the information to create a new course on the platform</p>
        </div>

        <form
          className="course-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateCourse(false);
          }}
        >
          {/* Tabs de Bootstrap */}
          <ul className="nav nav-tabs mb-4" id="courseFormTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="basic-tab"
                data-bs-toggle="tab"
                data-bs-target="#basic"
                type="button"
                role="tab"
                aria-controls="basic"
                aria-selected="true"
              >
                <i className="bi bi-info-circle me-2"></i>
                Basic Info
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="description-tab"
                data-bs-toggle="tab"
                data-bs-target="#description"
                type="button"
                role="tab"
                aria-controls="description"
                aria-selected="false"
              >
                <i className="bi bi-text-paragraph me-2"></i>
                Description
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="schedule-tab"
                data-bs-toggle="tab"
                data-bs-target="#schedule"
                type="button"
                role="tab"
                aria-controls="schedule"
                aria-selected="false"
              >
                <i className="bi bi-calendar-event me-2"></i>
                Schedule
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="content-tab"
                data-bs-toggle="tab"
                data-bs-target="#content"
                type="button"
                role="tab"
                aria-controls="content"
                aria-selected="false"
              >
                <i className="bi bi-collection me-2"></i>
                Content
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="settings-tab"
                data-bs-toggle="tab"
                data-bs-target="#settings"
                type="button"
                role="tab"
                aria-controls="settings"
                aria-selected="false"
              >
                <i className="bi bi-gear me-2"></i>
                Settings and{" "}
                <strong className="text-primary">Create Course</strong>
              </button>
            </li>
          </ul>

          <div className="tab-content" id="courseFormTabsContent">
            {/* Tab 1: Información Básica */}
            <div
              className="tab-pane fade show active"
              id="basic"
              role="tabpanel"
              aria-labelledby="basic-tab"
            >
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="image_url" className="form-label">
                      Course Image URL
                    </label>
                    <input
                      type="url"
                      id="image_url"
                      name="image_url"
                      className="form-control"
                      value={courseFormData.image_url}
                      onChange={handleCourseInputChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="title" className="form-label">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className={`form-control ${
                        validationErrors.title ? "is-invalid" : ""
                      }`}
                      value={courseFormData.title || ""}
                      onChange={handleCourseInputChange}
                      placeholder="Ex: Introduction to React"
                    />
                    {validationErrors.title && (
                      <div className="invalid-feedback">
                        {validationErrors.title}
                      </div>
                    )}
                  </div>

                  {currentUser && currentUser.role === "admin" && (
                    <div className="form-group">
                      <label htmlFor="teacher_id" className="form-label">
                        Instructor *
                      </label>

                      {teachersLoading ? (
                        <div className="form-control">Loading Teachers...</div>
                      ) : teachersError ? (
                        <div className="alert alert-danger">
                          Error: {teachersError}
                        </div>
                      ) : teachers.length === 0 ? (
                        <div className="form-control">
                          No Teachers Available
                        </div>
                      ) : (
                        <>
                          <select
                            id="teacher_id"
                            name="teacher_id"
                            className={`form-select ${
                              validationErrors.teacher_id ? "is-invalid" : ""
                            }`}
                            value={courseFormData.teacher_id || ""}
                            onChange={handleCourseInputChange}
                          >
                            <option value="">Select an Instructor</option>
                            {teachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.first_name} {teacher.last_name}
                              </option>
                            ))}
                          </select>

                          {validationErrors.teacher_id && (
                            <div className="invalid-feedback">
                              {validationErrors.teacher_id}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Duration */}
                  <div className="form-group">
                    <label htmlFor="duration" className="form-label">
                      Duration *
                    </label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      className={`form-control ${
                        validationErrors.duration ? "is-invalid" : ""
                      }`}
                      value={courseFormData.duration || ""}
                      onChange={handleCourseInputChange}
                      placeholder="Ex: 2 Months"
                    />
                    {validationErrors.duration && (
                      <div className="invalid-feedback">
                        {validationErrors.duration}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      className={`form-control ${
                        validationErrors.price ? "is-invalid" : ""
                      }`}
                      value={courseFormData.price || ""}
                      onChange={handleCourseInputChange}
                      min="0"
                      step="0.01"
                      placeholder="29.99"
                    />
                    {validationErrors.price && (
                      <div className="invalid-feedback">
                        {validationErrors.price}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="discount_price" className="form-label">
                      Discount Price ($)
                    </label>
                    <input
                      type="number"
                      id="discount_price"
                      name="discount_price"
                      className="form-control"
                      value={courseFormData.discount_price || ""}
                      onChange={handleCourseInputChange}
                      min="0"
                      step="0.01"
                      placeholder="19.99"
                    />
                  </div>

                  {/* Level */}
                  <div className="form-group">
                    <label htmlFor="level" className="form-label">
                      Level *
                    </label>
                    <select
                      id="level"
                      name="level"
                      className={`form-select ${
                        validationErrors.level ? "is-invalid" : ""
                      }`}
                      value={courseFormData.level || ""}
                      onChange={handleCourseInputChange}
                    >
                      <option value="">Select level</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                    {validationErrors.level && (
                      <div className="invalid-feedback">
                        {validationErrors.level}
                      </div>
                    )}
                  </div>

                  {/* Language */}
                  <div className="form-group">
                    <label htmlFor="language" className="form-label">
                      Language *
                    </label>
                    <select
                      id="language"
                      name="language"
                      className="form-select"
                      value={courseFormData.language || ""}
                      onChange={handleCourseInputChange}
                    >
                      <option value="Spanish">Spanish</option>
                      <option value="English">English</option>
                      <option value="Portuguese">Portuguese</option>
                    </select>
                  </div>

                  {/* Access Duration */}
                  <div className="form-group">
                    <label htmlFor="access_duration" className="form-label">
                      Access Duration *
                    </label>
                    <select
                      id="access_duration"
                      name="access_duration"
                      className={`form-select ${
                        validationErrors.access_duration ? "is-invalid" : ""
                      }`}
                      value={courseFormData.access_duration}
                      onChange={handleCourseInputChange}
                    >
                      <option value="">Select access duration</option>
                      <option value="lifetime">Lifetime Access</option>
                      <option value="3m">3 Months</option>
                      <option value="6m">6 Months</option>
                      <option value="12m">1 Year</option>
                    </select>
                    {validationErrors.access_duration && (
                      <div className="invalid-feedback">
                        {validationErrors.access_duration}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab 2: Descripción */}
            <div
              className="tab-pane fade"
              id="description"
              role="tabpanel"
              aria-labelledby="description-tab"
            >
              <div className="form-section">
                <h3 className="section-title">Course Description</h3>
                <div className="form-grid">
                  {/* Short Description */}
                  <div className="form-group full-width">
                    <label htmlFor="short_description" className="form-label">
                      Short Description *
                    </label>
                    <textarea
                      id="short_description"
                      name="short_description"
                      className={`form-control ${
                        validationErrors.short_description ? "is-invalid" : ""
                      }`}
                      value={courseFormData.short_description || ""}
                      onChange={handleCourseInputChange}
                      rows="3"
                    />
                    {validationErrors.short_description && (
                      <div className="invalid-feedback">
                        {validationErrors.short_description}
                      </div>
                    )}
                  </div>

                  {/* Full Description */}
                  <div className="form-group full-width">
                    <label htmlFor="description" className="form-label">
                      Full Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className={`form-control ${
                        validationErrors.description ? "is-invalid" : ""
                      }`}
                      value={courseFormData.description || ""}
                      onChange={handleCourseInputChange}
                      rows="6"
                    />
                    {validationErrors.description && (
                      <div className="invalid-feedback">
                        {validationErrors.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección de objetivos de aprendizaje */}
              <div className="form-section">
                <h3 className="section-title">What will students learn?</h3>
                <div className="form-group full-width">
                  <div className="dynamic-list">
                    <div className="list-items">
                      {learningObjectives.map((objective, index) => (
                        <div key={index} className="list-item">
                          <input
                            type="text"
                            className="form-control"
                            value={objective}
                            onChange={(e) =>
                              handleLearningObjectiveChange(
                                index,
                                e.target.value
                              )
                            }
                            placeholder="Ex: Create reusable components in React"
                          />
                          {learningObjectives.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger remove-item-btn"
                              onClick={() => removeLearningObjective(index)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary add-item-btn"
                      onClick={addLearningObjective}
                    >
                      + Add Learning Objective
                    </button>
                  </div>
                </div>
              </div>

              {/* Sección de requisitos */}
              <div className="form-section">
                <h3 className="section-title">Course Requirements</h3>
                <div className="form-group full-width">
                  <div className="dynamic-list">
                    <div className="list-items">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="list-item">
                          <input
                            type="text"
                            className="form-control"
                            value={requirement}
                            onChange={(e) =>
                              handleRequirementChange(index, e.target.value)
                            }
                            placeholder="Ex: Basic knowledge of JavaScript"
                          />
                          {requirements.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger remove-item-btn"
                              onClick={() => removeRequirement(index)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary add-item-btn"
                      onClick={addRequirement}
                    >
                      + Add requirement
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab 3: Horario */}
            {/* Tab 3: Horario */}
            <div
              className="tab-pane fade"
              id="schedule"
              role="tabpanel"
              aria-labelledby="schedule-tab"
            >
              <div className="form-section">
                <h3 className="section-title">Class Schedules</h3>
                <p className="text-muted mb-3">
                  Add multiple groups and select multiple class days for each
                  group.
                </p>

                {schedules.map((schedule, index) => (
                  <div key={index} className="schedule-card card mb-3 p-3">
                    <div className="row g-3 align-items-end">
                      {/* 📅 Checkbox días */}
                      <div className="col-12">
                        <label className="form-label">Class Days *</label>
                        <div className="days-checkboxes">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => (
                            <div
                              key={day}
                              className="form-check form-check-inline"
                            >
                              <input
                                type="checkbox"
                                value={day}
                                checked={schedule.days.includes(day)}
                                onChange={() => toggleScheduleDay(index, day)}
                                id={`day-${index}-${day}`}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`day-${index}-${day}`}
                              >
                                {day}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ⏰ Horas */}
                      <div className="col-md-3">
                        <label className="form-label">Start Time *</label>
                        <input
                          type="time"
                          className="form-control"
                          value={schedule.start_time}
                          onChange={(e) =>
                            updateSchedule(index, "start_time", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">End Time *</label>
                        <input
                          type="time"
                          className="form-control"
                          value={schedule.end_time}
                          onChange={(e) =>
                            updateSchedule(index, "end_time", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* 🌍 Zona horaria */}
                      <div className="col-md-3">
                        <label className="form-label">Time Zone</label>
                        <select
                          className="form-select"
                          value={schedule.timezone}
                          onChange={(e) =>
                            updateSchedule(index, "timezone", e.target.value)
                          }
                        >
                          <option value="GMT-5">
                            GMT-5 (Bogotá, Lima, CDMX)
                          </option>
                          <option value="GMT-3">
                            GMT-3 (Buenos Aires, São Paulo)
                          </option>
                          <option value="GMT-8">GMT-8 (Los Angeles)</option>
                          <option value="GMT+1">GMT+1 (Madrid)</option>
                          <option value="GMT+9">GMT+9 (Tokyo)</option>
                        </select>
                      </div>

                      {/* 🏷️ Grupo */}
                      <div className="col-md-3">
                        <label className="form-label">Group</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Grupo A"
                          value={schedule.group_name}
                          onChange={(e) =>
                            updateSchedule(index, "group_name", e.target.value)
                          }
                        />
                      </div>

                      {/* 🗑️ Botón eliminar grupo */}
                      {schedules.length > 1 && (
                        <div className="col-12 mt-2">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeSchedule(index)}
                          >
                            × Remove schedule
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary mt-2"
                  onClick={addSchedule}
                >
                  + Add another schedule
                </button>
              </div>
            </div>

            {/* Tab 4: Contenido */}
            <div
              className="tab-pane fade"
              id="content"
              role="tabpanel"
              aria-labelledby="content-tab"
            >
              <div className="form-section">
                <h3 className="section-title">Modules and Lessons</h3>

                {modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="module-card card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Module {moduleIndex + 1}</h5>
                      {modules.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeModule(moduleIndex)}
                        >
                          × Remove Module
                        </button>
                      )}
                    </div>

                    <div className="card-body">
                      <div className="form-grid">
                        <div className="form-group full-width">
                          <label className="form-label">Module Title *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={module.title}
                            onChange={(e) =>
                              updateModule(moduleIndex, "title", e.target.value)
                            }
                            placeholder="Ex: Introduction to React"
                            required
                          />
                        </div>

                        <div className="form-group full-width">
                          <label className="form-label">
                            Module Description
                          </label>
                          <textarea
                            className="form-control"
                            value={module.description}
                            onChange={(e) =>
                              updateModule(
                                moduleIndex,
                                "description",
                                e.target.value
                              )
                            }
                            rows="3"
                            placeholder="Describe the objectives of this module."
                          ></textarea>
                        </div>
                      </div>

                      <div className="lessons-container mt-3">
                        <h6>Lessons in this module</h6>

                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="lesson-card card mb-2"
                          >
                            <div className="card-body">
                              <div className="lesson-header d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">
                                  Lesson {lessonIndex + 1}
                                </h6>
                                {module.lessons.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      removeLesson(moduleIndex, lessonIndex)
                                    }
                                  >
                                    × Delete
                                  </button>
                                )}
                              </div>

                              <div className="form-grid">
                                <div className="form-group full-width">
                                  <label className="form-label">
                                    Lesson Title *
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={lesson.title}
                                    onChange={(e) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Ex: What is React?"
                                  />
                                </div>
                                <div className="form-group full-width">
                                  <label className="form-label">
                                    Lesson Description
                                  </label>
                                  <textarea
                                    className="form-control"
                                    value={lesson.description}
                                    onChange={(e) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    rows="2"
                                    placeholder="Brief description of this lesson"
                                  ></textarea>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="btn btn-outline-primary add-lesson-btn"
                          onClick={() => addLesson(moduleIndex)}
                        >
                          + Add Lesson
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary add-module-btn"
                  onClick={addModule}
                >
                  + Add Module
                </button>
              </div>
            </div>

            {/* Tab 5: Configuración */}
            <div
              className="tab-pane fade"
              id="settings"
              role="tabpanel"
              aria-labelledby="settings-tab"
            >
              <div className="form-section">
                <h3 className="section-title">Other options</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="is_published" className="form-label">
                      Publish course immediately
                    </label>
                    <select
                      id="is_published"
                      name="is_published"
                      className="form-select"
                      value={courseFormData.is_published ? "true" : "false"}
                      onChange={(e) =>
                        handleCourseInputChange({
                          target: {
                            name: "is_published",
                            value: e.target.value === "true",
                            type: "select",
                          },
                        })
                      }
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions mt-4 pt-3 border-top">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={courseCreationStatus.loading}
                  >
                    {courseCreationStatus.loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creating...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };
  // Función para renderizar la lista de cursos existentes
  const renderCoursesList = () => {
    if (coursesLoading) {
      return <div className="loading">Loading courses...</div>;
    }

    if (coursesError) {
      return (
        <div className="error">
          Error: {coursesError}
          <button onClick={onRefreshCourses}>Retry</button>
        </div>
      );
    }

    return (
      <div className="courses-management">
        <div className="admin-header">
          <h3>Available Courses</h3>
        </div>
        <button onClick={onRefreshCourses} className="refresh-btn">
          <i className="fa-solid fa-arrows-rotate"></i>
          Refresh
        </button>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {courses.map((course) => (
            <div key={course.id} className="col">
              <div className="grid-course-card h-100">
                <div className="grid-course-image">
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.alt_text || course.title}
                      className="img-fluid w-100 h-100 object-fit-cover"
                    />
                  ) : (
                    <div className="course-image-placeholder">📚</div>
                  )}
                </div>

                <div className="grid-course-content">
                  <div className="mb-2">
                    <h3 className="grid-course-title">{course.title}</h3>
                    <p className="instructor-name">
                      By {course.instructor || "Instructor"}
                    </p>
                  </div>

                  <p className="grid-course-description">
                    {course.short_description ||
                      course.description.substring(0, 100) + "..."}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div className="course-meta-info">
                      <span className="d-flex align-items-center">
                        <i className="far fa-clock me-1"></i>{" "}
                        {course.duration || "10h"}
                      </span>
                      <span className="d-flex align-items-center">
                        <i className="far fa-list-alt me-1"></i>{" "}
                        {course.lessons || 0} Lessons
                      </span>
                    </div>
                    <span
                      className={`level-badge badge ${course.level?.toLowerCase()}`}
                    >
                      {course.level || "BEGINNER"}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto flex-wrap gap-2">
                    <div>
                      {course.discount_price && course.discount_price > 0 ? (
                        <>
                          <span className="price-container">
                            ${course.discount_price}
                          </span>
                          <span className="original-price">
                            ${course.price}
                          </span>
                        </>
                      ) : (
                        <span className="price-container">${course.price}</span>
                      )}
                    </div>

                    <div className="course-actions">
                      <button
                        className="btn course-btn course-details-btn"
                        onClick={() => onViewCourseDetails(course)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn course-btn course-edit-btn"
                        onClick={() => onEditCourse(course)}
                      >
                        Update
                      </button>
                      <button
                        className="btn course-btn course-delete-btn"
                        onClick={() => onDeleteCourse(course.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <span
                      className={`status ${
                        course.is_published ? "published" : "draft"
                      }`}
                    >
                      {course.is_published ? (
                        <>
                          <i className="fa-solid fa-bullhorn me-1"></i>{" "}
                          Published
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-pen me-1"></i> Draft
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="empty-state">
            <p>No courses have been created yet</p>
          </div>
        )}
      </div>
    );
  };

  const renderHeader = () => {
    const titles = {
      dashboard: (
        <>
          <i className="fa-solid fa-chart-simple me-2"></i>
          Administration Panel
        </>
      ),
      users: (
        <>
          <i className="fa-solid fa-users me-2"></i>
          User Management
        </>
      ),
      courses: (
        <>
          <i className="fa-solid fa-book me-2"></i>
          Course Management
        </>
      ),
      settings: (
        <>
          <i className="fa-solid fa-cog me-2"></i>
          System Settings
        </>
      ),
    };

    const descriptions = {
      dashboard: "Welcome to the main control panel",
      courses: "Manage the available courses",
      users: "Manage the users",
      settings: "Configure the system settings",
    };

    return (
      <div
        className={`admin-header ${
          activeView === "dashboard" ? "dashboard-header" : ""
        }`}
      >
        <h3>{titles[activeView] || "Panel"}</h3>
        <p>{descriptions[activeView] || ""}</p>

        {/* 🔥 BOTONES QUE CAMBIAN LA VISTA - SOLO EN DASHBOARD */}
        {activeView === "dashboard" && (
          <div className="dashboard-buttons">
            <button
              className="btn btn-lg btn-light me-2"
              onClick={() => setActiveView("courses")}
            >
              <i className="fa-solid fa-plus me-2"></i>
              Create Course
            </button>
            <button
              className="btn btn-lg btn-outline-light me-2"
              onClick={() => setActiveView("users")}
            >
              <i className="fa-solid fa-users me-2"></i>
              User Management
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-content">
      <div className="admin-container">
        {renderHeader()}
        {activeView === "dashboard" ? (
          renderDashboard()
        ) : activeView === "users" ? (
          renderUsersView()
        ) : activeView === "courses" ? (
          <div className="courses-container">
            {renderCourseCreation()}
            {renderCoursesList()}
          </div>
        ) : (
          <strong>View in development...</strong>
        )}
      </div>
    </div>
  );
};
