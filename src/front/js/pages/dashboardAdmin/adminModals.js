import React from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiUser,
  FiAlertTriangle,
  FiBook,
} from "react-icons/fi";

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
      admin: "Administrador",
      teacher: "Profesor",
      student: "Estudiante",
    };
    return roles[role] || "Usuario";
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
                Editar Usuario
              </h2>
              <button
                className="close-modal"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar modal"
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
                  <label>Nombre</label>
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
                  <label>Apellido</label>
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
                  <label>País</label>
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
                  <label>ID / Documento</label>
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

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={selectedUser.bio || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, bio: e.target.value })
                    }
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Rol</label>
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
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Guardar Cambios
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
              <FiAlertTriangle className="modal-icon" />
              <h2>Confirmar Eliminación</h2>
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
                ¿Estás seguro de eliminar permanentemente al usuario:
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
                <FiAlertTriangle /> Esta acción no se puede deshacer
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
                  Cancelar
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
                      Eliminando...
                    </span>
                  ) : (
                    "Confirmar Eliminación"
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
              aria-label="Cerrar notificación"
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
                <FiBook className="modal-icon" />
                Course Details
              </h2>
              <button
                className="close-modal"
                onClick={() => setShowCourseDetails(false)}
                aria-label="Cerrar modal"
              >
                <FiX />
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
                          Este profesor aún no tiene bio.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Precio</h4>
                  <div className="price-details">
                    <span className="price">
                      ${selectedCourse.discount_price}
                    </span>
                    {selectedCourse.price > 0 && (
                      <span className="discount-price">
                        ${selectedCourse.price}
                      </span>
                    )}
                  </div>
                </div>
                <div className="detail-section">
                  <h4>Tiempo de Acceso</h4>
                  <p>
                    {selectedCourse.access_duration === "lifetime"
                      ? "Acceso de por vida"
                      : selectedCourse.access_duration === "3m"
                      ? "3 meses"
                      : selectedCourse.access_duration === "6m"
                      ? "6 meses"
                      : selectedCourse.access_duration === "12m"
                      ? "1 año"
                      : selectedCourse.access_duration}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Lo que aprenderán</h4>
                  <ul className="learning-objectives">
                    {selectedCourse.what_you_learn?.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Requisitos</h4>
                  <ul className="requirements">
                    {selectedCourse.requirements?.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
                <div className="detail-section">
                  <h4>Módulos y Lecciones</h4>
                  {selectedCourse.modules?.length > 0 ? (
                    <div className="modules-list">
                      {selectedCourse.modules.map((module, index) => (
                        <div key={index} className="module-item">
                          <h5>
                            Módulo {index + 1}: {module.title}
                          </h5>
                          <p>{module.description}</p>
                          {module.lessons?.length > 0 && (
                            <div className="lessons-list">
                              <h6>Lecciones ({module.lessons.length})</h6>
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
                                      Vista previa
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
                    <p>No hay módulos definidos para este curso.</p>
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
              <h2>Edit Course</h2>
              <button
                className="close-modal"
                onClick={() => setShowEditCourseModal(false)}
              >
                <FiX />
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
                      {module.lessons?.map((lesson, lIndex) => (
                        <div key={lIndex} className="lesson-edit">
                          <input
                            type="text"
                            placeholder="Lesson title"
                            value={lesson.title}
                            onChange={(e) => {
                              const updatedModules = [...courseToEdit.modules];
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
                            className="remove-item-btn"
                            onClick={() => {
                              const updatedModules = [...courseToEdit.modules];
                              updatedModules[mIndex].lessons.splice(lIndex, 1);
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
                        className="add-lesson-btn"
                        onClick={() => {
                          const updatedModules = [...courseToEdit.modules];
                          updatedModules[mIndex].lessons = [
                            ...(updatedModules[mIndex].lessons || []),
                            { title: "" },
                          ];
                          setCourseToEdit({
                            ...courseToEdit,
                            modules: updatedModules,
                          });
                        }}
                      >
                        + Add Lesson
                      </button>

                      {/* Remove Module */}
                      <button
                        type="button"
                        className="remove-module-btn"
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
                    className="add-module-btn"
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
