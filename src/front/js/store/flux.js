const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      user: JSON.parse(localStorage.getItem("user")) || null,
      token: localStorage.getItem("token") || null,
      studentsByTeacher: [],
      courses: [],
      myEnrollments: [],
      teacherStats: { total_courses: 0, total_students: 0 },
      coursesLoading: false,
      coursesError: null,
      selectedCourse: null,
      selectedCourseLoading: false,
      selectedCourseError: null,
      notifications: JSON.parse(localStorage.getItem("notifications")) || [],
      lastNotifiedMessage:
        JSON.parse(localStorage.getItem("lastNotifiedMessage")) || {},
    },
    actions: {
      loginUser: async (email, password) => {
        try {
          const resp = await fetch("http://localhost:3001/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await resp.json();
          if (!resp.ok) throw new Error(data.msg || "Login failed");

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          setStore({ user: data.user, token: data.token });
          return true;
        } catch (err) {
          console.error("Error in loginUser:", err);
          return false;
        }
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
              total_active_chats: totalActiveChats, // 👈 se actualiza automáticamente
            },
          });

          return data;
        } catch (err) {
          console.error("Error in getTeacherCourses:", err);
          return [];
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
        const newNotification = { ...notification, is_read: false };
        const updated = [newNotification, ...store.notifications];

        // 📝 Guardamos en localStorage
        localStorage.setItem("notifications", JSON.stringify(updated));
        setStore({ notifications: updated });
      },

      getUnreadCount: () => {
        const store = getStore();
        return store.notifications.filter((n) => !n.is_read).length;
      },

      removeNotification: (id) => {
        const store = getStore();
        const updated = store.notifications.filter((n) => n.id !== id);

        localStorage.setItem("notifications", JSON.stringify(updated));
        setStore({ notifications: updated });
      },

      markNotificationAsRead: (id) => {
        const store = getStore();
        const notification = store.notifications.find((n) => n.id === id);

        if (notification) {
          if (notification.course_id) {
            getActions().setLastNotifiedMessage(notification.course_id, id);
          }
        }

        const updated = store.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );

        // 📝 Persistimos cambios
        localStorage.setItem("notifications", JSON.stringify(updated));
        setStore({ notifications: updated });
      },

      setLastNotifiedMessage: (key, messageId) => {
        const store = getStore();
        const updated = {
          ...store.lastNotifiedMessage,
          [key]: messageId, // 👈 key = courseId-scheduleId
        };

        localStorage.setItem("lastNotifiedMessage", JSON.stringify(updated));
        setStore({ lastNotifiedMessage: updated });
      },

      checkNewNotifications: async () => {
        const store = getStore();
        const actions = getActions();

        // 📌 Recorremos cada curso
        for (let course of store.courses) {
          // ⚠️ Aseguramos que el curso tenga grupos (schedules)
          if (!Array.isArray(course.schedules) || course.schedules.length === 0)
            continue;

          // 📌 Recorremos cada grupo de ese curso
          for (let sched of course.schedules) {
            const messages = await actions.getCourseChat(course.id, sched.id);
            if (!messages.length) continue;

            // ✅ Usamos un identificador único por curso y grupo
            const key = `${course.id}-${sched.id}`;
            const lastNotifiedId = store.lastNotifiedMessage[key];

            // 🧠 Si no hay último notificado, consideramos todos los mensajes
            const newMessages = lastNotifiedId
              ? messages.filter((msg) => msg.id > lastNotifiedId)
              : messages;

            // 🚀 Agregar notificación por cada mensaje nuevo (excepto los míos)
            newMessages.forEach((msg) => {
              if (msg.user_id === store.user?.id) return; // Ignorar mis mensajes

              const alreadyExists = store.notifications.find(
                (n) => n.id === msg.id
              );
              if (!alreadyExists) {
                actions.addNotification({
                  id: msg.id,
                  type: "group",
                  course_id: course.id,
                  schedule_id: sched.id, // 👈 importante para saber en qué grupo fue
                  message: `${msg.user_name} escribió en ${course.title} - ${
                    sched.group_name || "Grupo"
                  }`,
                  timestamp: new Date().toISOString(),
                });
              }
            });

            // 📝 Guardar el ID del último mensaje como referencia para este grupo
            const lastMsg = messages[messages.length - 1];
            if (lastMsg) {
              actions.setLastNotifiedMessage(key, lastMsg.id);
            }
          }
        }
      },
    },
  };
};

export default getState;
