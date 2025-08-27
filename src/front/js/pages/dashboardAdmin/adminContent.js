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
}) => {
  // Función para renderizar la tabla de usuarios
  const renderUserTable = (usersToRender) => {
    if (usersToRender.length === 0) {
      return (
        <div className="empty-state">
          <span>📭</span>
          <p>No se encontraron usuarios</p>
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
          <h2>Crear Nuevo Curso</h2>
          <p>
            Completa la información para crear un nuevo curso en la plataforma
          </p>
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
            <h3>Información Básica</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="title">Título del Curso *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={courseFormData.title}
                  onChange={handleCourseInputChange}
                  placeholder="Ej: Introducción a React JS"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Precio ($) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={courseFormData.price}
                  onChange={handleCourseInputChange}
                  min="0"
                  step="0.01"
                  placeholder="29.99"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="discount_price">Precio con Descuento ($)</label>
                <input
                  type="number"
                  id="discount_price"
                  name="discount_price"
                  value={courseFormData.discount_price}
                  onChange={handleCourseInputChange}
                  min="0"
                  step="0.01"
                  placeholder="19.99"
                />
              </div>

              <div className="form-group">
                <label htmlFor="level">Nivel *</label>
                <select
                  id="level"
                  name="level"
                  value={courseFormData.level}
                  onChange={handleCourseInputChange}
                  required
                >
                  <option value="BEGINNER">Principiante</option>
                  <option value="INTERMEDIATE">Intermedio</option>
                  <option value="ADVANCED">Avanzado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="language">Idioma *</label>
                <select
                  id="language"
                  name="language"
                  value={courseFormData.language}
                  onChange={handleCourseInputChange}
                  required
                >
                  <option value="Spanish">Español</option>
                  <option value="English">Inglés</option>
                  <option value="Portuguese">Portugués</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección de descripción */}
          <div className="form-section">
            <h3>Descripción del Curso</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="short_description">Descripción Corta *</label>
                <textarea
                  id="short_description"
                  name="short_description"
                  value={courseFormData.short_description}
                  onChange={handleCourseInputChange}
                  rows="3"
                  placeholder="Breve descripción que aparecerá en la lista de cursos"
                  required
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Descripción Completa *</label>
                <textarea
                  id="description"
                  name="description"
                  value={courseFormData.description}
                  onChange={handleCourseInputChange}
                  rows="6"
                  placeholder="Describe en detalle el contenido y objetivos del curso"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Sección de imagen */}
          <div className="form-section">
            <h3>Imagen del Curso</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="image_url">URL de la Imagen</label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={courseFormData.image_url}
                  onChange={handleCourseInputChange}
                  placeholder="https://ejemplo.com/imagen-curso.jpg"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="alt_text">
                  Texto Alternativo para la Imagen
                </label>
                <input
                  type="text"
                  id="alt_text"
                  name="alt_text"
                  value={courseFormData.alt_text}
                  onChange={handleCourseInputChange}
                  placeholder="Descripción de la imagen para accesibilidad"
                />
              </div>
            </div>
          </div>

          {/* Sección de objetivos de aprendizaje */}
          <div className="form-section">
            <h3>¿Qué aprenderán los estudiantes?</h3>
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
                  + Agregar objetivo de aprendizaje
                </button>
              </div>
            </div>
          </div>

          {/* Sección de requisitos */}
          <div className="form-section">
            <h3>Requisitos del Curso</h3>
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
                  + Agregar requisito
                </button>
              </div>
            </div>
          </div>

          {/* Sección de opciones adicionales */}
          <div className="form-section">
            <h3>Opciones Adicionales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="certificate_available"
                    name="certificate_available"
                    checked={courseFormData.certificate_available}
                    onChange={handleCourseInputChange}
                  />
                  <span>Incluir certificado de finalización</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={courseFormData.is_published}
                    onChange={handleCourseInputChange}
                  />
                  <span>Publicar curso inmediatamente</span>
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
              Cancelar
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleCreateCourse(true)}
              disabled={courseCreationStatus.loading}
            >
              {courseCreationStatus.loading
                ? "Guardando..."
                : "Guardar como borrador"}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={courseCreationStatus.loading}
            >
              {courseCreationStatus.loading ? "Creando..." : "Crear Curso"}
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
          <h3>Cursos Existentes</h3>
          <button onClick={onRefreshCourses} className="refresh-btn">
            Actualizar
          </button>
        </div>

        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-image">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.alt_text || course.title}
                  />
                ) : (
                  <div className="course-image-placeholder">📚</div>
                )}
              </div>

              <div className="course-info">
                <h4>{course.title}</h4>
                <p className="course-description">{course.short_description}</p>

                <div className="course-meta">
                  <span
                    className={`status ${
                      course.is_published ? "published" : "draft"
                    }`}
                  >
                    {course.is_published ? "📢 Publicado" : "📝 Borrador"}
                  </span>
                  <span className="price">${course.price}</span>
                  {course.discount_price > 0 && (
                    <span className="discount">${course.discount_price}</span>
                  )}
                </div>

                <div className="course-actions">
                  <button className="btn-edit">Editar</button>
                  <button className="btn-view">Ver detalles</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="empty-state">
            <p>No hay cursos creados todavía</p>
          </div>
        )}
      </div>
    );
  };

  // Renderizado del header
  const renderHeader = () => {
    const titles = {
      dashboard: "Panel de Administración",
      users: "Gestión de Usuarios",
      courses: "Gestión de Cursos",
      settings: "Configuración del Sistema",
    };

    const descriptions = {
      dashboard: "Bienvenido al panel de control principal",
      courses: "Administra los cursos disponibles",
      settings: "Configura los parámetros del sistema",
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
            {renderCourseCreation()} {/* Formulario de creación */}
            {renderCoursesList()} {/* Lista de cursos existentes */}
          </div>
        ) : (
          <div>Vista en desarrollo</div>
        )}
      </div>
    </div>
  );
};
