import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./adminSidebar";
import { AdminContent } from "./adminContent";
import { AdminModals } from "./adminModals";
import "../../../styles/dashboardAdmin.css";

export const DashboardAdmin = () => {
  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "", // 'success' | 'error'
    message: "",
  });

  // Estados para búsqueda
  const [activeTab, setActiveTab] = useState("admins");
  const [searchAdmins, setSearchAdmins] = useState("");
  const [searchTeachers, setSearchTeachers] = useState("");
  const [searchStudents, setSearchStudents] = useState("");

  // 1. Lógica para cargar usuarios
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

  // 2. Lógica para eliminar usuario
  const handleDeleteUser = async () => {
    setDeleteStatus({ loading: true, error: null, success: false });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/admin/users/${userToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Error al eliminar usuario");
      }

      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setShowDeleteModal(false);

      // Mostrar notificación de éxito
      setNotification({
        show: true,
        type: "success",
        message: "Usuario eliminado correctamente",
      });

      // Ocultar notificación después de 3 segundos
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error al eliminar el usuario",
      });
    } finally {
      setDeleteStatus({ loading: false, error: null, success: false });
    }
  };

  // 3. Lógica para cambiar rol
  const handleRoleChange = async (e, user) => {
    e.preventDefault();

    // Obtener el valor del select del formulario
    const formData = new FormData(e.target);
    const selectedRole = formData.get("role");

    if (!selectedRole) {
      setNotification({
        show: true,
        type: "error",
        message: "Debes seleccionar un rol",
      });
      return;
    }

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

      // Actualizar el estado y mostrar notificación
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, role: selectedRole } : u))
      );

      setNotification({
        show: true,
        type: "success",
        message: "Rol actualizado correctamente",
      });

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar rol:", err);
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error al actualizar el rol",
      });
    }
  };

  // 4. Funciones auxiliares
  const getUserStats = () => ({
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    students: users.filter((u) => u.role === "student").length,
    regular: users.filter((u) => u.role === "user" || !u.role).length,
  });

  // 5. Filtrado de usuarios
  const filterUsers = (role, searchTerm) => {
    return users
      .filter((user) => user.role === role)
      .filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="admin-layout">
      <AdminSidebar activeView={activeView} setActiveView={setActiveView} />

      <AdminContent
        activeView={activeView}
        users={users}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchAdmins={searchAdmins}
        setSearchAdmins={setSearchAdmins}
        searchTeachers={searchTeachers}
        setSearchTeachers={setSearchTeachers}
        searchStudents={searchStudents}
        setSearchStudents={setSearchStudents}
        getUserStats={getUserStats}
        filterUsers={filterUsers}
        setSelectedUser={setSelectedUser}
        setShowModal={setShowModal}
        setUserToDelete={setUserToDelete}
        setShowDeleteModal={setShowDeleteModal}
      />

      <AdminModals
        showModal={showModal}
        setShowModal={setShowModal}
        selectedUser={selectedUser}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        userToDelete={userToDelete}
        deleteStatus={deleteStatus}
        handleDeleteUser={handleDeleteUser}
        handleRoleChange={handleRoleChange}
        notification={notification} // <-- Asegúrate de pasar esta prop
        setNotification={setNotification} // <-- Y esta si la usas
      />
    </div>
  );
};

// Componentes locales
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando datos...</p>
  </div>
);

const ErrorDisplay = ({ error }) => (
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
