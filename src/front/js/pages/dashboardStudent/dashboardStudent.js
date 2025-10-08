import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../store/appContext";
import { StudentSidebar } from "../dashboardStudent/sidebarStudent";
import { StudentChatModal } from "../dashboardStudent/studentChatModal";
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

  const openChat = (course) => {
    setSelectedCourse(course);
    setShowChat(true);
  };

  const closeChat = () => {
    setSelectedCourse(null);
    setShowChat(false);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar del estudiante */}
      <StudentSidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Contenido principal */}
      <div
        className={`student-dashboard-content ${activeView === "dashboard"}`}
      >
        {/* HOME */}
        {activeView === "dashboard" && (
          <>
            {/* Banner de bienvenida */}
            <div className="student-welcome-banner">
              <h3 className="fw-bold m-0">
                👋 Welcome back,{" "}
                {user?.first_name ? user.first_name : "Student"}
              </h3>
            </div>

            {/* Mis cursos */}
            <div className="container-my-courses">
              <h4 className="fw-bold mb-4 ms-2" style={{ color: "#001933" }}>
                <i className="fa-regular fa-bookmark"></i> My Courses
              </h4>

              <div className="row g-4">
                {myEnrollments.length > 0 ? (
                  myEnrollments.map((enroll, index) => (
                    <div
                      key={index}
                      className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex justify-content-center"
                    >
                      <div className="card h-100 student-course-card">
                        <img
                          src={enroll.course?.image_url || noImage}
                          className="card-img-top"
                          alt={enroll.course?.title || "Course"}
                        />
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">
                            {enroll.course?.title || "Untitled Course"}
                          </h5>

                          {/* Progreso */}
                          <div className="mt-auto">
                            <div className="progress">
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${enroll.progress || 0}%` }}
                                aria-valuenow={enroll.progress || 0}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <small className="text-muted d-block mt-2">
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
                              className="btn chat w-50"
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
                  <div className="text-center text-muted py-5">
                    <p>You haven’t enrolled in any courses yet.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* MY COURSES */}
        {activeView === "my-courses" && (
          <div className="student-section-header fade-in">
            <h3>
              <i className="fa-solid fa-book me-2"></i> My Courses
            </h3>
            <p>View and manage all the courses you’re enrolled in.</p>
          </div>
        )}

        {/* WISHLIST */}
        {activeView === "wishlist" && (
          <div className="student-section-header fade-in">
            <h3>
              <i className="fa-regular fa-heart me-2"></i> Wishlist
            </h3>
            <p>Your saved courses for later enrollment.</p>
          </div>
        )}

        {/* SETTINGS */}
        {activeView === "settings" && (
          <div className="student-section-header fade-in">
            <h3>
              <i className="fa-solid fa-gear me-2"></i> Settings
            </h3>
            <p>Update your personal information and preferences.</p>
          </div>
        )}
      </div>

      {/* MODAL DEL CHAT */}
      {showChat && (
        <StudentChatModal
          show={showChat}
          onClose={closeChat}
          course={selectedCourse}
        />
      )}
    </div>
  );
};
