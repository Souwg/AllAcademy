import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../store/appContext";
import { StudentSidebar } from "../dashboardStudent/sidebarStudent";
import { CourseChatModal } from "../dashboardStudent/courseChatModal";
import { PrivateChatModal } from "../dashboardStudent/privateChatModal";
import "../../../styles/dashboardStudent.css";
import noImage from "../../../img/noImage.jpg";
import { useNavigate } from "react-router-dom";

export const DashboardStudent = () => {
  const { store, actions } = useContext(Context);
  const { user, myEnrollments, notifications } = store;
  const [activeView, setActiveView] = useState("dashboard");
  const [showChat, setShowChat] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]); // ✅ NUEVO
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [originalScheduleId, setOriginalScheduleId] = useState(null);
  const [studentAssignments, setStudentAssignments] = useState({});
  useEffect(() => {
    if (activeView === "dashboard" || activeView === "my-courses") {
      if (user && myEnrollments.length > 0) {
        console.log("🔄 Refreshing student progress...");
        actions.refreshStudentProgress();
      }
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === "my-assignments" && myEnrollments.length > 0) {
      myEnrollments.forEach((enroll) => {
        const courseId = enroll.course.id;
        const scheduleId = enroll.schedule.id;
        loadAssignments(courseId, scheduleId);
      });
    }
  }, [activeView, myEnrollments]);

  const loadAssignments = async (courseId, scheduleId) => {
    const assignments = await actions.getStudentAssignmentsBySchedule(
      courseId,
      scheduleId
    );
    setStudentAssignments((prev) => ({
      ...prev,
      [`${courseId}-${scheduleId}`]: assignments || [],
    }));
  };

  const submitAssignment = async (assignmentId, courseId, scheduleId) => {
    const resp = await actions.submitAssignment(assignmentId);

    if (!resp || resp.success === false) {
      alert(resp?.msg || "Error submitting assignment");
      return;
    }

    // 👌 Recargar las tareas del estudiante para ese curso y schedule
    await loadAssignments(courseId, scheduleId);
  };

  const openPrivateChat = async (teacher) => {
    const messages = await actions.getPrivateChat(teacher.id);
    setSelectedTeacher(teacher); // ✅ sólo guardamos al teacher
    setPrivateMessages(messages); // ✅ mensajes en estado separado
    setShowPrivateChat(true);
  };

  const closePrivateChat = () => {
    setSelectedTeacher(null);
    setPrivateMessages([]); // ✅ limpiamos mensajes al cerrar
    setShowPrivateChat(false);
  };

  useEffect(() => {
    console.log("📚 myEnrollments:", myEnrollments);

    if (myEnrollments.length > 0) {
      const uniqueTeachers = [];
      const seenIds = new Set();

      myEnrollments.forEach((enroll) => {
        const course = enroll.course;
        if (course && course.teacher_id && !seenIds.has(course.teacher_id)) {
          seenIds.add(course.teacher_id);
          uniqueTeachers.push({
            id: course.teacher_id,
            name: course.instructor || "Unknown Teacher",
            bio: course.instructorBio || "",
            avatar_url:
              course.instructorImage || "https://via.placeholder.com/80",
          });
        }
      });

      console.log("👩‍🏫 Teachers detectados:", uniqueTeachers);
      setTeachers(uniqueTeachers);
    }
  }, [myEnrollments]);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser && (!user || user.id !== localUser.id)) {
      actions.syncWithLocalStorage();
      const stored =
        JSON.parse(localStorage.getItem(`notifications_${localUser.id}`)) || [];
      actions.setNotifications(stored);
    }
  }, [user, actions]);

  useEffect(() => {
    console.log("📚 myEnrollments:", myEnrollments);
    actions.getMyEnrollments();
  }, []);

  useEffect(() => {
    if (user && user.role === "student" && myEnrollments.length > 0) {
      const interval = setInterval(() => {
        actions.checkNewNotifications("student");
      }, 10000); // ⏳ cada 10 segundos

      return () => clearInterval(interval);
    }
  }, [user, myEnrollments]);

  useEffect(() => {
    if (myEnrollments.length > 0) {
      myEnrollments.forEach((enroll) => {
        const courseId = enroll.course?.id;
        const scheduleId = enroll.schedule?.id;
        if (courseId && scheduleId) {
          actions.getRecordingsByCourse(courseId, scheduleId);
        }
      });
    }
  }, [myEnrollments]);

  const openChat = async (course) => {
    const enrollment = myEnrollments.find((e) => e.course.id === course.id);
    const initialScheduleId = enrollment?.schedule?.id || null;

    setSelectedScheduleId(initialScheduleId);
    setOriginalScheduleId(initialScheduleId); // 👈 guardamos el grupo original

    const msgs = await actions.getCourseChat(course.id, initialScheduleId);
    setSelectedCourse({ ...course, messages: msgs });
    setShowChat(true);
  };

  const closeChat = () => {
    setSelectedCourse(null);
    setShowChat(false);
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
                      {user?.first_name || "student"}
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

            <div className="row">
              {/* 📊 Stats + Courses */}
              <div className="col-12 col-lg-9">
                {/* Stats */}
                <div className="d-flex gap-4 flex-wrap mt-4">
                  <div className="card stats-card d-flex flex-row align-items-center flex-fill shadow-sm">
                    <div className="stats-icon bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3">
                      <i className="fa-solid fa-book fa-5x"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Enrolled Courses</h6>
                      <h2 className="fw-bold text-center text-primary mb-0">
                        {myEnrollments?.length || 0}
                      </h2>
                    </div>
                  </div>

                  <div className="card stats-card d-flex flex-row align-items-center flex-fill shadow-sm">
                    <div className="stats-icon bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3">
                      <i className="fa-solid fa-check-circle fa-5x"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Completed</h6>
                      <h2 className="fw-bold text-center text-success mb-0">
                        {myEnrollments?.filter((e) => e.progress === 100)
                          .length || 0}
                      </h2>
                    </div>
                  </div>

                  <div className="card stats-card d-flex flex-row align-items-center flex-fill shadow-sm">
                    <div className="stats-icon bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center me-3">
                      <i className="fa-solid fa-hourglass-half fa-5x"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">In Progress</h6>
                      <h2 className="fw-bold text-center text-warning mb-0">
                        {myEnrollments?.filter(
                          (e) => e.progress > 0 && e.progress < 100
                        ).length || 0}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* 📚 Courses */}
                <div className="mt-5">
                  <h4 className="fw-bold mb-4 subtitled-dashboard">
                    <i className="fa-regular fa-bookmark me-2"></i> My Courses
                  </h4>

                  <div className="row g-4 mb-4">
                    {myEnrollments.length > 0 ? (
                      myEnrollments.map((enroll, index) => (
                        <div
                          key={index}
                          className="col-12 col-sm-12 col-lg-6 col-xl-4 d-flex justify-content-center"
                        >
                          <div className="card card-list-course-modern h-100 w-100">
                            <div className="card-img-container">
                              <img
                                src={enroll.course?.image_url || noImage}
                                className="card-img-top img-fluid modern-img"
                                alt={enroll.course?.title || "Course"}
                              />
                            </div>
                            <div className="card-body d-flex flex-column">
                              <h5 className="card-title modern-title">
                                {enroll.course?.title || "Untitled Course"}
                              </h5>
                              <p className="instructor-name text-muted mb-2">
                                By {enroll.course?.instructor || "Instructor"}
                              </p>

                              <div className="mt-auto">
                                <div className="progress modern-progress">
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                      width: `${enroll.progress || 0}%`,
                                    }}
                                    aria-valuenow={enroll.progress || 0}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                                <small className="d-block mt-2 text-muted">
                                  Progress: {enroll.progress || 0}%
                                </small>
                              </div>

                              <div className="d-flex gap-2 mt-3 flex-wrap">
                                <button
                                  className="btn modern-btn-success flex-grow-1"
                                  onClick={() =>
                                    navigate(`/course/${enroll.course?.slug}`)
                                  }
                                >
                                  <i className="fa-solid fa-play me-1"></i>{" "}
                                  Continue
                                </button>

                                <button
                                  className="btn modern-btn-primary flex-grow-1"
                                  onClick={() => openChat(enroll.course)}
                                >
                                  <i className="fa-regular fa-comments me-1"></i>{" "}
                                  Chat
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-5 text-muted">
                        <p>You haven't enrolled in any courses yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🛎️ Panel de Notificaciones */}
              {/* 🛎️ Panel de Notificaciones */}
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
                      <div className="notification-icon-bell d-flex align-items-center justify-content-center position-relative">
                        <i className="fa-regular fa-bell text-warning fs-5"></i>
                        {/* 🔴 Badge (placeholder visual, sin lógica) */}
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {actions.getUnreadCount()}
                        </span>
                      </div>

                      <h5 className="mb-0 fw-semibold text-dark notification-title">
                        Notifications
                      </h5>
                    </div>

                    <button
                      className="btn btn-sm btn-success p-2 mt-2 mt-md-0"
                      style={{ borderRadius: "15px" }}
                      onClick={() => actions.checkNewNotifications("student")}
                    >
                      <i className="fa-solid fa-rotate"></i>
                    </button>
                  </div>

                  <div className="card-body p-3 notification-body">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notification-item border-start border-4 mb-3 p-2 rounded-3 bg-light-subtle cursor-pointer ${
                            n.is_read ? "opacity-50" : ""
                          }`}
                          style={{
                            borderColor:
                              n.type === "group"
                                ? "#0d6efd" // azul para mensajes grupales
                                : n.type === "private"
                                ? "#198754" // verde para privados
                                : "#ffc107", // amarillo para otros
                          }}
                          onClick={async () => {
                            if (n.type === "group") {
                              const enrollment = myEnrollments.find(
                                (e) => e.course.id === n.course_id
                              );

                              if (enrollment) {
                                // 1) Limpia estado para evitar parpadeos
                                setSelectedCourse(null);
                                setSelectedScheduleId(null);

                                // 2) Abre el modal de chat vacío
                                setShowChat(true);

                                // 3) Carga los mensajes del grupo correcto
                                const msgs = await actions.getCourseChat(
                                  n.course_id,
                                  n.schedule_id
                                );

                                // 4) Guarda el curso seleccionado con mensajes y el ID al que se debe scrollear
                                setSelectedCourse({
                                  ...enrollment.course,
                                  messages: msgs,
                                  scrollToMessageId: n.id,
                                });

                                // 5) Selecciona el grupo correcto
                                setSelectedScheduleId(n.schedule_id);
                                setOriginalScheduleId(n.schedule_id);
                              }
                            }

                            // 🧠 🆕 Muy importante: registrar este mensaje como “último leído”
                            const key = `${n.course_id}-${n.schedule_id}`;
                            actions.setLastNotifiedMessage(key, n.id);

                            // 🧼 y remover la notificación visualmente
                            actions.removeNotification(n.id);
                          }}
                        >
                          <small>
                            <strong>
                              {n.type === "group"
                                ? "Group message: "
                                : n.type === "private"
                                ? "Private message: "
                                : "Notification: "}
                            </strong>
                            {n.message}
                          </small>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted py-3">
                        <small>No notifications yet.</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "teacher":
        return (
          <div className="container-fluid">
            <div className="teacher-students-banner-modern mb-4">
              <div className="banner-icon">
                <i className="fa-solid fa-chalkboard-user"></i>
              </div>
              <div className="banner-content">
                <h2 className="banner-title">My Teachers</h2>
                <p className="banner-subtitle">
                  Here you can view all the teachers of the courses you’re
                  enrolled in. Connect with them, ask questions, and stay
                  updated with your learning journey✨.
                </p>
              </div>
            </div>

            <div className="row g-4">
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="col-12 col-sm-6 col-lg-4 d-flex justify-content-center"
                  >
                    <div className="card teacher-card shadow-sm w-100">
                      <div className="card-body text-center">
                        <img
                          src={teacher.avatar_url || noImage}
                          alt={teacher.name}
                          className="rounded-circle mb-3"
                          width="80"
                          height="80"
                        />
                        <h5 className="card-title">{teacher.name}</h5>
                        <p className="text-muted mb-2">
                          {teacher.bio || "Instructor"}
                        </p>

                        <button
                          className="btn btn-primary w-100"
                          onClick={() => openPrivateChat(teacher)}
                        >
                          <i className="fa-regular fa-comments me-2"></i> Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">
                  You don't have any teachers yet.
                </p>
              )}
            </div>
          </div>
        );

      case "my-courses":
        return (
          <div className="container-fluid">
            <div className="teacher-students-banner-modern mb-4">
              <div className="banner-icon">
                <i className="fa-solid fa-chalkboard-user"></i>
              </div>
              <div className="banner-content">
                <h2 className="banner-title">My Class Recordings</h2>
                <p className="banner-subtitle">
                  Watch the recordings published by your teachers.
                </p>
              </div>
            </div>
            {myEnrollments.length > 0 ? (
              myEnrollments.map((enroll) => {
                const course = enroll.course;
                const courseVideos =
                  (store.videos || []).filter(
                    (v) => v.course_id === course.id && v.is_published
                  ) || [];

                if (courseVideos.length === 0) return null;

                const grouped = courseVideos.reduce((acc, video) => {
                  const groupName = video.group_name || "General";
                  if (!acc[groupName]) acc[groupName] = [];
                  acc[groupName].push(video);
                  return acc;
                }, {});

                return (
                  <div
                    key={course.id}
                    className="course-card-video mb-5"
                    style={{
                      background: "#fff",
                      borderRadius: "15px",
                      padding: "1.5rem",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <h4
                      className="fw-bold mb-3"
                      style={{
                        background:
                          "linear-gradient(135deg, #2d3078 0%, #3f42a0 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {course.title}
                    </h4>

                    {Object.entries(grouped).map(([groupName, groupVideos]) => (
                      <div key={groupName} className="mb-4">
                        <h6
                          className="fw-bold mb-2"
                          style={{ color: "#001933" }}
                        >
                          {groupName}
                        </h6>
                        <ul className="list-group list-group-flush">
                          {groupVideos.map((video) => (
                            <li
                              key={video.id}
                              className="list-group-item d-flex justify-content-between align-items-center video-item"
                              style={{
                                background: "#f9fafc",
                                borderRadius: "8px",
                                marginTop: "0.5rem",
                                transition: "background 0.2s ease",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.background = "#eef2ff")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.background = "#f9fafc")
                              }
                            >
                              <div>
                                <strong
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: "700",
                                    background:
                                      "linear-gradient(135deg, #2d3078 0%, #3f42a0 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    letterSpacing: "0.5px",
                                    display: "inline-block",
                                  }}
                                >
                                  {video.title}
                                </strong>

                                <div
                                  className="small text-muted"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {video.created_at
                                    ? new Date(
                                        video.created_at
                                      ).toLocaleDateString()
                                    : "No date"}
                                </div>
                                {video.lessons &&
                                  video.lessons.length > 0 &&
                                  (() => {
                                    const lessonsByModule =
                                      video.lessons.reduce((acc, lesson) => {
                                        const key = lesson.module_id;
                                        if (!acc[key]) {
                                          acc[key] = {
                                            module_title: lesson.module_title,
                                            module_order: lesson.module_order,
                                            lessons: [],
                                          };
                                        }
                                        acc[key].lessons.push(lesson);
                                        return acc;
                                      }, {});

                                    return (
                                      <ul className="mt-2 mb-0 ps-3">
                                        {Object.values(lessonsByModule)
                                          .sort(
                                            (a, b) =>
                                              a.module_order - b.module_order
                                          )
                                          .map((module) => (
                                            <li
                                              key={module.module_order}
                                              className="mt-2"
                                            >
                                              <strong
                                                style={{ fontSize: "0.9rem" }}
                                              >
                                                Module {module.module_order}:{" "}
                                                {module.module_title}
                                              </strong>

                                              <ul className="mt-1">
                                                {module.lessons
                                                  .sort(
                                                    (a, b) => a.order - b.order
                                                  )
                                                  .map((lesson) => (
                                                    <li
                                                      key={lesson.id}
                                                      className="text-muted"
                                                      style={{
                                                        fontSize: "0.85rem",
                                                      }}
                                                    >
                                                      Lesson {lesson.order}:{" "}
                                                      {lesson.title}
                                                    </li>
                                                  ))}
                                              </ul>
                                            </li>
                                          ))}
                                      </ul>
                                    );
                                  })()}
                              </div>

                              <a
                                href={video.url || video.recording_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #2d3078 0%, #3f42a0 100%)",
                                  color: "white",
                                  padding: "8px 16px",
                                  borderRadius: "10px",
                                  fontWeight: "600",
                                  fontSize: "0.9rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  textDecoration: "none",
                                  boxShadow:
                                    "0 4px 10px rgba(45, 48, 120, 0.25)",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(-2px)";
                                  e.currentTarget.style.boxShadow =
                                    "0 6px 14px rgba(45, 48, 120, 0.35)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                  e.currentTarget.style.boxShadow =
                                    "0 4px 10px rgba(45, 48, 120, 0.25)";
                                }}
                              >
                                <i className="fa-solid fa-play"></i> Watch
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted py-5">
                <p>You haven't enrolled in any courses yet.</p>
              </div>
            )}
          </div>
        );
      case "my-assignments":
        return (
          <div className="container-fluid">
            {/* Banner Superior */}
            <div
              className="teacher-students-banner-modern mb-4"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <div className="banner-icon">
                <i className="fa-solid fa-list-check"></i>
              </div>
              <div className="banner-content">
                <h2 className="banner-title">My Assignments</h2>
                <p className="banner-subtitle">
                  View your tasks, check your progress, and submit your work ✨
                </p>
              </div>
            </div>

            {myEnrollments.length === 0 ? (
              <p className="text-muted">You are not enrolled in any course.</p>
            ) : (
              myEnrollments.map((enroll) => {
                const course = enroll.course;
                const schedule = enroll.schedule;

                const key = `${course.id}-${schedule.id}`;
                const assignments = studentAssignments[key] || [];

                return (
                  <div
                    key={key}
                    className="p-4 mb-4 rounded-4 shadow-sm"
                    style={{
                      background: "#fff",
                      borderRadius: "15px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h4
                      className="fw-bold mb-3"
                      style={{
                        background:
                          "linear-gradient(135deg, #2d3078 0%, #3f42a0 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {course.title}
                    </h4>

                    {assignments.length === 0 ? (
                      <p className="text-muted">No assignments loaded.</p>
                    ) : (
                      assignments
                        .flatMap((r) => r.assignments)
                        .map((a) => {
                          const statusColors = {
                            approved: "#22c55e",
                            rejected: "#ef4444",
                            pending: "#eab308",
                            not_submitted: "#6b7280",
                          };

                          return (
                            <div
                              key={a.assignment_id}
                              className="p-4 rounded-4 mb-4 shadow-sm"
                              style={{
                                background: "#f9fafc",
                                borderLeft: `6px solid ${
                                  statusColors[a.status]
                                }`,
                                borderRadius: "12px",
                              }}
                            >
                              {/* Layout principal */}
                              <div
                                className="d-flex justify-content-between"
                                style={{
                                  gap: "20px",
                                  alignItems: "flex-start",
                                }}
                              >
                                {/* TEXTO DE LA TAREA */}
                                <div style={{ flex: 1 }}>
                                  <h5 className="fw-bold">{a.title}</h5>
                                  <p className="text-muted mb-2">
                                    {a.description}
                                  </p>

                                  {/* BADGE DE STATUS */}
                                  <span
                                    style={{
                                      background: statusColors[a.status],
                                      padding: "6px 12px",
                                      borderRadius: "20px",
                                      fontSize: "0.8rem",
                                      fontWeight: "600",
                                      color: "white",
                                    }}
                                  >
                                    {a.status.replace("_", " ").toUpperCase()}
                                  </span>

                                  {/* FEEDBACK */}
                                  {a.feedback && (
                                    <div className="mt-3">
                                      <strong>Feedback:</strong>
                                      <p className="text-muted small m-0">
                                        {a.feedback}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* BOTÓN SUBMIT */}
                                {a.status === "not_submitted" && (
                                  <button
                                    onClick={() =>
                                      submitAssignment(
                                        a.assignment_id,
                                        course.id,
                                        schedule.id
                                      )
                                    }
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                      color: "white",
                                      padding: "10px 18px",
                                      borderRadius: "10px",
                                      border: "none",
                                      fontWeight: "600",
                                      fontSize: "0.9rem",
                                      cursor: "pointer",
                                      minWidth: "130px", // ✔ MISMO ANCHO SIEMPRE
                                      height: "42px", // ✔ MISMA ALTURA SIEMPRE
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow:
                                        "0 4px 10px rgba(22,163,74,0.25)",
                                      transition: "all 0.3s ease",
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.transform =
                                        "translateY(-2px)";
                                      e.currentTarget.style.boxShadow =
                                        "0 6px 14px rgba(22,163,74,0.35)";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.transform =
                                        "translateY(0)";
                                      e.currentTarget.style.boxShadow =
                                        "0 4px 10px rgba(22,163,74,0.25)";
                                    }}
                                  >
                                    <i className="fa-solid fa-upload me-2"></i>
                                    Submit
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
    }
  };

  return (
    <div className="admin-layout">
      <StudentSidebar activeView={activeView} setActiveView={setActiveView} />

      {renderSection()}
      {showChat && (
        <CourseChatModal
          show={showChat}
          onClose={closeChat}
          course={selectedCourse}
          selectedScheduleId={selectedScheduleId}
          onGroupChange={setSelectedScheduleId}
          originalScheduleId={originalScheduleId}
          role={user?.role || "student"}
        />
      )}

      {showPrivateChat && selectedTeacher && (
        <PrivateChatModal
          chatUser={selectedTeacher}
          initialMessages={privateMessages} // ✅ ahora usamos el estado correcto
          onClose={closePrivateChat}
        />
      )}
    </div>
  );
};
