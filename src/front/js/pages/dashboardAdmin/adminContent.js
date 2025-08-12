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
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usersToRender.map((user) => (
              <tr key={user.id}>
                {/* Contenido de cada fila */}
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
                      <button
                        className="action-btn delete-btn"
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                      >
                        Eliminar
                      </button>
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
      users: `Total usuarios: ${getUserStats().total}`,
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
        ) : (
          <div>Vista en desarrollo</div>
        )}
      </div>
    </div>
  );
};
