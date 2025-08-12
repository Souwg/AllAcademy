import React from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiUser,
  FiAlertTriangle,
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
              <div className="user-profile">
                <div className="profile-avatar">
                  {selectedUser.first_name?.charAt(0) || "U"}
                </div>
                <div className="profile-info">
                  <h3>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <span className={`user-role ${selectedUser.role}`}>
                    {getRoleDisplayName(selectedUser.role)}
                  </span>
                </div>
              </div>

              <div className="user-details-grid">
                {["id", "email", "country", "created_at"].map((field) => (
                  <div key={field} className="detail-item">
                    <label>
                      {field === "created_at"
                        ? "Fecha de registro"
                        : field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <p>
                      {field === "created_at"
                        ? new Date(selectedUser[field]).toLocaleDateString()
                        : selectedUser[field] || "N/A"}
                    </p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => handleRoleChange(e, selectedUser)}
                className="role-form"
              >
                <div className="form-group">
                  <label>Cambiar Rol:</label>
                  <select
                    defaultValue={selectedUser.role || "user"}
                    className="role-select"
                    name="role" // Añade name
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
    </>
  );
};
