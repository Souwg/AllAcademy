import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import Swal from "sweetalert2";
import { AdminSidebar } from "./adminSidebar";
import { AdminContent } from "./adminContent";
import { AdminModals } from "./adminModals";
export const DashboardAdmin = () => {
  /* ==============================
   * ESTADOS PRINCIPALES
   * ============================== */
  const { store, actions } = useContext(Context);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");

  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Cursos
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Datos del formulario de creación de cursos
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    price: "",
    discount_price: "",
    duration: "",
    level: "BEGINNER",
    language: "Spanish",
    is_published: false,
    image_url: "",
    what_you_learn: [""],
    requirements: [""],
    has_live_classes: false,
    has_recorded_videos: false,
    teacher_id: "",
  });
  const [schedules, setSchedules] = useState([
    {
      days: [],
      start_time: "",
      end_time: "",
      timezone: "GMT-5",
      group_name: "",
    },
  ]);

  const [learningObjectives, setLearningObjectives] = useState([""]);
  const [requirements, setRequirements] = useState([""]);
  const [courseCreationStatus, setCourseCreationStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });
  const [validationErrors, setValidationErrors] = useState({});

  /* ==============================
   * ESTADOS PARA MODALES
   * ============================== */
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
    type: "",
    message: "",
  });

  const validateCourseForm = () => {
    const errors = {};
    if (!courseFormData.title.trim()) errors.title = "Course title is required";
    if (!courseFormData.description.trim())
      errors.description = "Full description is required";
    if (!courseFormData.teacher_id.trim())
      errors.teacher_id = "Teacher is required";
    if (!courseFormData.short_description.trim())
      errors.short_description = "Short description is required";
    else if (courseFormData.short_description.trim().length < 60)
      errors.short_description =
        "Short description must be at least 60 characters";
    if (!courseFormData.price || parseFloat(courseFormData.price) <= 0)
      errors.price = "Price must be greater than 0";
    if (!courseFormData.duration.trim())
      errors.duration = "Duration is required";
    if (!courseFormData.level) errors.level = "Level is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // ✅ Si no hay errores
  };
  /* ==============================
   * ESTADOS DE BÚSQUEDA DE USUARIOS
   * ============================== */
  const [activeTab, setActiveTab] = useState("admins");
  const [searchAdmins, setSearchAdmins] = useState("");
  const [searchTeachers, setSearchTeachers] = useState("");
  const [searchStudents, setSearchStudents] = useState("");

  /* ==============================
   * ESTADOS PARA MÓDULOS Y LECCIONES
   * ============================== */
  const [modules, setModules] = useState([
    {
      title: "",
      description: "",
      order: 1,
      lessons: [
        {
          title: "",
          description: "",
          content: "",
          video_url: "",
          order: 1,
        },
      ],
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  // ==============================
  // ESTADOS PARA EDICIÓN DE CURSO
  // ==============================
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);

  // ==============================
  // ABRIR MODAL DE EDICIÓN
  // ==============================
  const handleEditCourse = (course) => {
    const selectedTeacher = teachers.find((t) => t.id === course.teacher_id);

    // 👇 Convertimos day_of_week (string) en array days []
    const normalizedSchedules = (course.schedules || []).map((sch) => ({
      ...sch,
      days: sch.day_of_week ? sch.day_of_week.split(",") : [],
    }));

    setCourseToEdit({
      ...course,
      schedules: normalizedSchedules, // ✅ usamos el nuevo array
      is_published: course.is_published,
      level: course.level ? course.level.toUpperCase() : "BEGINNER",
      instructor: selectedTeacher
        ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}`
        : course.instructor,
      instructorBio: selectedTeacher
        ? selectedTeacher.bio
        : course.instructorBio,
    });

    setShowEditCourseModal(true);
  };

  useEffect(() => {
    actions.getUserStatsPerMonth(); // 🚀 carga las stats al montar el dashboard
  }, []);
  useEffect(() => {
    actions.getFinancialOverview(); // 💰 carga los KPIs financieros
  }, []);

  // ==============================
  // ACTUALIZAR CURSO
  // ==============================
  const handleUpdateCourse = async (updateData) => {
    try {
      const token = localStorage.getItem("token");

      // Convertimos días a string
      const formatted = {
        ...updateData,
        schedules: (updateData.schedules || []).map((s) => ({
          ...s,
          day_of_week: (s.days || []).join(","),
        })),
      };

      let response;
      if (updateData.imageFile) {
        // ⚙️ Si hay nueva imagen → enviar como FormData
        const formData = new FormData();
        for (const key in formatted) {
          if (
            Array.isArray(formatted[key]) ||
            typeof formatted[key] === "object"
          ) {
            formData.append(key, JSON.stringify(formatted[key]));
          } else {
            formData.append(key, formatted[key]);
          }
        }
        formData.append("image", updateData.imageFile);

        response = await fetch(
          `http://localhost:3001/api/admin/courses/${updateData.id}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
      } else {
        // 📦 Sin imagen → enviar JSON
        response = await fetch(
          `http://localhost:3001/api/admin/courses/${updateData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formatted),
          }
        );
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error updating course");

      // 🔄 Actualizamos el estado local
      setCourses((prev) =>
        prev.map((c) => (c.id === updateData.id ? data.course : c))
      );

      setNotification({
        show: true,
        type: "success",
        message: "Course updated successfully",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );

      setShowEditCourseModal(false);
    } catch (err) {
      console.error("Error al actualizar curso:", err);
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error updating course",
      });
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleViewCourseDetails = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/admin/users/${userData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.msg || "Error al actualizar usuario");

      // Actualizar lista local
      setUsers(users.map((u) => (u.id === userData.id ? data.user : u)));

      setShowModal(false);
      setNotification({
        show: true,
        type: "success",
        message: "User updated successfully",
      });
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 4000);
    } catch (err) {
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error al actualizar usuario",
      });
    }
  };

  /* ==============================
   * FUNCIONES PARA MÓDULOS
   * ============================== */
  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
        description: "",
        order: modules.length + 1,
        lessons: [
          {
            title: "",
            description: "",
            content: "",
            video_url: "",
            order: 1,
          },
        ],
      },
    ]);
  };

  const removeModule = (index) => {
    if (modules.length > 1) {
      const updatedModules = modules.filter((_, i) => i !== index);
      setModules(updatedModules);
    }
  };

  const updateModule = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index][field] = value || "";
    setModules(updatedModules);
  };

  /* ==============================
   * FUNCIONES PARA LECCIONES
   * ============================== */
  const addLesson = (moduleIndex) => {
    const updatedModules = [...modules];
    const module = updatedModules[moduleIndex];
    module.lessons.push({
      title: "",
      description: "",
      content: "",
      video_url: "",
      order: module.lessons.length + 1,
    });
    setModules(updatedModules);
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const updatedModules = [...modules];
    const module = updatedModules[moduleIndex];

    if (module.lessons.length > 1) {
      module.lessons = module.lessons.filter((_, i) => i !== lessonIndex);
      module.lessons.forEach((lesson, idx) => {
        lesson.order = idx + 1;
      });
      setModules(updatedModules);
    }
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex][field] = value || "";
    setModules(updatedModules);
  };

  const toggleScheduleDay = (index, day) => {
    const updated = [...schedules];
    const selectedDays = updated[index].days;

    if (selectedDays.includes(day)) {
      updated[index].days = selectedDays.filter((d) => d !== day);
    } else {
      updated[index].days = [...selectedDays, day];
    }

    setSchedules(updated);
  };

  /* ==============================
   * REDIRECCIÓN AL LOGIN SI EL TOKEN EXPIRA
   * ============================== */
  const redirectToLogin = (message) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

  /* ==============================
   * 1. CARGAR USUARIOS (useEffect inicial)
   * ============================== */
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

        const usersWithBlockStatus = data.map((user) => ({
          ...user,
          is_blocked: user.is_blocked || false,
          block_reason: user.block_reason || null,
          blocked_until: user.blocked_until || null,
        }));

        setUsers(usersWithBlockStatus);
      } catch (err) {
        setError(err.message);

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

  // Función para obtener profesores
  const fetchTeachers = async () => {
    setTeachersLoading(true);
    setTeachersError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/admin/teachers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener profesores");
      }

      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      setTeachersError(err.message);
    } finally {
      setTeachersLoading(false);
    }
  };

  // 1. Cargar cursos siempre que se monte el Dashboard
  useEffect(() => {
    fetchCourses();
  }, []);

  // 2. Cargar teachers solo cuando la vista es courses
  useEffect(() => {
    if (activeView === "courses") {
      fetchTeachers();
    }
  }, [activeView]);

  /* ==============================
   * 2. ELIMINAR USUARIO
   * ============================== */
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
      setNotification({
        show: true,
        type: "success",
        message: "Usuario eliminado correctamente",
      });
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    } catch (err) {
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error al eliminar el usuario",
      });
    } finally {
      setDeleteStatus({ loading: false, error: null, success: false });
    }
  };

  /* ==============================
   * BLOQUEAR USUARIO
   * ============================== */
  const handleBlockUser = async (userId) => {
    try {
      const { value: reason } = await Swal.fire({
        title: "Block User",
        input: "textarea",
        inputLabel: "Reason for blocking",
        inputPlaceholder: "Enter the reason for blocking...",
        inputAttributes: {
          "aria-label": "Enter the reason for blocking...",
        },
        showCancelButton: true,
        confirmButtonText: "Block",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        inputValidator: (value) => {
          if (!value) {
            return "You must enter a reason to block the user";
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
        throw new Error(errorData.msg || "Error blocking user");
      }
      const responseData = await response.json();
      const updatedUser = responseData.user;
      const updatedUsers = users.map((user) =>
        user.id === userId
          ? {
              ...user,
              is_blocked: true,
              block_reason: reason,
              block_count: updatedUser.block_count,
            }
          : user
      );
      setUsers(updatedUsers);

      setNotification({
        show: true,
        type: "success",
        message: "User successfully blocked",
      });

      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error blocking user",
        confirmButtonText: "Understood",
      });
    }
  };

  /* ==============================
   * FORMULARIO DE CURSOS: INPUTS Y CAMPOS
   * ============================== */
  const handleCourseInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "live_class_days") {
      setCourseFormData((prev) => ({
        ...prev,
        live_class_days: checked
          ? [...prev.live_class_days, value]
          : prev.live_class_days.filter((d) => d !== value),
      }));
    } else {
      setCourseFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value || "",
      }));
    }
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

  const addLearningObjective = () => {
    setLearningObjectives((prev) => [...prev, ""]);
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
  const addSchedule = () => {
    setSchedules((prev) => [
      ...prev,
      {
        days: [],
        start_time: "",
        end_time: "",
        timezone: "GMT-5",
        group_name: "",
      },
    ]);
  };

  const removeSchedule = (index) => {
    if (schedules.length > 1) {
      setSchedules((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateSchedule = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
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

  /* ==============================
   * CREAR CURSO
   * ============================== */
  // Función para crear curso
  const handleCreateCourse = async (isDraft = false) => {
    // 👉 Primero validar en frontend
    if (!validateCourseForm()) {
      return; // 🚫 No sigue si hay errores
    }

    setCourseCreationStatus({ loading: true, error: null, success: false });

    try {
      const token = localStorage.getItem("token");

      const finalData = {
        ...courseFormData,
        price: courseFormData.price ? parseFloat(courseFormData.price) : 0,
        discount_price: courseFormData.discount_price
          ? parseFloat(courseFormData.discount_price)
          : 0,
        is_published: isDraft ? false : courseFormData.is_published,
        what_you_learn: learningObjectives.filter((obj) => obj.trim() !== ""),
        requirements: requirements.filter((req) => req.trim() !== ""),
        modules: modules
          .map((module) => ({
            ...module,
            lessons: module.lessons.filter(
              (lesson) => lesson.title.trim() !== ""
            ),
          }))
          .filter((module) => module.title.trim() !== ""),
        schedules: schedules
          .filter((s) => s.days.length > 0 && s.start_time && s.end_time)
          .map((s) => ({
            ...s,
            days: s.days,
          })),
      };

      // 🔹 Crear FormData para enviar texto + archivo
      const formData = new FormData();
      for (const key in finalData) {
        if (
          Array.isArray(finalData[key]) ||
          typeof finalData[key] === "object"
        ) {
          formData.append(key, JSON.stringify(finalData[key]));
        } else {
          formData.append(key, finalData[key]);
        }
      }

      // 🔹 Agregar la imagen si existe
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch("http://localhost:3001/api/courses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // 👈 sin Content-Type manual
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || "Error creating course");
      }

      setCourseCreationStatus({
        loading: false,
        error: null,
        success: true,
      });

      setNotification({
        show: true,
        type: "success",
        message: isDraft
          ? "Course saved as draft successfully"
          : "Course created successfully",
      });

      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        4000
      );

      // ✅ Limpiar formulario después de crear
      if (!isDraft) {
        setCourseFormData({
          title: "",
          description: "",
          short_description: "",
          price: "",
          discount_price: "",
          duration: "",
          level: "BEGINNER",
          language: "Spanish",
          is_published: false,
          image_url: "",
          what_you_learn: [""],
          requirements: [""],
          has_live_classes: false,
          has_recorded_videos: false,
          live_class_days: [],
          live_class_start_time: "",
          live_class_end_time: "",
          live_class_timezone: "GMT-5",
          teacher_id: "",
          access_duration: "lifetime",
        });
        setLearningObjectives([""]);
        setRequirements([""]);
        setImageFile(null);
        setModules([
          {
            title: "",
            description: "",
            order: 1,
            lessons: [
              {
                title: "",
                description: "",
                order: 1,
              },
            ],
          },
        ]);
        setSchedules([
          {
            days: [],
            start_time: "",
            end_time: "",
            timezone: "GMT-5",
            group_name: "",
          },
        ]);

        setValidationErrors({});
      }
    } catch (err) {
      setCourseCreationStatus({
        loading: false,
        error: err.message,
        success: false,
      });

      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error creating course",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        4000
      );
    }
  };

  /* ==============================
   * ELIMINAR CURSO
   * ============================== */
  const handleDeleteCourse = async (courseId) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Deletion",
        text: "This action is irreversible. The course will be permanently removed from the system.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3001/api/courses/${courseId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || "Error al eliminar el curso");
        }
        setCourses(courses.filter((course) => course.id !== courseId));

        Swal.fire(
          "deleted!",
          "The course has been successfully deleted.",
          "success"
        );
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error dele",
      });
    }
  };

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
      setCoursesError(err.message);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === "courses") {
      fetchCourses();
    }
  }, [activeView]);

  /* ==============================
   * DESBLOQUEAR USUARIO
   * ============================== */
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
      const updatedUsers = users.map((user) =>
        user.id === userId
          ? { ...user, is_blocked: false, block_reason: null }
          : user
      );
      setUsers(updatedUsers);

      setNotification({
        show: true,
        type: "success",
        message: "User successfully unblocked",
      });

      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
    } catch (err) {
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error al desbloquear usuario",
      });
    }
  };

  /* ==============================
   * 3. CAMBIAR ROL DE USUARIO
   * ============================== */
  const handleRoleChange = async (e, user) => {
    e.preventDefault();

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

      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, role: selectedRole } : u))
      );

      setNotification({
        show: true,
        type: "success",
        message: "Rol actualizado correctamente",
      });

      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    } catch (err) {
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Error al actualizar el rol",
      });
    }
  };

  /* ==============================
   * 4. FUNCIONES AUXILIARES
   * ============================== */
  const getUserStats = () => ({
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    students: users.filter((u) => u.role === "student").length,
  });

  /* ==============================
   * 5. FILTRADO DE USUARIOS
   * ============================== */
  const filterUsers = (role, searchTerm) => {
    return users
      .filter((user) => user.role === role)
      .filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
  };

  /* ==============================
   * RENDER PRINCIPAL
   * ============================== */

  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="admin-wrapper">
      <div className="admin-layout">
        <AdminSidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Contenido principal */}
        <AdminContent
          activeView={activeView}
          setActiveView={setActiveView}
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
          imageFile={imageFile}
          setImageFile={setImageFile}
          courses={courses}
          coursesLoading={coursesLoading}
          coursesError={coursesError}
          onRefreshCourses={fetchCourses}
          onDeleteCourse={handleDeleteCourse}
          modules={modules}
          setModules={setModules}
          addModule={addModule}
          removeModule={removeModule}
          updateModule={updateModule}
          addLesson={addLesson}
          removeLesson={removeLesson}
          updateLesson={updateLesson}
          onViewCourseDetails={handleViewCourseDetails}
          teachers={teachers}
          teachersLoading={teachersLoading}
          teachersError={teachersError}
          currentUser={currentUser}
          onEditCourse={handleEditCourse}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
          userStatsPerMonth={store.userStatsPerMonth}
          schedules={schedules}
          setSchedules={setSchedules}
          addSchedule={addSchedule}
          removeSchedule={removeSchedule}
          updateSchedule={updateSchedule}
          toggleScheduleDay={toggleScheduleDay}
          financialOverview={store.financialOverview}
        />

        {/* Modales */}
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
          showCourseDetails={showCourseDetails}
          setShowCourseDetails={setShowCourseDetails}
          selectedCourse={selectedCourse}
          handleSaveUser={handleSaveUser}
          setSelectedUser={setSelectedUser}
          showEditCourseModal={showEditCourseModal}
          setShowEditCourseModal={setShowEditCourseModal}
          courseToEdit={courseToEdit}
          setCourseToEdit={setCourseToEdit}
          handleUpdateCourse={handleUpdateCourse}
          teachers={teachers}
        />
      </div>
    </div>
  );
};

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
