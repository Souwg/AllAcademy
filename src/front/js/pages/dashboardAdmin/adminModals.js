import React from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiUser,
  FiAlertTriangle,
} from "react-icons/fi";
import "../../../styles/adminModals.css";

export const AdminModals = ({
  showModal,
  setShowModal,
  selectedUser,
  showDeleteModal,
  setShowDeleteModal,
  userToDelete,
  deleteStatus,
  handleDeleteUser,
  handleRoleChange,
  notification,
  setNotification,
  showCourseDetails,
  setShowCourseDetails,
  selectedCourse,
  setSelectedUser,
  handleSaveUser,
  showEditCourseModal,
  setShowEditCourseModal,
  courseToEdit,
  setCourseToEdit,
  handleUpdateCourse,
  teachers,
}) => {
  // Función para cerrar notificación
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  // Función para obtener nombre del rol
  const getRoleDisplayName = (role) => {
    const roles = {
      admin: "Admin",
      teacher: "Teacher",
      student: "Student",
    };
    return roles[role] || "User";
  };

  return (
    <>
      {/* Modal de edición de usuario */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <FiUser className="modal-icon" />
                Edit User
              </h2>
              <button
                className="close-modal"
                onClick={() => setShowModal(false)}
                aria-label="Close Modal"
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveUser(selectedUser);
                }}
                className="user-edit-form"
              >
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={selectedUser.first_name || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={selectedUser.last_name || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={selectedUser.country || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        country: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>ID / Document</label>
                  <input
                    type="text"
                    value={selectedUser.id_number || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        id_number: e.target.value,
                      })
                    }
                  />
                </div>
                {selectedUser.role === "teacher" && (
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={selectedUser.bio || ""}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          bio: e.target.value,
                        })
                      }
                      rows="4"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={selectedUser.role || "student"}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
                  >
                    <option value="admin">Administrador</option>
                    <option value="teacher">Profesor</option>
                    <option value="student">Estudiante</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && userToDelete && (
        <div
          className="modal-overlay"
          onClick={() => !deleteStatus.loading && setShowDeleteModal(false)}
        >
          <div
            className="modal-content confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header warning">
              <h2>Confirm Delete</h2>
              <button
                className="close-modal"
                onClick={() =>
                  !deleteStatus.loading && setShowDeleteModal(false)
                }
                disabled={deleteStatus.loading}
                aria-label="Cerrar modal"
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <p className="delete-confirm-text">
                Are you sure you want to permanently delete the user:
              </p>

              <div className="user-to-delete">
                <div className="user-avatar">
                  {userToDelete.first_name?.charAt(0) || "U"}
                </div>
                <div className="user-info">
                  <strong>
                    {userToDelete.first_name} {userToDelete.last_name}
                  </strong>
                  <span>{userToDelete.email}</span>
                </div>
              </div>

              <p className="warning-message">
                <i className="fa-solid fa-triangle-exclamation modal-icon"></i>{" "}
                This action cannot be undone!
              </p>

              {deleteStatus.error && (
                <div className="error-message">
                  <FiXCircle /> {deleteStatus.error}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteStatus.loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-confirm-delete"
                  onClick={handleDeleteUser}
                  disabled={deleteStatus.loading}
                >
                  {deleteStatus.loading ? (
                    <span className="loading-delete">
                      <span className="spinner"></span>
                      Deleting...
                    </span>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación flotante */}
      {notification.show && (
        <div
          className={`notification ${notification.type}`}
          aria-live="polite"
          role="status"
        >
          <div className="notification-content">
            {notification.type === "success" ? (
              <FiCheckCircle className="notification-icon" />
            ) : (
              <FiXCircle className="notification-icon" />
            )}
            <span>{notification.message}</span>
            <button
              className="close-notification"
              onClick={closeNotification}
              aria-label="Close Notification"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles del curso */}
      {showCourseDetails && selectedCourse && (
        <div
          className="modal-overlay"
          onClick={() => setShowCourseDetails(false)}
        >
          <div
            className="modal-content course-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-book modal-icon"></i>
                Course Details
              </h2>
              <button
                className="close-modal"
                onClick={() => setShowCourseDetails(false)}
                aria-label="Cerrar modal"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="course-details-header">
                {selectedCourse.image_url ? (
                  <img
                    src={selectedCourse.image_url}
                    alt={selectedCourse.alt_text || selectedCourse.title}
                    className="course-detail-image"
                  />
                ) : (
                  <div className="course-image-placeholder-large">📚</div>
                )}
                <div className="course-basic-info">
                  <h3>{selectedCourse.title}</h3>
                  <p className="course-short-description">
                    {selectedCourse.short_description}
                  </p>
                  <div className="course-meta">
                    <span
                      className={`level-badge ${selectedCourse.level?.toLowerCase()}`}
                    >
                      {selectedCourse.level || "BEGINNER"}
                    </span>
                    <span className="language-badge">
                      {selectedCourse.language || "Spanish"}
                    </span>
                    <span className="duration-badge">
                      {selectedCourse.duration || "none hours"}
                    </span>
                    <span className="access-badge">
                      {selectedCourse.access_duration === "lifetime"
                        ? "Lifetime Access"
                        : selectedCourse.access_duration === "3m"
                        ? "3 Months Access"
                        : selectedCourse.access_duration === "6m"
                        ? "6 Months Access"
                        : selectedCourse.access_duration === "12m"
                        ? "1 Year Access"
                        : selectedCourse.access_duration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="course-details-content">
                <div className="detail-section">
                  <h4>Teacher</h4>
                  <div className="instructor-info">
                    <div className="instructor-details">
                      <p>
                        <strong>{selectedCourse.instructor}</strong>
                      </p>
                      {selectedCourse.instructorBio ? (
                        <p className="instructor-bio">
                          {selectedCourse.instructorBio}
                        </p>
                      ) : (
                        <p className="instructor-bio empty">
                          This teacher does not have a bio yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Price</h4>
                  <div className="price-details">
                    {selectedCourse.discount_price &&
                    selectedCourse.discount_price > 0 ? (
                      <>
                        <span className="price">
                          ${selectedCourse.discount_price}
                        </span>
                        <span className="discount-price">
                          ${selectedCourse.price}
                        </span>
                      </>
                    ) : (
                      <span className="price">${selectedCourse.price}</span>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Access Duration</h4>
                  <p>
                    {selectedCourse.access_duration === "lifetime"
                      ? "Lifetime Access"
                      : selectedCourse.access_duration === "3m"
                      ? "3 Months"
                      : selectedCourse.access_duration === "6m"
                      ? "6 Months"
                      : selectedCourse.access_duration === "12m"
                      ? "1 Year"
                      : selectedCourse.access_duration}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Learning Objectives</h4>
                  <ul className="learning-objectives">
                    {selectedCourse.what_you_learn?.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Requirements</h4>
                  <ul className="requirements">
                    {selectedCourse.requirements?.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
                {selectedCourse.schedules &&
                  selectedCourse.schedules.length > 0 && (
                    <div className="detail-section">
                      <h4>Class Schedules</h4>
                      <ul className="schedules-list">
                        {selectedCourse.schedules.map((schedule, index) => (
                          <li key={index}>
                            <strong>
                              {schedule.group_name || `Group ${index + 1}`}
                            </strong>
                            <span>
                              <i className="fa-solid fa-calendar-days"></i>
                              {schedule.day_of_week || "No days set"}
                            </span>
                            <span>
                              <i className="fa-regular fa-clock"></i>
                              {schedule.start_time} - {schedule.end_time} (
                              {schedule.timezone})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="detail-section">
                  <h4>Modules and Lessons</h4>
                  {selectedCourse.modules?.length > 0 ? (
                    <div className="modules-list">
                      {selectedCourse.modules.map((module, index) => (
                        <div key={index} className="module-item">
                          <h5>
                            Module {index + 1}: {module.title}
                          </h5>
                          <p>{module.description}</p>
                          {module.lessons?.length > 0 && (
                            <div className="lessons-list">
                              <h6>Lessons ({module.lessons.length})</h6>
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="lesson-item">
                                  <span className="lesson-order">
                                    {lessonIndex + 1}.
                                  </span>
                                  <span className="lesson-title">
                                    {lesson.title}
                                  </span>
                                  {lesson.duration > 0 && (
                                    <span className="lesson-duration">
                                      {lesson.duration} min
                                    </span>
                                  )}
                                  {lesson.is_preview && (
                                    <span className="preview-badge">
                                      Preview
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No modules have been defined for this course.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditCourseModal && courseToEdit && (
        <div
          className="modal-overlay"
          onClick={() => setShowEditCourseModal(false)}
        >
          <div
            className="modal-content course-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-pen-to-square modal-icon"></i>
                Edit Course
              </h2>
              <button
                className="close-modal"
                onClick={() => setShowEditCourseModal(false)}
                aria-label="Cerrar modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateCourse(courseToEdit);
                }}
              >
                {/* === BASIC INFO === */}
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={courseToEdit.title || ""}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Short Description</label>
                  <textarea
                    value={courseToEdit.short_description || ""}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        short_description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Long Description</label>
                  <textarea
                    value={courseToEdit.description || ""}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        description: e.target.value,
                      })
                    }
                    rows="5"
                  />
                </div>

                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={courseToEdit.level || "BEGINNER"}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        level: e.target.value,
                      })
                    }
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={courseToEdit.language || "Spanish"}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        language: e.target.value,
                      })
                    }
                  >
                    <option value="Spanish">Spanish</option>
                    <option value="English">English</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                </div>

                {/* === TEACHER === */}
                <div className="form-group">
                  <label>Teacher</label>
                  <select
                    value={courseToEdit.teacher_id || ""}
                    onChange={(e) => {
                      const newTeacherId = parseInt(e.target.value);
                      const selectedTeacher = teachers.find(
                        (t) => t.id === newTeacherId
                      );

                      setCourseToEdit({
                        ...courseToEdit,
                        teacher_id: newTeacherId,
                        instructor: selectedTeacher
                          ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}`
                          : "",
                        instructorBio: selectedTeacher
                          ? selectedTeacher.bio
                          : "",
                      });
                    }}
                  >
                    <option value="">-- Select a teacher --</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group ">
                  <label>Teacher Bio</label>
                  <textarea
                    value={
                      courseToEdit.instructorBio ||
                      "This teacher has no bio yet."
                    }
                    disabled
                    className="teacher-bio"
                  />
                </div>

                <div className="form-group">
                  <label>Access Duration</label>
                  <select
                    value={courseToEdit.access_duration || "lifetime"}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        access_duration: e.target.value,
                      })
                    }
                  >
                    <option value="lifetime">Lifetime Access</option>
                    <option value="3m">3 Months Access</option>
                    <option value="6m">6 Months Access</option>
                    <option value="12m">1 Year Access</option>
                  </select>
                </div>

                {/* === PRICES === */}
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={courseToEdit.price || ""}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Discount Price</label>
                  <input
                    type="number"
                    value={courseToEdit.discount_price || ""}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        discount_price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* === LISTS === */}
                <div className="form-group">
                  <label>What they will learn</label>
                  {courseToEdit.what_you_learn?.map((obj, index) => (
                    <div key={index} className="list-item">
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => {
                          const updated = [...courseToEdit.what_you_learn];
                          updated[index] = e.target.value;
                          setCourseToEdit({
                            ...courseToEdit,
                            what_you_learn: updated,
                          });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCourseToEdit({
                            ...courseToEdit,
                            what_you_learn: courseToEdit.what_you_learn.filter(
                              (_, i) => i !== index
                            ),
                          });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setCourseToEdit({
                        ...courseToEdit,
                        what_you_learn: [
                          ...(courseToEdit.what_you_learn || []),
                          "",
                        ],
                      })
                    }
                  >
                    + Add Learning Goal
                  </button>
                </div>

                <div className="form-group">
                  <label>Requirements</label>
                  {courseToEdit.requirements?.map((req, index) => (
                    <div key={index} className="list-item">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const updated = [...courseToEdit.requirements];
                          updated[index] = e.target.value;
                          setCourseToEdit({
                            ...courseToEdit,
                            requirements: updated,
                          });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCourseToEdit({
                            ...courseToEdit,
                            requirements: courseToEdit.requirements.filter(
                              (_, i) => i !== index
                            ),
                          });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setCourseToEdit({
                        ...courseToEdit,
                        requirements: [
                          ...(courseToEdit.requirements || []),
                          "",
                        ],
                      })
                    }
                  >
                    + Add Requirement
                  </button>
                </div>

                {/* === SCHEDULES / HORARIOS === */}
                <div className="form-group">
                  <label>Class Schedules (Groups)</label>
                  {courseToEdit.schedules?.map((schedule, index) => (
                    <div key={index} className="schedule-item">
                      <input
                        type="text"
                        placeholder="Group name"
                        value={schedule.group_name || ""}
                        onChange={(e) => {
                          const updated = [...courseToEdit.schedules];
                          updated[index].group_name = e.target.value;
                          setCourseToEdit({
                            ...courseToEdit,
                            schedules: updated,
                          });
                        }}
                      />

                      {/* Selección de días */}
                      <div className="days-selector">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <label key={day}>
                            <input
                              type="checkbox"
                              checked={schedule.days?.includes(day)}
                              onChange={() => {
                                const updated = [...courseToEdit.schedules];
                                const days = updated[index].days;
                                updated[index].days = days.includes(day)
                                  ? days.filter((d) => d !== day)
                                  : [...days, day];
                                setCourseToEdit({
                                  ...courseToEdit,
                                  schedules: updated,
                                });
                              }}
                            />
                            {day}
                          </label>
                        ))}
                      </div>

                      <input
                        type="time"
                        value={schedule.start_time || ""}
                        onChange={(e) => {
                          const updated = [...courseToEdit.schedules];
                          updated[index].start_time = e.target.value;
                          setCourseToEdit({
                            ...courseToEdit,
                            schedules: updated,
                          });
                        }}
                      />

                      <input
                        type="time"
                        value={schedule.end_time || ""}
                        onChange={(e) => {
                          const updated = [...courseToEdit.schedules];
                          updated[index].end_time = e.target.value;
                          setCourseToEdit({
                            ...courseToEdit,
                            schedules: updated,
                          });
                        }}
                      />

                      <select
                        value={schedule.timezone || "GMT-5"}
                        onChange={(e) => {
                          const updated = [...courseToEdit.schedules];
                          updated[index].timezone = e.target.value;
                          setCourseToEdit({
                            ...courseToEdit,
                            schedules: updated,
                          });
                        }}
                      >
                        <option value="GMT-5">GMT-5</option>
                        <option value="GMT-4">GMT-4</option>
                        <option value="GMT-3">GMT-3</option>
                      </select>

                      <button
                        type="button"
                        className="remove-item-btn-edit-modal"
                        onClick={() => {
                          setCourseToEdit({
                            ...courseToEdit,
                            schedules: courseToEdit.schedules.filter(
                              (_, i) => i !== index
                            ),
                          });
                        }}
                      >
                        Remove Schedule
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="add-module-btn-edit-modal"
                    onClick={() =>
                      setCourseToEdit({
                        ...courseToEdit,
                        schedules: [
                          ...(courseToEdit.schedules || []),
                          {
                            days: [],
                            start_time: "",
                            end_time: "",
                            timezone: "GMT-5",
                            group_name: "",
                          },
                        ],
                      })
                    }
                  >
                    + Add Schedule
                  </button>
                </div>

                {/* === MODULES & LESSONS === */}
                <div className="form-group">
                  <label>Modules</label>
                  {courseToEdit.modules?.map((module, mIndex) => (
                    <div key={mIndex} className="module-edit">
                      <h5>Module {mIndex + 1}</h5>
                      <input
                        type="text"
                        placeholder="Module title"
                        value={module.title}
                        onChange={(e) => {
                          const updatedModules = [...courseToEdit.modules];
                          updatedModules[mIndex].title = e.target.value;
                          setCourseToEdit({
                            ...courseToEdit,
                            modules: updatedModules,
                          });
                        }}
                      />
                      <textarea
                        placeholder="Module description"
                        value={module.description}
                        onChange={(e) => {
                          const updatedModules = [...courseToEdit.modules];
                          updatedModules[mIndex].description = e.target.value;
                          setCourseToEdit({
                            ...courseToEdit,
                            modules: updatedModules,
                          });
                        }}
                      />

                      {/* === LESSONS === */}
                      <h6>Lessons</h6>
                      {[...(module.lessons || [])]
                        .sort((a, b) => {
                          const ao =
                            typeof a.order === "number"
                              ? a.order
                              : Number.MAX_SAFE_INTEGER;
                          const bo =
                            typeof b.order === "number"
                              ? b.order
                              : Number.MAX_SAFE_INTEGER;
                          if (ao !== bo) return ao - bo;
                          const ac = a.created_at ?? 0;
                          const bc = b.created_at ?? 0;
                          return ac - bc; // más viejo primero, más nuevo al final
                        })
                        .map((lesson, lIndex) => (
                          <div key={lIndex} className="lesson-edit">
                            <input
                              type="text"
                              placeholder="Lesson title"
                              value={lesson.title}
                              onChange={(e) => {
                                const updatedModules = [
                                  ...courseToEdit.modules,
                                ];
                                updatedModules[mIndex].lessons[lIndex].title =
                                  e.target.value;
                                setCourseToEdit({
                                  ...courseToEdit,
                                  modules: updatedModules,
                                });
                              }}
                            />
                            <button
                              type="button"
                              className="remove-item-btn-edit-modal"
                              onClick={() => {
                                const updatedModules = [
                                  ...courseToEdit.modules,
                                ];
                                updatedModules[mIndex].lessons.splice(
                                  lIndex,
                                  1
                                );
                                setCourseToEdit({
                                  ...courseToEdit,
                                  modules: updatedModules,
                                });
                              }}
                            >
                              Remove Lesson
                            </button>
                          </div>
                        ))}

                      <button
                        type="button"
                        className="add-lesson-btn-edit-modal"
                        onClick={() => {
                          setCourseToEdit((prev) => {
                            const updatedModules = [...prev.modules];
                            const currLessons =
                              updatedModules[mIndex].lessons || [];

                            // próximo "order" (último + 1; robusto si faltan orders)
                            const nextOrder =
                              currLessons.length > 0
                                ? Math.max(
                                    ...currLessons.map((l) =>
                                      typeof l.order === "number" ? l.order : 0
                                    )
                                  ) + 1
                                : 1;

                            const newLesson = {
                              title: "",
                              order: nextOrder,
                              created_at: Date.now(),
                            };

                            updatedModules[mIndex] = {
                              ...updatedModules[mIndex],
                              lessons: [...currLessons, newLesson], // 👈 añade al FINAL
                            };

                            return { ...prev, modules: updatedModules };
                          });
                        }}
                      >
                        + Add Lesson
                      </button>

                      {/* Remove Module */}
                      <button
                        type="button"
                        className="remove-module-btn-edit-modal"
                        onClick={() => {
                          setCourseToEdit({
                            ...courseToEdit,
                            modules: courseToEdit.modules.filter(
                              (_, i) => i !== mIndex
                            ),
                          });
                        }}
                      >
                        Remove Module
                      </button>
                    </div>
                  ))}

                  {/* Add Module Button */}
                  <button
                    type="button"
                    className="add-module-btn-edit-modal"
                    onClick={() =>
                      setCourseToEdit({
                        ...courseToEdit,
                        modules: [
                          ...(courseToEdit.modules || []),
                          { title: "", description: "", lessons: [] },
                        ],
                      })
                    }
                  >
                    + Add Module
                  </button>
                </div>
                {/* === PUBLICATION STATUS === */}
                <div className="form-group">
                  <label>Publication Status</label>
                  <select
                    value={courseToEdit.is_published ? "true" : "false"}
                    onChange={(e) =>
                      setCourseToEdit({
                        ...courseToEdit,
                        is_published: e.target.value === "true",
                      })
                    }
                  >
                    <option value="false">Draft (Not Published)</option>
                    <option value="true">Published</option>
                  </select>
                </div>

                {/* === ACTION BUTTONS === */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEditCourseModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
