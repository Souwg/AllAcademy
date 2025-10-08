import React, { useContext, useEffect, useState } from "react";
import { TeacherSidebar } from "../dashboardTeacher/sidebarTeacher";
import { Context } from "../../store/appContext";
import "../../../styles/dashboardTeacher.css";
import noImage from "../../../img/noImage.jpg";

export const DashboardTeacher = () => {
  const { store, actions } = useContext(Context);
  const { user, teacherStats } = store;
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);

  const openStudentsModal = async (course) => {
    console.log(
      "🔍 Abriendo modal de estudiantes para el curso:",
      course.id,
      course.title
    );
    const students = await actions.getStudentsByCourse(course.id);
    setSelectedCourse(course);
    setCourseStudents(students);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setCourseStudents([]);
  };

  const filteredStudents = store.studentsByTeacher.filter((student) => {
    const query = searchTerm.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(query) ||
      student.last_name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.course_title?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser && (!user || user.id !== localUser.id)) {
      actions.syncWithLocalStorage();
    }
  }, [user, actions]);

  useEffect(() => {
    actions.getTeacherCourses();
  }, []);

  useEffect(() => {
    if (activeView === "students") {
      actions.getTeacherStudents().then((data) => {});
    }
  }, [activeView]);

  // 👇 Renderizado condicional según la sección
  const renderSection = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="container-fluid teacher-dashboard-home">
            {/* Banner */}
            <div className="teacher-welcome-banner">
              <h3 className="fw-bold m-0">
                👋 Welcome back, {user?.first_name || "Teacher"}
              </h3>
            </div>

            {/* Stats arriba */}
            <div className="d-flex gap-3 flex-wrap mt-4">
              <div className="card p-4 text-center flex-fill">
                <h5 className="text-muted">Total Courses</h5>
                <h2 className="fw-bold text-primary">
                  {teacherStats?.total_courses || 0}
                </h2>
              </div>
              <div className="card p-4 text-center flex-fill">
                <h5 className="text-muted">Total Students</h5>
                <h2 className="fw-bold text-success">
                  {teacherStats?.total_students || 0}
                </h2>
              </div>
            </div>

            {/* Lista de cursos */}
            <div className="mt-5">
              <h4 className="fw-bold mb-4 ms-2 text-dark">
                <i className="fa-solid fa-book me-2"></i> My Courses
              </h4>

              <div className="row g-4">
                {store.courses.length > 0 ? (
                  store.courses.map((course, index) => (
                    <div
                      key={index}
                      className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex justify-content-center"
                    >
                      <div className="card h-100">
                        <img
                          src={course.image_url || noImage}
                          className="card-img-top"
                          alt={course.title}
                        />
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">{course.title}</h5>
                          <div className="d-flex gap-2 mt-auto">
                            <button className="btn btn-outline-primary w-100">
                              <i className="fa-regular fa-comments me-1"></i>{" "}
                              Chat
                            </button>
                            <button className="btn btn-outline-success w-100">
                              <i className="fa-solid fa-graduation-cap me-1"></i>{" "}
                              Class
                            </button>
                            <button
                              className="btn btn-outline-dark w-100"
                              onClick={() => openStudentsModal(course)}
                            >
                              <i className="fa-solid fa-user-group me-1"></i>{" "}
                              Students
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-5">
                    <p>No courses available yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* MODAL */}
            {showModal && (
              <div
                className="modal fade show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        <i className="fa-solid fa-user-group me-2"></i> Students
                        in {selectedCourse?.title}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeModal}
                      ></button>
                    </div>
                    <div className="modal-body">
                      {courseStudents.length > 0 ? (
                        <table className="table table-hover align-middle">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Progress</th>
                              <th>Enrollment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courseStudents.map((s, i) => (
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td>
                                  {s.first_name} {s.last_name}
                                </td>
                                <td>{s.email}</td>
                                <td>{s.progress}%</td>
                                <td>{s.enrolled_at || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-center text-muted py-4">
                          No students enrolled yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "my-courses":
        return (
          <div className="container mt-4">
            <h3 className="fw-bold mb-3">
              <i className="fa-solid fa-book-skull m3-2"></i> My Courses
            </h3>
            <p>Here will go the teacher’s course management content.</p>
          </div>
        );

      case "chat":
        return (
          <div className="container mt-4">
            <h3 className="fw-bold mb-3">
              <i className="fa-solid fa-comment me-2"></i> Chat
            </h3>
            <p>Here will go the chat section between teacher and students.</p>
          </div>
        );

      case "students":
        return (
          <div className="container mt-4 teacher-students-section">
            <h3 className="fw-bold mb-3">
              <i class="fa-solid fa-graduation-cap"></i> My Students
            </h3>

            <div className="search-container mb-3">
              <input
                type="text"
                className="search-input"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredStudents.length === 0 ? (
              <div className="empty-state">
                <p>No students found.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Progress</th>
                      <th>Enrollment Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={index}>
                        <td>{student.id}</td>
                        <td>
                          <div className="user-cell">
                            <div>
                              <strong>{student.first_name}</strong>{" "}
                              <span>{student.last_name}</span>
                            </div>
                          </div>
                        </td>
                        <td>{student.email}</td>
                        <td>{student.course_title}</td>
                        <td>
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${student.progress || 0}%` }}
                            ></div>
                            <span className="progress-label">
                              {student.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td>
                          {student.enrolled_at
                            ? new Date(student.enrolled_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn details-btn">
                              View
                            </button>
                            <button className="action-btn block-btn">
                              Message
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="container mt-4">
            <h3 className="fw-bold mb-3">
              <i className="fa-solid fa-gear me-2"></i>Settings
            </h3>
            <p>Here will go configuration options for the teacher account.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar del profesor */}
      <TeacherSidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Contenido dinámico */}
      {renderSection()}
    </div>
  );
};
