import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
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
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    price: 0,
    discount_price: 0,
    level: "BEGINNER",
    language: "Spanish",
    certificate_available: true,
    is_published: false,
    image_url: "",
    alt_text: "",
    what_you_learn: [""],
    requirements: [""],
  });

  const [learningObjectives, setLearningObjectives] = useState([""]);
  const [requirements, setRequirements] = useState([""]);
  const [courseCreationStatus, setCourseCreationStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

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

  // Función para redirigir al login con mensaje
  const redirectToLogin = (message) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Mostrar mensaje con SweetAlert antes de redirigir
    Swal.fire({
      icon: "warning",
      title: "Sesión expirada",
      text: message,
      confirmButtonText: "Ir al login",
      timer: 3000,
      timerProgressBar: true,
    }).then(() => {
      window.location.href = "/login";
    });
  };

  // 1. Lógica para cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          redirectToLogin(
            "Sesión expirada. Por favor inicia sesión nuevamente."
          );
          return;
        }

        const response = await fetch("http://localhost:3001/api/admin/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Si es error 401, token expirado o inválido
        if (response.status === 401) {
          redirectToLogin(
            "Sesión expirada. Por favor inicia sesión nuevamente."
          );
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.msg || "Error al obtener usuarios");
        }

        // Procesar usuarios
        const usersWithBlockStatus = data.map((user) => ({
          ...user,
          is_blocked: user.is_blocked || false,
          block_reason: user.block_reason || null,
          blocked_until: user.blocked_until || null,
        }));

        setUsers(usersWithBlockStatus);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError(err.message);

        // Redirigir si es error de autenticación
        if (
          err.message.includes("401") ||
          err.message.includes("No autorizado") ||
          err.message.includes("Token has expired")
        ) {
          redirectToLogin(
            "Sesión expirada. Por favor inicia sesión nuevamente."
          );
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

  // Función para bloquear usuario
  const handleBlockUser = async (userId) => {
    try {
      const { value: reason } = await Swal.fire({
        title: "Bloquear Usuario",
        input: "textarea",
        inputLabel: "Razón del bloqueo",
        inputPlaceholder: "Ingrese la razón del bloqueo...",
        inputAttributes: {
          "aria-label": "Ingrese la razón del bloqueo",
        },
        showCancelButton: true,
        confirmButtonText: "Bloquear",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        inputValidator: (value) => {
          if (!value) {
            return "Debe ingresar una razón para bloquear al usuario";
          }
        },
      });

      if (!reason) return;

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3001/api/admin/users/${userId}/block`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Error al bloquear usuario");
      }

      // Obtener la respuesta completa que incluye el contador actualizado
      const responseData = await response.json();
      const updatedUser = responseData.user; // Asegúrate de que el backend devuelve el usuario actualizado

      // Actualizar la lista de usuarios con TODOS los datos actualizados
      const updatedUsers = users.map((user) =>
        user.id === userId
          ? {
              ...user,
              is_blocked: true,
              block_reason: reason,
              block_count: updatedUser.block_count, // Asegúrate de actualizar el contador
            }
          : user
      );
      setUsers(updatedUsers);

      setNotification({
        show: true,
        type: "success",
        message: "Usuario bloqueado correctamente",
      });

      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
    } catch (err) {
      console.error("Error al bloquear usuario:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al bloquear usuario",
        confirmButtonText: "Entendido",
      });
    }
  };
  const handleCourseInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addLearningObjective = () => {
    setLearningObjectives((prev) => [...prev, ""]);
  };

  const removeLearningObjective = (index) => {
    if (learningObjectives.length > 1) {
      const updated = learningObjectives.filter((_, i) => i !== index);
      setLearningObjectives(updated);
      setCourseFormData((prev) => ({
        ...prev,
        what_you_learn: updated.filter((obj) => obj.trim() !== ""),
      }));
    }
  };

  const handleLearningObjectiveChange = (index, value) => {
    const updated = [...learningObjectives];
    updated[index] = value;
    setLearningObjectives(updated);
    setCourseFormData((prev) => ({
      ...prev,
      what_you_learn: updated.filter((obj) => obj.trim() !== ""),
    }));
  };

  const addRequirement = () => {
    setRequirements((prev) => [...prev, ""]);
  };

  const removeRequirement = (index) => {
    if (requirements.length > 1) {
      const updated = requirements.filter((_, i) => i !== index);
      setRequirements(updated);
      setCourseFormData((prev) => ({
        ...prev,
        requirements: updated.filter((req) => req.trim() !== ""),
      }));
    }
  };

  const handleRequirementChange = (index, value) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
    setCourseFormData((prev) => ({
      ...prev,
      requirements: updated.filter((req) => req.trim() !== ""),
    }));
  };

  const handleCreateCourse = async (isDraft = false) => {
    setCourseCreationStatus({ loading: true, error: null, success: false });

    try {
      const token = localStorage.getItem("token");

      // Preparar datos finales
      const finalData = {
        ...courseFormData,
        is_published: isDraft ? false : courseFormData.is_published,
        what_you_learn: learningObjectives.filter((obj) => obj.trim() !== ""),
        requirements: requirements.filter((req) => req.trim() !== ""),
        price: parseFloat(courseFormData.price),
        discount_price: courseFormData.discount_price
          ? parseFloat(courseFormData.discount_price)
          : 0,
      };

      const response = await fetch("http://localhost:3001/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || "Error al crear el curso");
      }

      setCourseCreationStatus({
        loading: false,
        error: null,
        success: true,
      });

      // Mostrar notificación de éxito
      setNotification({
        show: true,
        type: "success",
        message: isDraft
          ? "Curso guardado como borrador correctamente"
          : "Curso creado exitosamente",
      });

      // Resetear formulario después de éxito
      if (!isDraft) {
        setCourseFormData({
          title: "",
          description: "",
          short_description: "",
          price: 0,
          discount_price: 0,
          level: "BEGINNER",
          language: "Spanish",
          certificate_available: true,
          is_published: false,
          image_url: "",
          alt_text: "",
          what_you_learn: [""],
          requirements: [""],
        });
        setLearningObjectives([""]);
        setRequirements([""]);
      }
    } catch (err) {
      console.error("Error al crear curso:", err);
      setCourseCreationStatus({
        loading: false,
        error: err.message,
        success: false,
      });

      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error al crear el curso",
      });
    }
  };
  // Función para cargar cursos
  const fetchCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/admin/courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener cursos");
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCoursesError(err.message);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Efecto para cargar cursos cuando se active la vista
  useEffect(() => {
    if (activeView === "courses") {
      fetchCourses();
    }
  }, [activeView]);
  // Función para desbloquear usuario
  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/admin/users/${userId}/unblock`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Error al desbloquear usuario");
      }

      // Actualizar la lista de usuarios
      const updatedUsers = users.map((user) =>
        user.id === userId
          ? { ...user, is_blocked: false, block_reason: null }
          : user
      );
      setUsers(updatedUsers);

      setNotification({
        show: true,
        type: "success",
        message: "Usuario desbloqueado correctamente",
      });

      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
    } catch (err) {
      console.error("Error al desbloquear usuario:", err);
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error al desbloquear usuario",
      });
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
        handleBlockUser={handleBlockUser}
        handleUnblockUser={handleUnblockUser}
        courseFormData={courseFormData}
        learningObjectives={learningObjectives}
        requirements={requirements}
        courseCreationStatus={courseCreationStatus}
        handleCourseInputChange={handleCourseInputChange}
        handleLearningObjectiveChange={handleLearningObjectiveChange}
        handleRequirementChange={handleRequirementChange}
        addLearningObjective={addLearningObjective}
        removeLearningObjective={removeLearningObjective}
        addRequirement={addRequirement}
        removeRequirement={removeRequirement}
        handleCreateCourse={handleCreateCourse}
        courses={courses}
        coursesLoading={coursesLoading}
        coursesError={coursesError}
        onRefreshCourses={fetchCourses} // Para poder recargar
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
        notification={notification}
        setNotification={setNotification}
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
