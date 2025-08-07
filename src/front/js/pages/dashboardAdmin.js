import React, { useState, useEffect } from "react";
import "../../styles/dashboardAdmin.css";

export const DashboardAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        console.log("Token que se enviará:", token); // Debug

        const response = await fetch("http://localhost:3001/api/admin/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // Si el backend devuelve un mensaje de error, usarlo
          throw new Error(data.msg || "Error al obtener usuarios");
        }

        setUsers(data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError(err.message);

        // Si es error 401, podrías redirigir al login
        if (
          err.message.includes("401") ||
          err.message.includes("No autorizado")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Opcional: redirigir al login
          // window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-alert">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <h2>Panel de Administración</h2>
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>País</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.country}</td>
                <td>{user.is_admin ? "Admin" : "Usuario"}</td>
                <td>
                  <button
                    className="details-btn"
                    onClick={() => handleShowDetails(user)}
                  >
                    Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles del usuario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Detalles del Usuario</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedUser && (
                <div className="user-details">
                  <p>
                    <strong>ID:</strong> {selectedUser.id}
                  </p>
                  <p>
                    <strong>Nombre:</strong> {selectedUser.first_name}{" "}
                    {selectedUser.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>País:</strong> {selectedUser.country}
                  </p>
                  <p>
                    <strong>Número de ID:</strong> {selectedUser.id_number}
                  </p>
                  <p>
                    <strong>Rol:</strong>{" "}
                    {selectedUser.is_admin ? "Administrador" : "Usuario normal"}
                  </p>
                  <p>
                    <strong>Fecha de creación:</strong>{" "}
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-btn" onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
