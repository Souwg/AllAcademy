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
  const [privateMessages, setPrivateMessages] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);

  const openGroupManagementModal = async (course, group) => {
    const allStudents = await actions.getStudentsByCourse(course.id);
    const filtered = allStudents.filter((s) => s.schedule_id === group.id);
    setSelectedCourse(course);
    setSelectedGroup(group);
    setGroupStudents(filtered);
    setShowGroupModal(true);
  };

  const closeGroupManagementModal = () => {
    setSelectedGroup(null);
    setGroupStudents([]);
    setShowGroupModal(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      actions.checkNewNotifications();
    }, 5000);

    return () => clearInterval(interval); // 🧹 limpieza al desmontar
  }, [actions]);

  const openStudentsModal = async (course, groupId = null) => {
    const students = await actions.getStudentsByCourse(course.id);

    const filteredStudents = groupId
      ? students.filter((student) => student.schedule_id === groupId)
      : students;

    setSelectedCourse(course);
    setCourseStudents(filteredStudents);
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

  const openChatModal = async (course, scheduleId = null) => {
    const targetScheduleId = scheduleId || course.schedules?.[0]?.id || null;
    if (!targetScheduleId) return;

    setSelectedScheduleId(targetScheduleId);
    setSelectedChatCourse({ ...course, messages: [] });
    setShowChatModal(true);

    const msgs = await actions.getCourseChat(course.id, targetScheduleId);
    setSelectedChatCourse({ ...course, messages: msgs });
  };

  const handleGroupChange = async (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    const msgs = await actions.getCourseChat(selectedChatCourse.id, scheduleId);
    setSelectedChatCourse((prev) => ({
      ...prev,
      messages: msgs,
    }));
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
          <div className="container-fluid">
            <div className="modern-banner">
              <div className="banner-left">
                <div className="greeting-icon">
                  <i className="fa-regular fa-hand-peace"></i>
                </div>
                <div>
                  <h2 className="banner-title">
                    Welcome back,{" "}
                    <span className="banner-name">
                      {user?.first_name || "Teacher"}
                    </span>{" "}
                    👋
                  </h2>
                  <p className="banner-subtitle">
                    Here’s a personalized overview of your teaching activity
                    today.
                  </p>
                </div>
              </div>
            </div>

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
                      <h2 className="fw-bold text-primary text-center mb-0">
                        {teacherStats?.total_courses || 0}
                      </h2>
                    </div>
                  </div>
                  <div className="card stats-card d-flex flex-row align-items-center flex-fill shadow-sm">
                    <div className="stats-icon bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center me-3">
                      <i className="fa-solid fa-users fa-5x"></i>
                    </div>
                    <div>
                      <h6 className="text-muted ms-2 mb-1">Total Groups</h6>
                      <h2 className="fw-bold text-warning text-center mb-0">
                        {teacherStats?.total_groups || 0}
                      </h2>
                    </div>
                  </div>

                  <div className="card stats-card d-flex flex-row align-items-center flex-fill shadow-sm">
                    <div className="stats-icon bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3">
                      <i className="fa-solid fa-user-graduate fa-5x"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Students</h6>
                      <h2 className="fw-bold text-success text-center mb-0">
                        {teacherStats?.total_students || 0}
                      </h2>
                    </div>
                  </div>
                  <div className="card stats-card d-flex flex-row align-items-center flex-fill shadow-sm">
                    <div className="stats-icon bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-3">
                      <i className="fa-regular fa-comments fa-5x"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Active Chats</h6>
                      <h2 className="fw-bold text-info text-center mb-0">
                        {teacherStats?.total_active_chats || 0}
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
                      store.courses.map((course, index) => {
                        return (
                          <div
                            key={index}
                            className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4 d-flex"
                          >
                            <div className="card card-list-course-modern h-100 w-100 ms-0">
                              <div className="card-img-container">
                                <img
                                  src={course.image_url || noImage}
                                  className="card-img-top img-fluid modern-img"
                                  alt={course.title}
                                />
                              </div>
                              <div className="card-body d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start">
                                  <h5 className="card-title modern-title">
                                    {course.title}
                                  </h5>
                                </div>

                                {/* Acciones generales si quieres */}
                                <div className="d-flex gap-2 mt-2 flex-wrap">
                                  <button className="btn modern-btn-success flex-grow-1">
                                    <i className="fa-solid fa-graduation-cap me-1"></i>{" "}
                                    Class
                                  </button>
                                  <button
                                    className="btn modern-btn-dark flex-grow-1"
                                    onClick={() => openStudentsModal(course)}
                                  >
                                    <i className="fa-solid fa-user-group me-1"></i>{" "}
                                    Students
                                  </button>
                                </div>

                                {/* GRUPOS — Sección expandible */}
                                {course.schedules &&
                                  course.schedules.length > 0 && (
                                    <div className="groups-list mt-3">
                                      {course.schedules.map((group) => (
                                        <div
                                          key={group.id}
                                          className="group-item"
                                        >
                                          <div className="group-info">
                                            <i className="fa-solid fa-users me-2 text-primary"></i>
                                            <div className="d-flex flex-column">
                                              <strong>
                                                {group.group_name}
                                              </strong>
                                              <span className="group-days text-muted">
                                                {group.day_of_week
                                                  .split(",")
                                                  .join(", ")}
                                              </span>
                                              <span className="group-time text-muted">
                                                {group.start_time} -{" "}
                                                {group.end_time}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="group-actions">
                                            <button
                                              className="group-action-btn chat-btn"
                                              title="Chat del grupo"
                                              onClick={() =>
                                                openChatModal(course, group.id)
                                              }
                                            >
                                              <i className="fa-regular fa-comments"></i>
                                            </button>

                                            <button
                                              className="group-action-btn students-btn"
                                              title="Ver estudiantes"
                                              onClick={() =>
                                                openStudentsModal(
                                                  course,
                                                  group.id
                                                )
                                              }
                                            >
                                              <i className="fa-solid fa-user-group"></i>
                                            </button>

                                            <button
                                              className="group-action-btn schedule-btn"
                                              title="Administrar grupo"
                                              onClick={() =>
                                                openGroupManagementModal(
                                                  course,
                                                  group
                                                )
                                              }
                                            >
                                              <i className="fa-solid fa-gear"></i>
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="wrapper">
                        <div className="blue ball"></div>
                        <div className="red ball"></div>
                        <div className="yellow ball"></div>
                        <div className="green ball"></div>
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
                    <div className="d-flex align-items-center gap-2 flex-nowrap position-relative">
                      <div className="notification-icon-bell d-flex align-items-center justify-content-center position-relative">
                        <i className="fa-regular fa-bell text-warning fs-5"></i>

                        {actions.getUnreadCount() > 0 && (
                          <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {actions.getUnreadCount()}
                          </span>
                        )}
                      </div>

                      <h5 className="mb-0 fw-semibold text-dark notification-title">
                        Notifications
                      </h5>
                    </div>

                    <button
                      className="btn btn-sm btn-success p-2 mt-2 mt-md-0"
                      style={{ borderRadius: "15px" }}
                      onClick={() => actions.checkNewNotifications()}
                    >
                      <i className="fa-solid fa-rotate"></i>
                    </button>
                  </div>

                  <div className="card-body p-3 notification-body">
                    {store.notifications.length === 0 ? (
                      <div className="text-center text-muted py-3">
                        No notifications yet
                      </div>
                    ) : (
                      store.notifications
                        .filter((n) => !n.is_read)
                        .map((n) => (
                          <div
                            key={n.id}
                            onClick={async () => {
                              if (n.type === "group") {
                                const course = store.courses.find(
                                  (c) => c.id === n.course_id
                                );
                                if (course) {
                                  // 1) Limpia estado para evitar parpadeos
                                  setSelectedChatCourse(null);
                                  setSelectedScheduleId(null);

                                  // 2) (opcional) abre el modal ya vacío
                                  setShowChatModal(true);

                                  // 3) Carga mensajes DEL GRUPO correcto
                                  const msgs = await actions.getCourseChat(
                                    course.id,
                                    n.schedule_id
                                  );

                                  // 4) Pinta el curso con mensajes + marca el mensaje objetivo
                                  setSelectedChatCourse({
                                    ...course,
                                    messages: msgs,
                                    scrollToMessageId: n.id,
                                  });

                                  // 5) Fija el grupo correcto en el selector
                                  setSelectedScheduleId(n.schedule_id);
                                }
                              }
                              actions.markNotificationAsRead(n.id);
                            }}
                            className={`notification-item border-start border-4 ${
                              n.type === "group"
                                ? "border-primary"
                                : n.type === "private"
                                ? "border-success"
                                : "border-warning"
                            } mb-3 p-2 rounded-3 bg-light-subtle cursor-pointer`}
                          >
                            <small>
                              <strong>
                                {n.type === "group"
                                  ? "Group message:"
                                  : "Notification:"}
                              </strong>{" "}
                              {n.message}
                            </small>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "students":
        return (
          <div className="container teacher-students-section">
            {/* ✨ Banner */}
            <div className="teacher-students-banner-modern">
              <div className="banner-icon">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="banner-content">
                <h2 className="banner-title">My Students</h2>
                <p className="banner-subtitle">
                  Manage, message and view all your enrolled students easily ✨
                </p>
              </div>
            </div>

            {/* 🔍 Barra de búsqueda */}
            <div className="teacher-search-bar mb-4">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                className="teacher-search-input"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 🧑‍🎓 Tabla o estado vacío */}
            {filteredStudents.length === 0 ? (
              <div className="empty-state-modern text-center">
                <i className="fa-regular fa-face-frown mb-2"></i>
                <p>No students found.</p>
              </div>
            ) : (
              <div className="students-table-wrapper">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Enrollment</th>
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
                              <span key={i} className="course-badge">
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
                              className="action-btn modern-view-btn"
                              onClick={() => openStudentProfile(student)}
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button
                              className="action-btn modern-msg-btn"
                              onClick={() => openPrivateChat(student)}
                            >
                              <i className="fa-regular fa-paper-plane"></i>
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
      case "my-courses":
        return (
          <div className="container-fluid my-courses-section">
            {/* ✨ Banner de sección */}
            <div className="teacher-students-banner-modern mb-4">
              <div className="banner-icon">
                <i className="fa-solid fa-video"></i>
              </div>
              <div className="banner-content">
                <h2 className="banner-title">My Class Videos</h2>
                <p className="banner-subtitle">
                  View and manage the recordings of your classes 📹
                </p>
              </div>
            </div>

            {/* 📂 Listado de cursos con sus videos */}
            {store.courses.length > 0 ? (
              store.courses.map((course) => {
                const videos =
                  store.videos?.filter((v) => v.course_id === course.id) || [];
                return (
                  <div key={course.id} className="course-card-video mb-5">
                    <div className="d-flex align-items-center mb-3 gap-3">
                      <img
                        src={course.image_url || noImage}
                        alt={course.title}
                        className="course-img-thumbnail"
                      />
                      <h4 className="fw-bold">{course.title}</h4>
                    </div>

                    {videos.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {videos.map((video) => (
                          <li
                            key={video.id}
                            className="list-group-item d-flex justify-content-between align-items-center video-item"
                          >
                            <div>
                              <i className="fa-solid fa-video me-2 text-primary"></i>
                              <strong>{video.title}</strong>
                              <div className="small text-muted">
                                {video.group_name} •{" "}
                                {new Date(video.date).toLocaleDateString()} •{" "}
                                {video.duration} min
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-primary"
                              >
                                <i className="fa-solid fa-play me-1"></i> Watch
                              </a>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => actions.deleteVideo(video.id)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted ps-2">
                        No videos uploaded yet 🎥
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-muted text-center py-5">
                No courses available.
              </div>
            )}
          </div>
        );
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
          selectedScheduleId={selectedScheduleId}
          originalScheduleId={selectedScheduleId}
          onGroupChange={handleGroupChange}
          role="teacher" // ✅ Teacher
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
                  Object.entries(
                    courseStudents.reduce((acc, student) => {
                      const groupName =
                        student.schedule?.group_name || "Sin grupo";
                      if (!acc[groupName]) acc[groupName] = [];
                      acc[groupName].push(student);
                      return acc;
                    }, {})
                  )
                    .sort(([a], [b]) => a.localeCompare(b)) // opcional para ordenar Grupo A, B, etc.
                    .map(([groupName, students]) => (
                      <div key={groupName} className="mb-4">
                        <h6 className="fw-bold text-primary mb-3">
                          <i className="fa-solid fa-users me-2"></i> {groupName}
                        </h6>

                        <table className="table table-hover align-middle">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Progress</th>
                              <th>Schedule</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((s, i) => (
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td>
                                  {s.first_name} {s.last_name}
                                </td>
                                <td>{s.email}</td>
                                <td>{s.progress}%</td>
                                <td>
                                  {s.schedule
                                    ? `${s.schedule.day_of_week} ${s.schedule.start_time} - ${s.schedule.end_time}`
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))
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
      {showGroupModal && selectedGroup && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  <i className="fa-solid fa-users me-2"></i>
                  Manage Group — {selectedGroup.group_name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeGroupManagementModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* 📋 Información básica */}
                <div className="mb-4">
                  <h6 className="fw-bold text-primary mb-2">
                    Group Information
                  </h6>
                  <p>
                    <strong>Course:</strong> {selectedCourse?.title}
                  </p>
                  <p>
                    <strong>Days:</strong> {selectedGroup.day_of_week}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedGroup.start_time} -{" "}
                    {selectedGroup.end_time}
                  </p>
                  <p>
                    <strong>Total Students:</strong> {groupStudents.length}
                  </p>
                </div>

                {/* 👥 Lista de estudiantes */}
                <div className="mb-4">
                  <h6 className="fw-bold text-primary mb-2">Students</h6>
                  {groupStudents.length > 0 ? (
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupStudents.map((s, i) => (
                          <tr key={s.id}>
                            <td>{i + 1}</td>
                            <td>
                              {s.first_name} {s.last_name}
                            </td>
                            <td>{s.email}</td>
                            <td>{s.progress || 0}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-muted">No students in this group yet.</p>
                  )}
                </div>

                {/* ✨ Acciones futuras */}
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary flex-grow-1">
                    <i className="fa-solid fa-bullhorn me-2"></i> Send
                    Announcement
                  </button>
                  <button
                    className="btn flex-grow-1 text-muted border-0"
                    disabled
                  >
                    <i className="fa-solid fa-pen me-2"></i> Edit Group (soon)
                  </button>
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
