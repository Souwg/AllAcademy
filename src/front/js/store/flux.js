const getState = ({ getStore, getActions, setStore }) => {
  // 🧰 Helpers internos reutilizables
  const saveNotifications = (notifications) => {
    const userId = getStore().user?.id;
    if (!userId) return;
    localStorage.setItem(
      `notifications_${userId}`,
      JSON.stringify(notifications)
    );
    setStore({ notifications });
  };

  const getNotifications = () => {
    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    if (!userId) return [];
    return JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
  };

  const saveLastNotified = (updated) => {
    const userId = getStore().user?.id;
    if (!userId) return;
    localStorage.setItem(
      `lastNotifiedMessage_${userId}`,
      JSON.stringify(updated)
    );
    setStore({ lastNotifiedMessage: updated });
  };

  const getLastNotified = () => {
    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    if (!userId) return {};
    return (
      JSON.parse(localStorage.getItem(`lastNotifiedMessage_${userId}`)) || {}
    );
  };

  return {
    store: {
      user: JSON.parse(localStorage.getItem("user")) || null,
      token: localStorage.getItem("token") || null,
      studentsByTeacher: [],
      courses: [],
      myEnrollments: [],
      teacherStats: { total_courses: 0, total_students: 0 },
      coursesLoading: false,
      notification: { show: false, type: "", message: "" },
      coursesError: null,
      lastPaymentId: null,

      selectedCourse: null,
      selectedCourseLoading: false,
      selectedCourseError: null,
      videos: [],
      financialOverview: {
        total_revenue: 0,
        total_sales: 0,
      },

      notifications: getNotifications(),
      lastNotifiedMessage:
        JSON.parse(
          localStorage.getItem(
            `lastNotifiedMessage_${
              JSON.parse(localStorage.getItem("user"))?.id
            }`
          )
        ) || {},
    },
    actions: {
      signupUser: async (formData) => {
        try {
          const resp = await fetch("http://localhost:3001/api/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              password: formData.password,
              confirm_password: formData.confirmPassword,
              country: formData.country,
              id_number: formData.idNumber,
              accept_terms: formData.acceptTerms,
            }),
          });

          const data = await resp.json();

          if (!resp.ok) {
            return {
              success: false,
              message: data.msg || "Registration failed",
            };
          }

          return { success: true, user: data.user };
        } catch (err) {
          console.error("❌ Error in signupUser:", err);
          return { success: false, message: "Connection error" };
        }
      },
      updateUserProfile: async (updatedData) => {
        try {
          const token = localStorage.getItem("token");
          const formData = new FormData();

          // Agregar todos los campos al FormData
          for (const key in updatedData) {
            if (updatedData[key] !== undefined && updatedData[key] !== null) {
              formData.append(key, updatedData[key]);
            }
          }
          if (updatedData.image_url === "") {
            formData.append("remove_image", "true");
          }

          const resp = await fetch("http://localhost:3001/api/user/profile", {
            method: "PUT",
            headers: {
              Authorization: "Bearer " + token,
            },
            body: formData, // 👈 Importante: ya no es JSON
          });

          const data = await resp.json();
          if (!resp.ok)
            throw new Error(data.msg || "Error al actualizar perfil");

          // Guardar en localStorage y en el store
          localStorage.setItem("user", JSON.stringify(data.user));
          setStore({ user: data.user });

          getActions().showNotification(
            "success",
            "Profile updated successfully!"
          );
          return true;
        } catch (err) {
          console.error("❌ Error en updateUserProfile:", err);
          getActions().showNotification("error", err.message);
          return false;
        }
      },

      loginUser: async (email, password) => {
        try {
          const resp = await fetch("http://localhost:3001/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await resp.json();
          if (!resp.ok) throw new Error(data.msg || "Login failed");

          // 🧠 Guardar credenciales
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // 🛎️ Recuperar notificaciones pendientes del localStorage
          const userId = data.user.id;
          const storedNotifications = localStorage.getItem(
            `notifications_${userId}`
          );
          const notifications = storedNotifications
            ? JSON.parse(storedNotifications)
            : [];

          const storedLastNotified = localStorage.getItem(
            `lastNotifiedMessage_${userId}`
          );
          const lastNotifiedMessage = storedLastNotified
            ? JSON.parse(storedLastNotified)
            : {};

          // 🪄 Actualizar todo el store de una vez
          setStore({
            user: data.user,
            token: data.token,
            notifications,
            lastNotifiedMessage,
          });

          return true;
        } catch (err) {
          console.error("Error in loginUser:", err);
          return false;
        }
      },

      clearSession: () => {
        const userId = getStore().user?.id;
        if (userId) {
          const stored =
            JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
          // 🔸 Filtramos y mantenemos solo las no leídas
          const unreadOnly = stored.filter((n) => !n.is_read);
          localStorage.setItem(
            `notifications_${userId}`,
            JSON.stringify(unreadOnly)
          );
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setStore({
          user: null,
          token: null,
          notifications: [],
          // 👇 mantenemos lastNotifiedMessage intacto
          studentsByTeacher: [],
          courses: [],
          myEnrollments: [],
        });
      },

      syncWithLocalStorage: () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        setStore({ user, token });
      },

      loadCourses: async () => {
        setStore({ coursesLoading: true, coursesError: null });

        try {
          const resp = await fetch("http://localhost:3001/api/courses");
          if (!resp.ok) throw new Error("Error al cargar cursos");
          const data = await resp.json();

          // --- Dummy courses ---
          const MIN_COURSES = 6;
          const missing =
            data.length < MIN_COURSES ? MIN_COURSES - data.length : 0;

          const dummyCourses = Array.from({ length: missing }, (_, index) => ({
            id: `dummy-${index}`,
            title: "Coming Soon",
            short_description:
              "We are excited to let you know that we are preparing new courses for you.",
            description: "We will soon publish more courses in this category.",
            image_url: "",
            instructor: "CodeFlow Academy",
            isDummy: true,
          }));

          setStore({
            courses: [...data, ...dummyCourses],
            coursesLoading: false,
          });
        } catch (err) {
          console.error("Error cargando cursos:", err);
          setStore({ coursesError: err.message, coursesLoading: false });
        }
      },
      // dentro de getState en flux.js
      getUserStatsPerMonth: async () => {
        try {
          const resp = await fetch(
            "http://localhost:3001/api/stats/users-per-month"
          );
          if (!resp.ok) throw new Error("Error fetching stats");

          const data = await resp.json();

          setStore({ userStatsPerMonth: data.stats });
          return data.stats;
        } catch (error) {
          console.error("Error fetching user stats:", error);
          return [];
        }
      },
      getCourseBySlug: async (slug) => {
        setStore({ selectedCourseLoading: true, selectedCourseError: null });

        try {
          const resp = await fetch(
            `http://localhost:3001/api/courses/slug/${slug}`
          );
          if (!resp.ok) throw new Error("Error al cargar el curso");
          const data = await resp.json();

          setStore({ selectedCourse: data, selectedCourseLoading: false });
        } catch (err) {
          console.error("Error cargando curso por slug:", err);
          setStore({
            selectedCourseError: err.message,
            selectedCourseLoading: false,
          });
        }
      },
      enrollCourse: async (courseId, scheduleId) => {
        try {
          const resp = await fetch(
            `http://localhost:3001/api/enroll/${courseId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: JSON.stringify({ schedule_id: scheduleId }),
            }
          );

          if (!resp.ok) throw new Error("Error enrolling in course");
          const data = await resp.json();
          return data;
        } catch (err) {
          console.error("Error in enrollCourse:", err);
        }
      },

      getMyEnrollments: async () => {
        try {
          const resp = await fetch("http://localhost:3001/api/my-enrollments", {
            method: "GET",
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          });

          if (!resp.ok) throw new Error("Error loading enrollments");
          const data = await resp.json();
          setStore({ myEnrollments: data });
        } catch (err) {
          console.error("Error in getMyEnrollments:", err);
        }
      },
      getCourseChat: async (courseId, scheduleId = null) => {
        try {
          const token = localStorage.getItem("token");

          let url = `http://localhost:3001/api/course/${courseId}/chat`;
          if (scheduleId) url += `?schedule_id=${scheduleId}`;

          const resp = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          });

          if (!resp.ok)
            throw new Error("Error al obtener los mensajes del chat");

          const data = await resp.json();
          console.log(
            "📩 Mensajes del curso",
            courseId,
            "grupo:",
            scheduleId,
            data
          );
          return data;
        } catch (err) {
          console.error("Error en getCourseChat:", err);
          return [];
        }
      },

      postCourseChat: async (courseId, content, scheduleId = null) => {
        try {
          const token = localStorage.getItem("token");
          const body = { content };
          if (scheduleId) body.schedule_id = scheduleId;

          const resp = await fetch(
            `http://localhost:3001/api/course/${courseId}/chat`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify(body),
            }
          );

          if (!resp.ok) throw new Error("Error al enviar el mensaje");
          const data = await resp.json();
          return data;
        } catch (err) {
          console.error("Error en postCourseChat:", err);
          return null;
        }
      },

      getTeacherCourses: async () => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            "http://localhost:3001/api/teacher/courses",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );

          if (!resp.ok) throw new Error("Error fetching teacher courses");

          const data = await resp.json();

          const totalCourses = data.length;
          const totalStudents = data.reduce(
            (acc, course) => acc + (course.total_students || 0),
            0
          );
          const totalGroups = data.reduce(
            (acc, course) => acc + (course.schedules?.length || 0),
            0
          );

          // 🆕 Calcular chats activos
          let totalActiveChats = 0;
          const actions = getActions();

          for (const course of data) {
            if (Array.isArray(course.schedules)) {
              for (const sched of course.schedules) {
                const messages = await actions.getCourseChat(
                  course.id,
                  sched.id
                );
                if (messages.length > 0) {
                  totalActiveChats++;
                }
              }
            }
          }

          setStore({
            courses: data,
            teacherStats: {
              total_courses: totalCourses,
              total_students: totalStudents,
              total_groups: totalGroups,
              total_active_chats: totalActiveChats,
            },
          });

          return data;
        } catch (err) {
          console.error("Error in getTeacherCourses:", err);
          return [];
        }
      },
      getFinancialOverview: async () => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            "http://localhost:3001/api/admin/financial-overview",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );

          const data = await resp.json();
          if (!resp.ok)
            throw new Error(data.msg || "Error fetching financial data");

          // 💾 Guardar en el store
          setStore({ financialOverview: data });
          return data;
        } catch (err) {
          console.error("❌ Error in getFinancialOverview:", err);
          return null;
        }
      },

      getTeacherStudents: async () => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            "http://localhost:3001/api/teacher/students",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );

          if (!resp.ok) throw new Error("Error fetching teacher students");

          const data = await resp.json();

          setStore({ studentsByTeacher: data });
          return data;
        } catch (err) {
          console.error("Error in getTeacherStudents:", err);
          return [];
        }
      },
      getStudentsByCourse: async (courseId) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            `http://localhost:3001/api/teacher/course/${courseId}/students`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );

          if (!resp.ok) throw new Error("Error fetching course students");
          const data = await resp.json();
          return data;
        } catch (err) {
          console.error("Error in getStudentsByCourse:", err);
          return [];
        }
      },
      getPrivateChat: async (studentId) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            `http://localhost:3001/api/chat/${studentId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );

          if (!resp.ok) throw new Error("Error al obtener mensajes privados");
          const data = await resp.json();
          return data;
        } catch (err) {
          console.error("Error en getPrivateChat:", err);
          return [];
        }
      },

      postPrivateChat: async (studentId, content) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            `http://localhost:3001/api/chat/${studentId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({ content }),
            }
          );

          if (!resp.ok) throw new Error("Error al enviar mensaje privado");
          const data = await resp.json();
          return data;
        } catch (err) {
          console.error("Error en postPrivateChat:", err);
          return null;
        }
      },
      addNotification: (notification) => {
        const store = getStore();
        const now = new Date();
        const newNotification = {
          ...notification,
          is_read: false,
          created_at: now,
        };

        let updated = [newNotification, ...store.notifications];

        // 🧹 Eliminar las notificaciones con más de 7 días
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        updated = updated.filter((n) => new Date(n.created_at) > sevenDaysAgo);

        // 🔸 Limitar a 100
        if (updated.length > 20) {
          updated = updated.slice(0, 20);
        }

        saveNotifications(updated);
      },

      getUnreadCount: () => {
        const store = getStore();
        return store.notifications.filter((n) => !n.is_read).length;
      },

      removeNotification: (id) => {
        const store = getStore();
        const updated = store.notifications.filter((n) => n.id !== id);
        saveNotifications(updated);
      },

      markNotificationAsRead: (id) => {
        const store = getStore();
        const notification = store.notifications.find((n) => n.id === id);

        if (
          notification &&
          notification.course_id &&
          notification.schedule_id
        ) {
          const key = `${notification.course_id}-${notification.schedule_id}`;
          getActions().setLastNotifiedMessage(key, id);
        }

        const updated = store.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );

        saveNotifications(updated);
      },

      setLastNotifiedMessage: (key, messageId) => {
        const store = getStore();
        const userId = store.user?.id;
        if (!userId) return;

        // 📥 Recupera el registro actual de este usuario
        const current = getLastNotified();

        // 📝 Actualiza solo la clave correspondiente a este curso/grupo
        const updated = {
          ...current,
          [key]: messageId,
        };

        // 💾 Guarda el nuevo estado usando el helper existente
        saveLastNotified(updated);
      },

      checkNewNotifications: async (role = "teacher") => {
        const store = getStore();
        const actions = getActions();
        const fetches = [];

        const coursesToCheck =
          role === "teacher" ? store.courses : store.myEnrollments;

        // 🧭 Recorremos cursos o enrollments
        for (const item of coursesToCheck) {
          if (role === "student") {
            // 👩‍🎓 CASO ESTUDIANTE
            const schedule = item.schedule;
            const courseData = item.course;

            if (!schedule) {
              console.warn(
                "⚠️ Este enrollment no tiene schedule asignado:",
                item.course_id
              );
              continue;
            }
            fetches.push(
              actions
                .getCourseChat(item.course_id, schedule.id)
                .then((messages) => {
                  return { course: courseData, sched: schedule, messages };
                })
            );
          } else {
            // 👨‍🏫 CASO PROFESOR
            if (!Array.isArray(item.schedules)) {
              console.warn("⚠️ Este curso no tiene schedules:", item.id);
              continue;
            }

            for (const sched of item.schedules) {
              fetches.push(
                actions.getCourseChat(item.id, sched.id).then((messages) => {
                  return { course: item, sched, messages };
                })
              );
            }
          }
        }

        const results = await Promise.all(fetches);

        for (const { course, sched, messages } of results) {
          if (!messages.length) {
            continue;
          }

          const key = `${course.id}-${sched.id}`;
          const lastNotifiedId = store.lastNotifiedMessage[key];

          const newMessages = lastNotifiedId
            ? messages.filter((msg) => msg.id > lastNotifiedId)
            : messages;

          newMessages.forEach((msg) => {
            // 🧹 1. Ignorar mensajes enviados por el propio usuario (profesor o estudiante)
            if (msg.user_id === store.user?.id) {
              // ✅ Actualizamos el último notificado aunque sea propio
              const key = `${course.id}-${sched.id}`;
              const lastNotifiedId = store.lastNotifiedMessage[key];
              if (!lastNotifiedId || msg.id > lastNotifiedId) {
                actions.setLastNotifiedMessage(key, msg.id);
              }
              return;
            }

            // 🧠 2. Si el rol actual es estudiante, solo recibir mensajes del profesor
            if (store.user?.role === "student" && msg.user_role !== "teacher") {
              return;
            }

            // 🧠 3. Si el rol actual es profesor, solo recibir mensajes de estudiantes
            if (store.user?.role === "teacher" && msg.user_role === "teacher") {
              return;
            }

            // 🧭 3. Evitar notificaciones duplicadas
            const alreadyExists = store.notifications.find(
              (n) => n.id === msg.id
            );
            if (alreadyExists) {
              return;
            }

            actions.addNotification({
              id: msg.id,
              type: "group",
              course_id: course.id,
              schedule_id: sched.id,
              message: `👤 ${msg.user_name} (${
                msg.user_role === "teacher" ? "Teacher" : "Student"
              }) escribió en ${course.title} - ${sched.group_name || "Grupo"}`,
              timestamp: new Date().toISOString(),
            });
          });

          if (newMessages.length > 0) {
            const lastNotified = newMessages[newMessages.length - 1];
            actions.setLastNotifiedMessage(key, lastNotified.id);
          }
        }
      },
      setNotifications: (notifications) => {
        const store = getStore();
        const userId = store.user?.id;
        if (userId) {
          localStorage.setItem(
            `notifications_${userId}`,
            JSON.stringify(notifications)
          );
        }
        setStore({ notifications });
      },
      // 📽 Traer todas las grabaciones de clases de un curso
      getRecordingsByCourse: async (courseId, scheduleId = null) => {
        try {
          const token = localStorage.getItem("token");
          let url = `http://localhost:3001/api/recordings/${courseId}`;
          if (scheduleId) url += `?schedule_id=${scheduleId}`;

          const resp = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          });

          if (!resp.ok) throw new Error("Error al obtener grabaciones");
          const data = await resp.json();
          console.log(
            "🎥 Grabaciones recibidas para curso:",
            courseId,
            "horario:",
            scheduleId,
            data
          );
          // 🧠 Agregar al store todas las grabaciones para todos los cursos
          const store = getStore();
          setStore({
            videos: [
              ...(store.videos || []).filter((v) => v.course_id !== courseId),
              ...data,
            ],
          });

          return data;
        } catch (err) {
          console.error("❌ Error en getRecordingsByCourse:", err);
          return [];
        }
      },

      // 📤 Subir nueva grabación
      createRecording: async (recordingData) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch("http://localhost:3001/api/recordings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(recordingData),
          });

          if (!resp.ok) throw new Error("Error al crear grabación");
          const data = await resp.json();

          // 🆕 Actualizamos el store de videos
          const store = getStore();
          setStore({
            videos: [...(store.videos || []), data.recording],
          });

          return data.recording;
        } catch (err) {
          console.error("❌ Error en createRecording:", err);
          return null;
        }
      },

      // 🧽 Eliminar grabación
      deleteVideo: async (videoId) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            `http://localhost:3001/api/recordings/${videoId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );

          if (!resp.ok) throw new Error("Error al eliminar grabación");

          const store = getStore();
          setStore({
            videos: (store.videos || []).filter((v) => v.id !== videoId),
          });

          return true;
        } catch (err) {
          console.error("❌ Error en deleteVideo:", err);
          return false;
        }
      },
      // 📢 Publicar / despublicar grabación
      togglePublishRecording: async (recordingId, isPublished) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            `http://localhost:3001/api/recordings/${recordingId}/publish`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({ is_published: isPublished }),
            }
          );

          if (!resp.ok) throw new Error("Error al actualizar publicación");
          const data = await resp.json();

          const store = getStore();
          setStore({
            videos: (store.videos || []).map((v) =>
              v.id === recordingId ? { ...v, is_published: isPublished } : v
            ),
          });

          return data;
        } catch (err) {
          console.error("❌ Error en togglePublishRecording:", err);
          return null;
        }
      },
      updateRecording: async (recordingId, updatedData) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            `http://localhost:3001/api/recordings/${recordingId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify(updatedData),
            }
          );

          if (!resp.ok) throw new Error("Error al actualizar grabación");

          const data = await resp.json();

          // 🆕 Actualiza el store local
          const store = getStore();
          setStore({
            videos: (store.videos || []).map((v) =>
              v.id === recordingId ? { ...v, ...data.recording } : v
            ),
          });

          return true;
        } catch (err) {
          console.error("❌ Error en updateRecording:", err);
          return false;
        }
      },
      showNotification: (type, message) => {
        setStore({
          notification: {
            show: true,
            type,
            message,
          },
        });
        setTimeout(() => {
          setStore({
            notification: {
              show: false,
              type: "",
              message: "",
            },
          });
        }, 4000);
      },
      setLastPaymentId: (id) => {
        setStore({ lastPaymentId: id });
      },

      closeNotification: () => {
        setStore({
          notification: {
            show: false,
            type: "",
            message: "",
          },
        });
      },
      // 🎯 Crear PaymentIntent en Stripe
      createPaymentIntent: async (courseId, scheduleId = null) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            "http://localhost:3001/api/create-checkout-session",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({
                course_id: courseId,
                schedule_id: scheduleId,
                currency: "usd",
              }),
            }
          );

          if (!resp.ok) throw new Error("Error al crear PaymentIntent");
          const data = await resp.json();

          console.log("💳 PaymentIntent creado:", data);
          return data;
        } catch (err) {
          console.error("❌ Error en createPaymentIntent:", err);
          return null;
        }
      },
      createPaypalOrder: async (course_id, schedule_id) => {
        try {
          const token = localStorage.getItem("token"); // 👈 SIN JSON.parse
          if (!token) {
            console.error("No JWT token in localStorage");
            return null;
          }
          // 🧭 AGREGA AQUÍ LOS CONSOLE.LOG
          console.log("🧭 DEBUG PAYPAL ORDER:");
          console.log("course_id:", course_id);
          console.log("schedule_id:", schedule_id);

          const resp = await fetch(
            "http://localhost:3001/api/paypal/create-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // 👈 token plano
              },
              body: JSON.stringify({ course_id, schedule_id }),
            }
          );

          const data = await resp.json().catch(() => null);
          if (!resp.ok) {
            console.error("createPaypalOrder failed", resp.status, data);
            return null;
          }
          return data; // { id, links: [...] }
        } catch (err) {
          console.error("createPaypalOrder error:", err);
          return null;
        }
      },

      capturePaypalOrder: async (orderId) => {
        try {
          const token = localStorage.getItem("token"); // 👈 SIN JSON.parse
          if (!token) {
            console.error("No JWT token in localStorage");
            return { error: true };
          }

          const resp = await fetch(
            `http://localhost:3001/api/paypal/capture-order/${orderId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // 👈 token plano
              },
            }
          );

          const data = await resp.json().catch(() => null);
          if (!resp.ok) {
            console.error("capturePaypalOrder failed", resp.status, data);
            return { error: true };
          }
          return data;
        } catch (err) {
          console.error("capturePaypalOrder error:", err);
          return { error: true };
        }
      },
      uploadVideoToBackend: async (
        file,
        title,
        course_id,
        schedule_id = null,
        lessons = []
      ) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No estás autenticado");

          const fd = new FormData();
          fd.append("file", file);
          fd.append("title", title);
          fd.append("course_id", course_id);
          if (schedule_id) fd.append("schedule_id", schedule_id);

          fd.append("lessons", JSON.stringify(lessons)); // 👈 SUPER IMPORTANTE

          const resp = await fetch("http://localhost:3001/api/upload-video", {
            method: "POST",
            headers: { Authorization: "Bearer " + token },
            body: fd,
          });

          const data = await resp.json();
          if (!resp.ok) throw new Error(data.msg || "Error al subir el video");

          await getActions().getRecordingsByCourse(course_id, schedule_id);

          getActions().showNotification(
            "success",
            "🎥 Video subido con éxito!"
          );
          return data.recording;
        } catch (err) {
          console.error("❌ uploadVideoToBackend:", err);
          getActions().showNotification("error", err.message);
          return null;
        }
      },
    },
  };
};

export default getState;
