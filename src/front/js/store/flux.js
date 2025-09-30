// flux.js
const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      courses: [],
      coursesLoading: false,
      coursesError: null,
    },
    actions: {
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
    },
  };
};

export default getState;
