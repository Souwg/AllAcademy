// flux.js
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
          const MIN_COURSES = 4;
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

          console.log("📊 Datos recibidos del backend:", data.stats);

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
      enrollCourse: async (courseId) => {
        try {
          const resp = await fetch(
            `http://localhost:3001/api/enroll/${courseId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            }
          );

          if (!resp.ok) throw new Error("Error enrolling in course");
          const data = await resp.json();
          console.log("Enrollment successful:", data);
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
      getCourseChat: async (courseId) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            `http://localhost:3001/api/course/${courseId}/chat`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );

          if (!resp.ok)
            throw new Error("Error al obtener los mensajes del chat");
          const data = await resp.json();

          console.log("Mensajes del curso:", data);
          return data; // el componente los recibe directamente
        } catch (err) {
          console.error("Error en getCourseChat:", err);
          return [];
        }
      },

      postCourseChat: async (courseId, content) => {
        try {
          const token = localStorage.getItem("token");
          const resp = await fetch(
            `http://localhost:3001/api/course/${courseId}/chat`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({ content }),
            }
          );

          if (!resp.ok) throw new Error("Error al enviar el mensaje");
          const data = await resp.json();

          console.log("Mensaje enviado:", data);
          return data; // se añade al chat localmente
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

          // Calcular totales
          const totalCourses = data.length;
          const totalStudents = data.reduce(
            (acc, course) => acc + (course.total_students || 0),
            0
          );

          // ✅ Aquí guardamos los cursos en el store
          setStore({
            courses: data, // 👈 importante
            teacherStats: {
              total_courses: totalCourses,
              total_students: totalStudents,
            },
          });

          console.log("📚 Cursos del teacher:", data);
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
          console.log("👩‍🎓 Students by teacher:", data);

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
          console.log(`👩‍🎓 Students for course ${courseId}:`, data);
          return data;
        } catch (err) {
          console.error("Error in getStudentsByCourse:", err);
          return [];
        }
      },
    },
  };
};

export default getState;
