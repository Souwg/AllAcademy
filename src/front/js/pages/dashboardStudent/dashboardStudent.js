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
  const { user, myEnrollments } = store;
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
            avatar_url: course.avatar_url || "https://via.placeholder.com/80",
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
      console.log("🔄 Dashboard: Sincronizando store...");
      actions.syncWithLocalStorage();
    }
  }, [user, actions]);

  useEffect(() => {
    actions.getMyEnrollments();
  }, []);

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
          <div className="container container-banner">
            <div className="student-banner">
              <h3>👋 Welcome back, {user?.first_name || "Student"}</h3>
              <p>Here’s a quick overview of your learning activity today.</p>
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
                      <h2 className="fw-bold text-primary mb-0">
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
                      <h2 className="fw-bold text-success mb-0">
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
                      <h2 className="fw-bold text-warning mb-0">
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

                  <div className="row g-4">
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
                        <strong>New course:</strong> You joined Advanced Math.
                      </small>
                    </div>

                    <div className="notification-item border-start border-4 border-success mb-3 p-2 rounded-3 bg-light-subtle">
                      <small>
                        <strong>New message:</strong> Your instructor replied.
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

      case "teacher":
        return (
          <div className="container mt-4">
            <h4 className="fw-bold mb-4">
              <i className="fa-solid fa-chalkboard-user me-2"></i> My Teachers
            </h4>

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
          <div className="container">
            <div className="student-banner">
              <h3 className="fw-bold m-0">
                <i className="fa-solid fa-book me-2"></i> My Courses
              </h3>
            </div>
          </div>
        );

      case "wishlist":
        return (
          <div className="container">
            <div className="student-banner">
              <h3 className="fw-bold m-0">
                <i className="fa-regular fa-heart me-2"></i> Wishlist
              </h3>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="container">
            <div className="student-banner">
              <h3 className="fw-bold m-0">
                <i className="fa-solid fa-gear me-2"></i> Settings
              </h3>
            </div>
          </div>
        );

      default:
        return null;
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
