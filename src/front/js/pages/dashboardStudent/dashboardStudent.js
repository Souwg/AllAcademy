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
    const msgs = await actions.getCourseChat(course.id);
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
            </div>

            <div className="d-flex gap-3 flex-wrap mt-4">
              <div className="card p-4 text-center flex-fill">
                <h5>Enrolled Courses</h5>
                <h2 className="fw-bold">{myEnrollments?.length || 0}</h2>
              </div>
              <div className="card p-4 text-center flex-fill">
                <h5>Completed</h5>
                <h2 className="fw-bold">
                  {myEnrollments?.filter((e) => e.progress === 100).length || 0}
                </h2>
              </div>
              <div className="card p-4 text-center flex-fill">
                <h5>In Progress</h5>
                <h2 className="fw-bold">
                  {myEnrollments?.filter(
                    (e) => e.progress > 0 && e.progress < 100
                  ).length || 0}
                </h2>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="fw-bold mb-4">
                <i className="fa-regular fa-bookmark me-2"></i> My Courses
              </h4>

              <div className="row g-4">
                {myEnrollments.length > 0 ? (
                  myEnrollments.map((enroll, index) => (
                    <div
                      key={index}
                      className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex justify-content-center"
                    >
                      <div className="card h-100">
                        <img
                          src={enroll.course?.image_url || noImage}
                          className="card-img-top"
                          alt={enroll.course?.title || "Course"}
                        />
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">
                            {enroll.course?.title || "Untitled Course"}
                          </h5>
                          <p className="instructor-name">
                            By {enroll.course?.instructor || "Instructor"}
                          </p>

                          <div className="mt-auto">
                            <div className="progress">
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${enroll.progress || 0}%` }}
                                aria-valuenow={enroll.progress || 0}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <small className="d-block mt-2">
                              Progress: {enroll.progress || 0}%
                            </small>
                          </div>

                          <div className="d-flex gap-2 mt-3">
                            <button
                              className="btn btn-outline-primary w-50"
                              onClick={() =>
                                navigate(`/course/${enroll.course?.slug}`)
                              }
                            >
                              Continue
                            </button>

                            <button
                              className="btn btn-outline-secondary w-50"
                              onClick={() => openChat(enroll.course)}
                            >
                              Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <p>You haven't enrolled in any courses yet.</p>
                  </div>
                )}
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
