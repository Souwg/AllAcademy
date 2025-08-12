import React, { useState, useEffect } from "react";
import { FiHome, FiUsers, FiBook, FiSettings, FiSearch } from "react-icons/fi";
import "../../styles/dashboardAdmin.css";

export const DashboardAdmin = () => {
  // 1. ESTADOS
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");

  // Nuevos estados para las pestañas y búsquedas
  const [activeTab, setActiveTab] = useState("admins");
  const [searchAdmins, setSearchAdmins] = useState("");
  const [searchTeachers, setSearchTeachers] = useState("");
  const [searchStudents, setSearchStudents] = useState("");

  // 2. EFECTOS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay token de autenticación");

        const response = await fetch("http://localhost:3001/api/admin/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.msg || "Error al obtener usuarios");

        setUsers(data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError(err.message);
        if (
          err.message.includes("401") ||
          err.message.includes("No autorizado")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 3. FUNCIONES AUXILIARES
  const getUserStats = () => ({
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    students: users.filter((u) => u.role === "student").length,
    regular: users.filter((u) => u.role === "user" || !u.role).length,
  });

  // Filtros por rol y búsqueda
  const filteredAdmins = users
    .filter((user) => user.role === "admin")
    .filter((user) =>
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(searchAdmins.toLowerCase())
    );

  const filteredTeachers = users
    .filter((user) => user.role === "teacher")
    .filter((user) =>
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(searchTeachers.toLowerCase())
    );

  const filteredStudents = users
    .filter((user) => user.role === "student")
    .filter((user) =>
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(searchStudents.toLowerCase())
    );

  const handleRoleChange = async (e, user) => {
    e.preventDefault();
    const selectedRole = e.target.value;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/admin/users/${user.id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: selectedRole }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error al actualizar rol");
      window.location.reload();
    } catch (err) {
      console.error("Error al actualizar rol:", err);
    }
  };

  // 4. FUNCIONES DE RENDERIZADO
  const renderLoading = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
  );

  const renderError = () => (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">⚠️</div>
        <h3>Error al cargar los datos</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Intentar nuevamente
        </button>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="admin-sidebar">
      <ul className="sidebar-menu">
        {[
          { view: "dashboard", icon: <FiHome />, label: "Inicio" },
          { view: "users", icon: <FiUsers />, label: "Usuarios" },
          { view: "courses", icon: <FiBook />, label: "Cursos" },
          { view: "settings", icon: <FiSettings />, label: "Configuración" },
        ].map((item) => (
          <li
            key={item.view}
            className={`menu-item ${activeView === item.view ? "active" : ""}`}
            onClick={() => setActiveView(item.view)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderHeader = () => {
    const titles = {
      dashboard: "Panel de Administración",
      users: "Gestión de Usuarios",
      courses: "Gestión de Cursos",
      settings: "Configuración del Sistema",
    };

    const descriptions = {
      dashboard: "Bienvenido al panel de control principal",
      users: `Total usuarios: ${getUserStats().total} (Admins: ${
        getUserStats().admins
      }, Profesores: ${getUserStats().teachers}, Estudiantes: ${
        getUserStats().students
      })`,
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

  const renderStatCard = (label, value) => (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );

  const renderDashboardView = () => (
    <div className="admin-controls">
      <div className="stats-container">
        {renderStatCard("Total Usuarios", getUserStats().total)}
        {renderStatCard("Administradores", getUserStats().admins)}
        {renderStatCard("Profesores", getUserStats().teachers)}
        {renderStatCard("Estudiantes", getUserStats().students)}
        {renderStatCard("Usuarios Regulares", getUserStats().regular)}
      </div>
    </div>
  );

  const renderUsersView = () => (
    <>
      <div className="admin-controls">
        <div className="stats-container">
          {renderStatCard("Total", getUserStats().total)}
          {renderStatCard("Admins", getUserStats().admins)}
          {renderStatCard("Profesores", getUserStats().teachers)}
          {renderStatCard("Estudiantes", getUserStats().students)}
        </div>
      </div>

      {/* Sistema de pestañas */}
      <div className="users-tabs-container">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "admins" ? "active" : ""}`}
              onClick={() => setActiveTab("admins")}
            >
              Administradores ({getUserStats().admins})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "teachers" ? "active" : ""}`}
              onClick={() => setActiveTab("teachers")}
            >
              Profesores ({getUserStats().teachers})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "students" ? "active" : ""}`}
              onClick={() => setActiveTab("students")}
            >
              Estudiantes ({getUserStats().students})
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {/* Buscador específico para cada pestaña */}
          <div className="search-container">
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
            <FiSearch className="search-icon" />
          </div>

          {/* Contenido de cada pestaña */}
          {activeTab === "admins" && renderUserTable(filteredAdmins)}
          {activeTab === "teachers" && renderUserTable(filteredTeachers)}
          {activeTab === "students" && renderUserTable(filteredStudents)}
        </div>
      </div>
    </>
  );

  const renderUserTable = (usersToRender) => (
    <div className="table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>País</th>
            <th>Rol</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usersToRender.length > 0 ? (
            usersToRender.map((user) => (
              <tr key={user.id}>{renderUserRow(user)}</tr>
            ))
          ) : (
            <tr className="no-results">
              <td colSpan="7">
                <div className="empty-state">
                  <span>📭</span>
                  <p>No se encontraron usuarios</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderUserRow = (user) => {
    const getRoleName = (role) => {
      switch (role) {
        case "admin":
          return "Admin";
        case "teacher":
          return "Profesor";
        case "student":
          return "Estudiante";
        default:
          return "Usuario";
      }
    };

    return (
      <>
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
        <td>{new Date(user.created_at).toLocaleDateString()}</td>
        <td>
          <button
            className="action-btn details-btn"
            onClick={() => {
              setSelectedUser(user);
              setShowModal(true);
            }}
          >
            Editar
          </button>
        </td>
      </>
    );
  };

  const renderModal = () => {
    if (!showModal || !selectedUser) return null;

    const getRoleDisplayName = (role) => {
      switch (role) {
        case "admin":
          return "Administrador";
        case "teacher":
          return "Profesor";
        case "student":
          return "Estudiante";
        default:
          return "Usuario Regular";
      }
    };

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Detalles del Usuario</h2>
            <button className="close-modal" onClick={() => setShowModal(false)}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="user-profile">
              <div className="profile-avatar">
                {selectedUser.first_name?.charAt(0) || "U"}
              </div>
              <h3>
                {selectedUser.first_name} {selectedUser.last_name}
              </h3>
              <span className={`user-role ${selectedUser.role}`}>
                {getRoleDisplayName(selectedUser.role)}
              </span>
            </div>

            <div className="user-details-grid">
              <div className="detail-item">
                <label>ID</label>
                <p>{selectedUser.id}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{selectedUser.email}</p>
              </div>
              <div className="detail-item">
                <label>País</label>
                <p>{selectedUser.country || "N/A"}</p>
              </div>
              <div className="detail-item">
                <label>Número de ID</label>
                <p>{selectedUser.id_number || "N/A"}</p>
              </div>
              <div className="detail-item">
                <label>Fecha de registro</label>
                <p>{new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Estado</label>
                <p>{selectedUser.is_active ? "Activo" : "Inactivo"}</p>
              </div>
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
                >
                  <option value="admin">Administrador</option>
                  <option value="teacher">Profesor</option>
                  <option value="student">Estudiante</option>
                  <option value="user">Usuario Regular</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
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
    );
  };

  // 5. RENDER PRINCIPAL (único return)
  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="admin-layout">
      {renderSidebar()}

      <div className="admin-content">
        <div className="admin-container">
          {renderHeader()}

          {activeView === "dashboard" && renderDashboardView()}
          {activeView === "users" && renderUsersView()}

          {renderModal()}
        </div>
      </div>
    </div>
  );
};
