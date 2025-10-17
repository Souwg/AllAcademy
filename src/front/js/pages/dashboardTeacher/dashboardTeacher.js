import React, { useContext, useEffect, useState } from "react";
import { TeacherSidebar } from "../dashboardTeacher/sidebarTeacher";
import { Context } from "../../store/appContext";
import "../../../styles/dashboardTeacher.css";
import noImage from "../../../img/noImage.jpg";
import { CourseChatModal } from "../dashboardStudent/courseChatModal";
import { PrivateChatModal } from "../dashboardStudent/privateChatModal";

export const DashboardTeacher = () => {
  const { store, actions } = useContext(Context);
  const { user, teacherStats } = store;
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatCourse, setSelectedChatCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [showStudentProfile, setShowStudentProfile] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPrivateChatModal, setShowPrivateChatModal] = useState(false);
  const [privateMessages, setPrivateMessages] = useState([]); // 👈 NUEVO

  useEffect(() => {
    const interval = setInterval(async () => {
      // 📥 Trae mensajes de todos los cursos del teacher
      for (let course of store.courses) {
        const messages = await actions.getCourseChat(course.id);
        const lastMsg = messages[messages.length - 1];

        // Si el mensaje es nuevo, crear una notificación
        if (lastMsg && !store.notifications.some((n) => n.id === lastMsg.id)) {
          actions.addNotification({
            id: lastMsg.id,
            type: "group",
            message: `${lastMsg.user_name} escribió en ${course.title}`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }, 10000); // cada 10s

    return () => clearInterval(interval);
  }, [store.courses]);

  const openStudentsModal = async (course) => {
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

  // 📌 Agrupamos por estudiante para combinar cursos
  const groupedStudents = Object.values(
    store.studentsByTeacher.reduce((acc, student) => {
      if (!acc[student.id]) {
        acc[student.id] = {
          ...student,
          courses: [],
        };
      }
      acc[student.id].courses.push({
        title: student.course_title,
        progress: student.progress,
        enrolled_at: student.enrolled_at,
      });
      return acc;
    }, {})
  );

  const filteredStudents = groupedStudents.filter((student) => {
    const query = searchTerm.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(query) ||
      student.last_name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.courses.some((c) => c.title.toLowerCase().includes(query))
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

  const openChatModal = async (course) => {
    const msgs = await actions.getCourseChat(course.id);
    setSelectedChatCourse({ ...course, messages: msgs });
    setShowChatModal(true);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedChatCourse(null);
  };

  const openStudentProfile = (student) => {
    setSelectedStudent(student);
    setShowStudentProfile(true);
  };

  const closeStudentProfile = () => {
    setSelectedStudent(null);
    setShowStudentProfile(false);
  };

  // 👇 NUEVO — Abrir chat privado cargando primero los mensajes
  const openPrivateChat = async (student) => {
    const data = await actions.getPrivateChat(student.id);
    setPrivateMessages(data);
    setSelectedStudent(student);
    setShowPrivateChatModal(true);
  };

  const renderSection = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="container container-banner teacher-banner">
            <h3>👋 Welcome back, {user?.first_name || "Teacher"}</h3>
            <p>Here’s a quick overview of your teaching activity today.</p>

            <div className="row ">
              <div className="col-12 col-lg-9">
                {/* Stats */}
                <div className="d-flex gap-4 flex-wrap mt-4">
                  <div className="card stats-card d-flex flex-row align-items-center flex-fill shadow-sm">
                    <div className="stats-icon bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3">
                      <i className="fa-solid fa-book fa-5x"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Courses</h6>
                      <h2 className="fw-bold text-primary mb-0">
                        {teacherStats?.total_courses || 0}
                      </h2>
                    </div>
                  </div>

                  <div className="card stats-card d-flex flex-row align-items-center flex-fill shadow-sm">
                    <div className="stats-icon bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3">
                      <i className="fa-solid fa-user-graduate fa-5x"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Students</h6>
                      <h2 className="fw-bold text-success mb-0">
                        {teacherStats?.total_students || 0}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Lista de cursos */}
                <div className="mt-5">
                  <h4 className="fw-bold mb-4 ms-2 subtitled-dashboard">
                    <i className="fa-solid fa-book me-2"></i> My Courses
                  </h4>

                  <div className="row g-4">
                    {store.courses.length > 0 ? (
                      store.courses.map((course, index) => (
                        <div
                          key={index}
                          className="col-12 col-sm-12 col-lg-6 col-xl-6 d-flex"
                        >
                          <div className="card card-list-course-modern h-100 w-100">
                            <div className="card-img-container">
                              <img
                                src={course.image_url || noImage}
                                className="card-img-top img-fluid modern-img"
                                alt={course.title}
                              />
                            </div>
                            <div className="card-body d-flex flex-column">
                              <h5 className="card-title modern-title">
                                {course.title}
                              </h5>
                              <div className="d-flex gap-2 mt-auto flex-wrap">
                                <button className="btn modern-btn-success flex-grow-1">
                                  <i className="fa-solid fa-graduation-cap me-1"></i>{" "}
                                  Class
                                </button>
                                <button
                                  className="btn modern-btn-primary flex-grow-1"
                                  onClick={() => openChatModal(course)}
                                >
                                  <i className="fa-regular fa-comments me-1"></i>{" "}
                                  Chat
                                </button>
                                <button
                                  className="btn modern-btn-dark flex-grow-1"
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
              </div>
              {/* 🛎️ Columna de Notificaciones */}
              <div className="col-12 col-md-12 col-lg-3 mb-4">
                <div className="card notification-panel shadow-sm border-0 rounded-4">
                  <div
                    className="card-header notification-header bg-white border-0 d-flex justify-content-between align-items-center flex-wrap"
                    style={{
                      borderTopRightRadius: "15px",
                      borderTopLeftRadius: "15px",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 flex-nowrap">
                      <div className="notification-icon-bell d-flex align-items-center justify-content-center">
                        <i className="fa-regular fa-bell text-warning"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold text-dark notification-title">
                        Notifications
                      </h5>
                    </div>

                    <button className="btn btn-sm btn-light rounded-circle p-2 mt-2 mt-md-0">
                      <i className="fa-solid fa-rotate"></i>
                    </button>
                  </div>

                  <div className="card-body p-3 notification-body">
                    <div className="notification-item border-start border-4 border-primary mb-3 p-2 rounded-3 bg-light-subtle">
                      <small>
                        <strong>New enrollment:</strong> Rosa joined Advanced
                        Math.
                      </small>
                    </div>

                    <div className="notification-item border-start border-4 border-success mb-3 p-2 rounded-3 bg-light-subtle">
                      <small>
                        <strong>New message:</strong> Student sent a question.
                      </small>
                    </div>

                    <div className="notification-item border-start border-4 border-warning mb-3 p-2 rounded-3 bg-light-subtle">
                      <small>
                        <strong>Reminder:</strong> Live class starts in 1 hour.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "students":
        return (
          <div className="container teacher-students-section">
            <div className="teacher-banner">
              <h3 className="fw-bold m-0">
                <i className="fa-solid fa-graduation-cap"></i> My Students
              </h3>
            </div>

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
                            <strong>{student.first_name}</strong>{" "}
                            {student.last_name}
                          </div>
                        </td>
                        <td>{student.email}</td>
                        <td>
                          <div className="course-badges-container">
                            {student.courses.map((course, i) => (
                              <span
                                key={i}
                                className="course-badge"
                                title={course.title}
                              >
                                <i className="fa-solid fa-book-open me-1"></i>
                                {course.title.length > 25
                                  ? course.title.slice(0, 25) + "..."
                                  : course.title}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          {new Date(
                            Math.max(
                              ...student.courses.map(
                                (c) => new Date(c.enrolled_at)
                              )
                            )
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn details-btn"
                              onClick={() => openStudentProfile(student)}
                            >
                              View
                            </button>
                            <button
                              className="action-btn block-btn"
                              onClick={() => openPrivateChat(student)}
                            >
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

      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      <TeacherSidebar activeView={activeView} setActiveView={setActiveView} />

      {renderSection()}

      {showChatModal && (
        <CourseChatModal
          show={showChatModal}
          onClose={closeChatModal}
          course={selectedChatCourse}
        />
      )}

      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-solid fa-user-group me-2"></i> Students in{" "}
                  {selectedCourse?.title}
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

      {showStudentProfile && selectedStudent && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  <i className="fa-solid fa-user me-2"></i>
                  Student Profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeStudentProfile}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6 className="fw-bold mb-3 text-primary">
                    Basic Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Name:</strong> {selectedStudent.first_name}{" "}
                        {selectedStudent.last_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedStudent.email}
                      </p>
                      <p>
                        <strong>Country:</strong>{" "}
                        {selectedStudent.country || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold mb-3 text-primary">
                    Enrolled Courses
                  </h6>
                  {selectedStudent.courses &&
                  selectedStudent.courses.length > 0 ? (
                    selectedStudent.courses.map((c, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                      >
                        <div>
                          <i className="fa-solid fa-book-open me-2 text-primary"></i>
                          {c.title}
                        </div>
                        <div className="text-muted">{c.progress || 0}%</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No courses found.</p>
                  )}
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold mb-3 text-primary">Activity</h6>
                  <p>
                    <strong>Last login:</strong>{" "}
                    {selectedStudent.last_login
                      ? new Date(selectedStudent.last_login).toLocaleString()
                      : "No activity yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrivateChatModal && selectedStudent && (
        <PrivateChatModal
          chatUser={selectedStudent}
          initialMessages={privateMessages}
          onClose={() => setShowPrivateChatModal(false)}
        />
      )}
    </div>
  );
};
