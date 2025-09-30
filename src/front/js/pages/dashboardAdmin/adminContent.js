import React from "react";
import { FiSearch } from "react-icons/fi";

export const AdminContent = ({
  activeView,
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
              <th>Nombre</th>
              <th>Email</th>
              <th>País</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Bloqueos</th>
              <th>Registro</th>
              <th>Última Conexión</th>
              <th>Acciones</th>
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
                      <strong>{user.first_name || "N/A"}</strong>
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
                      <span className="active-badge">Activo</span>
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
                    <span className="never-logged">Nunca</span>
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
                      Editar
                    </button>
                    {user.role !== "admin" && (
                      <>
                        {!user.is_blocked ? (
                          <button
                            className="action-btn block-btn"
                            onClick={() => handleBlockUser(user.id)}
                          >
                            Bloquear
                          </button>
                        ) : (
                          <button
                            className="action-btn unblock-btn"
                            onClick={() => handleUnblockUser(user.id)}
                          >
                            Desbloquear
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                        >
                          Eliminar
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
      teacher: "Profesor",
      student: "Estudiante",
      user: "Usuario",
    };
    return roles[role] || "Usuario";
  };

  // Renderizado del dashboard
  const renderDashboard = () => {
    const stats = getUserStats();
    return (
      <div className="admin-controls">
        <div className="stats-container">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="stat-card">
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizado de la vista de usuarios
  const renderUsersView = () => {
    const stats = getUserStats();
    return (
      <>
        <div className="admin-controls">
          <div className="stats-container">
            {["total", "admins", "teachers", "students"].map((key) => (
              <div key={key} className="stat-card">
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
                  ? "Administradores"
                  : tab === "teachers"
                  ? "Profesores"
                  : "Estudiantes"}{" "}
                ({stats[tab]})
              </button>
            ))}
          </div>

          <div className="tab-content">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={`Buscar ${
                  activeTab === "admins"
                    ? "administradores..."
                    : activeTab === "teachers"
                    ? "profesores..."
                    : "estudiantes..."
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
          {/* Sección de información básica */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              {/* Sección de imagen */}
              <div className="form-section">
                <h3>Course Image</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="image_url">Image URL </label>
                    <input
                      type="url"
                      id="image_url"
                      name="image_url"
                      value={courseFormData.image_url}
                      onChange={handleCourseInputChange}
                      placeholder="https://ejemplo.com/imagen-curso.jpg"
                    />
                  </div>
                </div>
              </div>
              <div className="form-group full-width">
                <label htmlFor="title">Course Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={courseFormData.title || ""}
                  onChange={handleCourseInputChange}
                  placeholder="Ej: Introducción a React JS"
                  required
                />
              </div>
              {currentUser && currentUser.role === "admin" && (
                <div className="form-group">
                  <label htmlFor="teacher_id">Instructor *</label>
                  {teachersLoading ? (
                    <p>Cargando profesores...</p>
                  ) : teachersError ? (
                    <p className="error-text">Error: {teachersError}</p>
                  ) : teachers.length === 0 ? (
                    <p>No hay profesores disponibles</p>
                  ) : (
                    <select
                      id="teacher_id"
                      name="teacher_id"
                      value={courseFormData.teacher_id || ""}
                      onChange={handleCourseInputChange}
                      required
                    >
                      <option value="">Seleccionar un instructor</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.first_name} {teacher.last_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="duration">Duration *</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={courseFormData.duration || ""}
                  onChange={handleCourseInputChange}
                  placeholder="Ej: 3 horas"
                  required
                ></input>
              </div>
              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={courseFormData.price || ""}
                  onChange={handleCourseInputChange}
                  min="0"
                  step="0.01"
                  placeholder="29.99"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="discount_price">Discount Price ($)</label>
                <input
                  type="number"
                  id="discount_price"
                  name="discount_price"
                  value={courseFormData.discount_price || ""}
                  onChange={handleCourseInputChange}
                  min="0"
                  step="0.01"
                  placeholder="19.99"
                />
              </div>
              <div className="form-group">
                <label htmlFor="level">Level *</label>
                <select
                  id="level"
                  name="level"
                  value={courseFormData.level || ""}
                  onChange={handleCourseInputChange}
                  required
                >
                  <option value="BEGINNER">Principiante</option>
                  <option value="INTERMEDIATE">Intermedio</option>
                  <option value="ADVANCED">Avanzado</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="language">Language *</label>
                <select
                  id="language"
                  name="language"
                  value={courseFormData.language || ""}
                  onChange={handleCourseInputChange}
                  required
                >
                  <option value="Spanish">Spanish</option>
                  <option value="English">English</option>
                  <option value="Portuguese">Portuguese</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="access_duration">Access Duration *</label>
                <select
                  id="access_duration"
                  name="access_duration"
                  value={courseFormData.access_duration}
                  onChange={handleCourseInputChange}
                  required
                >
                  <option value="lifetime">Acceso de por vida</option>
                  <option value="3m">3 meses</option>
                  <option value="6m">6 meses</option>
                  <option value="12m">1 año</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección de descripción */}
          <div className="form-section">
            <h3>Course Description</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="short_description">Short Description *</label>
                <textarea
                  id="short_description"
                  name="short_description"
                  value={courseFormData.short_description || ""}
                  onChange={handleCourseInputChange}
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Full Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={courseFormData.description || ""}
                  onChange={handleCourseInputChange}
                  rows="6"
                  placeholder="Describe en detalle el contenido y objetivos del curso"
                  required
                ></textarea>
              </div>
            </div>
          </div>
          {/* 🔹 SECCIÓN DE HORARIO DE CLASES */}
          <div className="form-section">
            <h3>Class Schedule</h3>
            <div className="form-grid">
              {/* Checkbox días */}
              <div className="form-group full-width">
                <label>Class Days *</label>
                <div className="days-checkboxes">
                  {[
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                    "Domingo",
                  ].map((day) => (
                    <label key={day} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="live_class_days"
                        value={day}
                        checked={courseFormData.live_class_days.includes(day)}
                        onChange={handleCourseInputChange}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Horas */}
              <div className="form-group">
                <label htmlFor="live_class_start_time">Start Time *</label>
                <input
                  type="time"
                  id="live_class_start_time"
                  name="live_class_start_time"
                  value={courseFormData.live_class_start_time}
                  onChange={handleCourseInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="live_class_end_time">End Time *</label>
                <input
                  type="time"
                  id="live_class_end_time"
                  name="live_class_end_time"
                  value={courseFormData.live_class_end_time}
                  onChange={handleCourseInputChange}
                  required
                />
              </div>

              {/* Zona horaria */}
              <div className="form-group full-width">
                <label htmlFor="live_class_timezone">Time Zone</label>
                <select
                  id="live_class_timezone"
                  name="live_class_timezone"
                  value={courseFormData.live_class_timezone}
                  onChange={handleCourseInputChange}
                >
                  <option value="GMT-5">GMT-5 (Bogotá, Lima, CDMX)</option>
                  <option value="GMT-3">GMT-3 (Buenos Aires, São Paulo)</option>
                  <option value="GMT-8">GMT-8 (Los Angeles)</option>
                  <option value="GMT+1">GMT+1 (Madrid)</option>
                  <option value="GMT+9">GMT+9 (Tokyo)</option>
                </select>
              </div>
            </div>
          </div>
          {/* Sección de objetivos de aprendizaje */}
          <div className="form-section">
            <h3>What will students learn?</h3>
            <div className="form-group full-width">
              <div className="dynamic-list">
                <div className="list-items">
                  {learningObjectives.map((objective, index) => (
                    <div key={index} className="list-item">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) =>
                          handleLearningObjectiveChange(index, e.target.value)
                        }
                        placeholder="Ej: Crear componentes reutilizables en React"
                      />
                      {learningObjectives.length > 1 && (
                        <button
                          type="button"
                          className="remove-item-btn"
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
                  className="add-item-btn"
                  onClick={addLearningObjective}
                >
                  + Add Learning Objective
                </button>
              </div>
            </div>
          </div>

          {/* Sección de requisitos */}
          <div className="form-section">
            <h3>Course Requirements</h3>
            <div className="form-group full-width">
              <div className="dynamic-list">
                <div className="list-items">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="list-item">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) =>
                          handleRequirementChange(index, e.target.value)
                        }
                        placeholder="Ej: Conocimientos básicos de JavaScript"
                      />
                      {requirements.length > 1 && (
                        <button
                          type="button"
                          className="remove-item-btn"
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
                  className="add-item-btn"
                  onClick={addRequirement}
                >
                  + Add requirement
                </button>
              </div>
            </div>
          </div>
          {/* Sección de Módulos y Lecciones */}
          <div className="form-section">
            <h3>Modules and Lessons</h3>

            {modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="module-card">
                <div className="module-header">
                  <h4>Module {moduleIndex + 1}</h4>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      className="remove-module-btn"
                      onClick={() => removeModule(moduleIndex)}
                    >
                      × Remove Module
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Module Title *</label>
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) =>
                        updateModule(moduleIndex, "title", e.target.value)
                      }
                      placeholder="Ej: Introducción a React"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Module Description</label>
                    <textarea
                      value={module.description}
                      onChange={(e) =>
                        updateModule(moduleIndex, "description", e.target.value)
                      }
                      rows="3"
                      placeholder="Describe los objetivos de este módulo"
                    ></textarea>
                  </div>
                </div>

                <div className="lessons-container">
                  <h5>Lessons in this module</h5>

                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="lesson-card">
                      <div className="lesson-header">
                        <h6>Lesson {lessonIndex + 1}</h6>
                        {module.lessons.length > 1 && (
                          <button
                            type="button"
                            className="remove-lesson-btn"
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
                          <label>Lesson Title *</label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(
                                moduleIndex,
                                lessonIndex,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Ej: ¿Qué es React?"
                            required
                          />
                        </div>
                        <div className="form-group full-width">
                          <label>Lesson Description</label>
                          <textarea
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
                            placeholder="Breve descripción de esta lección"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="add-lesson-btn"
                    onClick={() => addLesson(moduleIndex)}
                  >
                    + Add Lesson
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-module-btn"
              onClick={addModule}
            >
              + Add Module
            </button>
          </div>
          {/* Sección de opciones adicionales */}
          <div className="form-section">
            <h3>Other options</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={courseFormData.is_published}
                    onChange={handleCourseInputChange}
                  />
                  <span>Publish course immediately</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setActiveView("courses")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={courseCreationStatus.loading}
            >
              {courseCreationStatus.loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    );
  };
  // Función para renderizar la lista de cursos existentes
  const renderCoursesList = () => {
    if (coursesLoading) {
      return <div className="loading">Cargando cursos...</div>;
    }

    if (coursesError) {
      return (
        <div className="error">
          Error: {coursesError}
          <button onClick={onRefreshCourses}>Reintentar</button>
        </div>
      );
    }

    return (
      <div className="courses-management">
        <div className="section-header">
          <h3>Courses</h3>
          <button onClick={onRefreshCourses} className="refresh-btn">
            Refresh
          </button>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {courses.map((course) => (
            <div key={course.id} className="col">
              <div className="grid-course-card">
                <div className="grid-course-image">
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.alt_text || course.title}
                      className="img-fluid w-100 h-100"
                    />
                  ) : (
                    <div className="course-image-placeholder">📚</div>
                  )}
                </div>

                <div className="grid-course-content">
                  <div className="mb-2">
                    <h3 className="grid-course-title">{course.title}</h3>
                    <p className="instructor-name">
                      Por {course.instructor || "Instructor"}
                    </p>
                  </div>

                  <p className="grid-course-description">
                    {course.short_description ||
                      course.description.substring(0, 100) + "..."}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="course-meta-info">
                      <span className="d-flex align-items-center">
                        <i className="far fa-clock me-1"></i>{" "}
                        {course.duration || "10h"}
                      </span>
                      <span className="d-flex align-items-center">
                        <i className="far fa-list-alt me-1"></i>{" "}
                        {course.lessons || 0} lecciones
                      </span>
                    </div>
                    <span
                      className={`level-badge badge ${course.level?.toLowerCase()}`}
                    >
                      {course.level || "BEGINNER"}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      <span className="price-container">
                        ${course.discount_price}
                      </span>
                      {course.price > 0 && (
                        <span className="original-price">${course.price}</span>
                      )}
                    </div>
                    <div className="course-actions">
                      <button
                        className="btn btn-primary btn-sm btn-enroll"
                        onClick={() => onViewCourseDetails(course)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onEditCourse(course)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => onDeleteCourse(course.id)}
                        title="Eliminar curso"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Estado de publicación */}
                  <div className="mt-2">
                    <span
                      className={`status ${
                        course.is_published ? "published" : "draft"
                      }`}
                    >
                      {course.is_published ? "📢 Publicado" : "📝 Borrador"}
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
  // Renderizado del header
  const renderHeader = () => {
    const titles = {
      dashboard: "Administration Panel",
      users: "User Management",
      courses: "Course Management",
      settings: "System Settings",
    };

    const descriptions = {
      dashboard: "Welcome to the main control panel",
      courses: "Manage the available courses",
      settings: "Configure the system settings",
    };

    return (
      <div className="admin-header">
        <h1>{titles[activeView] || "Panel"}</h1>
        <p>{descriptions[activeView] || ""}</p>
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
          <div>View in development</div>
        )}
      </div>
    </div>
  );
};
