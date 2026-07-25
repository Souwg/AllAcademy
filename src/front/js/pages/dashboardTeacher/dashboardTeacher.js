import React, { useContext, useEffect, useState } from "react";
import { TeacherSidebar } from "../dashboardTeacher/sidebarTeacher";
import { Context } from "../../store/appContext";
import "../../../styles/dashboardTeacher.css";
import noImage from "../../../img/noImage.jpg";
import { CourseChatModal } from "../dashboardStudent/courseChatModal";
import { PrivateChatModal } from "../dashboardStudent/privateChatModal";
import Swal from "sweetalert2";
import { FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    country: user?.country || "",
    id_number: user?.id_number || "",
    bio: user?.bio || "",
    image_url: user?.image_url || "",
    image: null, // 👈 archivo real
    preview: null,
  });
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
    useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  // ✏️ EDIT ASSIGNMENT
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editAssignmentTitle, setEditAssignmentTitle] = useState("");
  const [editAssignmentDescription, setEditAssignmentDescription] =
    useState("");

  const openEditAssignmentModal = (assignment) => {
    setEditingAssignment(assignment);
    setEditAssignmentTitle(assignment.title);
    setEditAssignmentDescription(assignment.description);
    setShowEditAssignmentModal(true);
  };

  const handleDelete = async (assignmentId) => {
    const result = await actions.deleteAssignment(assignmentId);

    if (result.success) {
      actions.showNotification("success", "Assignment removed successfully!");
      actions.getTeacherAssignmentsOverview();
    } else {
      actions.showNotification("error", result.msg);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editAssignmentTitle) {
      actions.showNotification("warning", "Please enter a title.");
      return;
    }

    const body = {
      title: editAssignmentTitle,
      description: editAssignmentDescription,
    };

    const success = await actions.updateAssignment(
      editingAssignment.assignment_id,
      body,
    );

    if (success) {
      actions.showNotification("success", "Task updated successfully.");
      setShowEditAssignmentModal(false);
      actions.getTeacherAssignmentsOverview();
    } else {
      actions.showNotification("error", "Could not update the task.");
    }
  };

  useEffect(() => {
    if (activeView === "assignments") {
      actions.getTeacherAssignmentsOverview();
    }
  }, [activeView]);

  const openCreateAssignmentModal = (video, course) => {
    setSelectedRecording({
      id: video.id || video.recording_id,
      title: video.title || video.recording_title,
    });

    setSelectedCourse(course);
    setAssignmentTitle("");
    setAssignmentDescription("");
    setShowCreateAssignmentModal(true);
  };

  const handleCreateAssignment = async () => {
    if (!assignmentTitle) {
      actions.showNotification("warning", "Please enter a title.");
      return;
    }

    const body = {
      course_id: selectedCourse.id,
      recording_id: selectedRecording.id,
      title: assignmentTitle,
      description: assignmentDescription,
    };

    const success = await actions.createAssignment(body);

    if (success) {
      actions.showNotification("success", "Task created successfully.");

      // 👇👇👇 AQUI VIENE LO IMPORTANTE
      await actions.getTeacherAssignmentsOverview();

      setShowCreateAssignmentModal(false);
    } else {
      actions.showNotification("error", "Could not create the task.");
    }
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditUrl(video.recording_url);
    setShowEditModal(true);
  };
  const handleUpdateVideo = async () => {
    if (!editTitle || !editUrl) {
      actions.showNotification(
        "warning",
        "Please complete all fields before saving.",
      );

      return;
    }

    const updatedData = {
      title: editTitle,
      recording_url: editUrl,
    };

    const success = await actions.updateRecording(editingVideo.id, updatedData);
    if (success) {
      actions.showNotification(
        "success",
        "The recording has been successfully updated.",
      );
      setShowEditModal(false);
      setEditingVideo(null);
    } else {
      actions.showNotification(
        "error",
        "Something went wrong while updating the recording.",
      );
    }
  };

  const handleUploadVideo = async () => {
    if (!recordingTitle || !recordingUrl) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Please add a title and choose a video file.",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while your video is uploaded.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const uploaded = await actions.uploadVideoToBackend(
        recordingUrl,
        recordingTitle,
        selectedCourse.id,
        selectedGroupId ? Number(selectedGroupId) : null,
        selectedLessons,
      );

      Swal.close();

      if (uploaded) {
        setRecordingTitle("");
        setRecordingUrl("");
        setSelectedGroupId(null);
        setShowUploadModal(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload failed",
          text: "There was a problem uploading the video.",
        });
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unexpected error during upload.",
      });
      console.error(err);
    }
  };

  useEffect(() => {
    actions.getTeacherCourses().then((courses) => {
      // 📽 Después de cargar cursos, cargamos las grabaciones de cada uno
      courses.forEach((course) => {
        actions.getRecordingsByCourse(course.id);
      });
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (store.courses.length > 0) {
        actions.checkNewNotifications();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [store.courses]);

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
    }, {}),
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
      const stored =
        JSON.parse(localStorage.getItem(`notifications_${localUser.id}`)) || [];
      actions.setNotifications(stored);
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
  const handleOpenProfileModal = () => {
    const localUser = JSON.parse(localStorage.getItem("user"));

    setProfileData({
      first_name: localUser?.first_name || "",
      last_name: localUser?.last_name || "",
      email: localUser?.email || "",
      country: localUser?.country || "",
      id_number: localUser?.id_number || "",
      bio: localUser?.bio || "",
      image_url: localUser?.image_url || "",
      image: null,
      preview: null,
    });

    setTimeout(() => setShowProfileModal(true), 100);
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
              <div className="dashboard-buttons">
                <button
                  className="btn btn-lg btn-outline-light me-2"
                  onClick={handleOpenProfileModal}
                >
                  <i className="fa-solid fa-user-pen me-2"></i>
                  Edit Profile
                </button>
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
                                            <div className="d-flex flex-column">
                                              <strong>
                                                {group.group_name} {""}
                                                <i className="fa-solid fa-users text-primary"></i>
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
                                                  group.id,
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
                                                  group,
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
                                  (c) => c.id === n.course_id,
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
                                    n.schedule_id,
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
                              const key = `${n.course_id}-${n.schedule_id}`;
                              actions.setLastNotifiedMessage(key, n.id);
                              actions.removeNotification(n.id);
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
              <div className="wrapper text-center">
                <div className="blue ball"></div>
                <div className="red ball"></div>
                <div className="yellow ball"></div>
                <div className="green ball"></div>
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
                                (c) => new Date(c.enrolled_at),
                              ),
                            ),
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
                  View and manage the recordings of your classes
                </p>
              </div>
            </div>

            {/* 📂 Listado de cursos con sus videos */}
            {store.courses.length > 0 ? (
              store.courses.map((course) => {
                const videos =
                  store.videos?.filter((v) => v.course_id === course.id) || [];

                // 📌 Agrupar por nombre de grupo
                const groupedVideos = videos.reduce((acc, video) => {
                  const groupName = video.group_name || "General recording";
                  if (!acc[groupName]) acc[groupName] = [];
                  acc[groupName].push(video);
                  return acc;
                }, {});

                return (
                  <div key={course.id} className="course-card-video mb-5">
                    <div className="d-flex align-items-center mb-3 gap-3">
                      <h4 className="fw-bold">{course.title}</h4>
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowUploadModal(true);
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "white",
                          padding: "10px 18px",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "600",
                          fontSize: "0.95rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          boxShadow: "0 4px 10px rgba(16, 185, 129, 0.25)",
                          transition: "all 0.3s ease",
                          marginLeft: "auto",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 14px rgba(16, 185, 129, 0.35)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 10px rgba(16, 185, 129, 0.25)";
                        }}
                      >
                        <i className="fa-solid fa-upload"></i> Upload Video
                      </button>
                    </div>

                    {Object.keys(groupedVideos).length > 0 ? (
                      Object.entries(groupedVideos)
                        .sort(([a], [b]) => a.localeCompare(b)) // 📌 Ordena alfabéticamente por grupo
                        .map(([groupName, groupVideos]) => (
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
                                  className={`list-group-item video-item ${
                                    video.is_published ? "uploaded" : ""
                                  }`}
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
                                    {video.is_published && (
                                      <span className="badge bg-success ms-2">
                                        Published
                                      </span>
                                    )}

                                    <div className="small text-muted">
                                      {video.created_at
                                        ? new Date(
                                            video.created_at,
                                          ).toLocaleDateString()
                                        : "No date"}
                                    </div>

                                    {video.lessons &&
                                      video.lessons.length > 0 &&
                                      (() => {
                                        // Paso 1: agrupar por módulo
                                        const lessonsByModule =
                                          video.lessons.reduce(
                                            (acc, lesson) => {
                                              const key = lesson.module_id;
                                              if (!acc[key]) {
                                                acc[key] = {
                                                  module_title:
                                                    lesson.module_title,
                                                  module_order:
                                                    lesson.module_order,
                                                  lessons: [],
                                                };
                                              }
                                              acc[key].lessons.push(lesson);
                                              return acc;
                                            },
                                            {},
                                          );

                                        // Paso 2: renderizar agrupado
                                        return (
                                          <ul className="mt-1 mb-0 ps-3">
                                            {Object.values(lessonsByModule)
                                              .sort(
                                                (a, b) =>
                                                  a.module_order -
                                                  b.module_order,
                                              )
                                              .map((module) => (
                                                <li
                                                  key={module.module_order}
                                                  className="mt-2"
                                                >
                                                  <strong
                                                    style={{
                                                      fontSize: "0.9rem",
                                                    }}
                                                  >
                                                    Module {module.module_order}
                                                    : {module.module_title}
                                                  </strong>

                                                  <ul className="mt-1">
                                                    {module.lessons
                                                      .sort(
                                                        (a, b) =>
                                                          a.order - b.order,
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
                                  <div className="d-flex justify-content-between align-items-center mt-4 w-100">
                                    <div className="d-flex gap-2 mt-4">
                                      {/* Botón Watch */}
                                      <button
                                        onClick={() => {
                                          setSelectedVideoUrl(
                                            video.recording_url,
                                          );
                                          setSelectedVideoTitle(video.title);
                                          setShowVideoModal(true);
                                        }}
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
                                          cursor: "pointer",
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
                                        <i className="fa-solid fa-play"></i>{" "}
                                        Watch
                                      </button>
                                      {/* Botón Publish/Unpublish */}
                                      <button
                                        onClick={async () => {
                                          const newStatus = !video.is_published;
                                          const result =
                                            await actions.togglePublishRecording(
                                              video.id,
                                              newStatus,
                                            );
                                          if (result) {
                                            Swal.fire({
                                              icon: "success",
                                              title: newStatus
                                                ? "Recording published!"
                                                : "Recording unpublished!",
                                              text: newStatus
                                                ? "Students can now watch this recording."
                                                : "The recording is no longer visible to students.",
                                              confirmButtonColor: "#2d3078",
                                            });
                                          }
                                        }}
                                        style={{
                                          background: video.is_published
                                            ? "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)"
                                            : "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
                                          color: "white",
                                          padding: "8px 14px",
                                          border: "none",
                                          borderRadius: "10px",
                                          fontWeight: "600",
                                          fontSize: "0.9rem",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                          boxShadow:
                                            "0 4px 10px rgba(0,0,0,0.15)",
                                          transition: "all 0.3s ease",
                                        }}
                                      >
                                        <i
                                          className={`fa-solid ${
                                            video.is_published
                                              ? "fa-eye-slash"
                                              : "fa-eye"
                                          } me-2`}
                                        ></i>
                                        {video.is_published
                                          ? "Unpublish"
                                          : "Publish"}
                                      </button>

                                      <button
                                        onClick={() => openEditModal(video)}
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                                          color: "white",
                                          padding: "8px 14px",
                                          border: "none",
                                          borderRadius: "10px",
                                          fontWeight: "600",
                                          fontSize: "0.9rem",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                          boxShadow:
                                            "0 4px 10px rgba(99, 102, 241, 0.25)",
                                          transition: "all 0.3s ease",
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                          e.currentTarget.style.boxShadow =
                                            "0 6px 14px rgba(99, 102, 241, 0.35)";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.transform =
                                            "translateY(0)";
                                          e.currentTarget.style.boxShadow =
                                            "0 4px 10px rgba(99, 102, 241, 0.25)";
                                        }}
                                      >
                                        <i className="fa-solid fa-pen"></i>
                                      </button>

                                      {/* Botón Delete */}
                                      <button
                                        onClick={() => {
                                          Swal.fire({
                                            title: "Are you sure?",
                                            text: "This action will permanently delete the recording.",
                                            icon: "warning",
                                            showCancelButton: true,
                                            confirmButtonColor: "#e4263c",
                                            cancelButtonColor: "#6c757d",
                                            confirmButtonText: "Yes, delete it",
                                            cancelButtonText: "Cancel",
                                            reverseButtons: true,
                                          }).then((result) => {
                                            if (result.isConfirmed) {
                                              actions.deleteVideo(video.id);
                                              Swal.fire({
                                                title: "Deleted!",
                                                text: "The recording has been successfully deleted.",
                                                icon: "success",
                                                confirmButtonColor: "#2d3078",
                                              });
                                            }
                                          });
                                        }}
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #e4263c 0%, #c11e32 100%)",
                                          color: "white",
                                          padding: "8px 14px",
                                          border: "none",
                                          borderRadius: "10px",
                                          fontWeight: "600",
                                          fontSize: "0.9rem",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                          boxShadow:
                                            "0 4px 10px rgba(228, 38, 60, 0.25)",
                                          transition: "all 0.3s ease",
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                          e.currentTarget.style.boxShadow =
                                            "0 6px 14px rgba(228, 38, 60, 0.35)";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.transform =
                                            "translateY(0)";
                                          e.currentTarget.style.boxShadow =
                                            "0 4px 10px rgba(228, 38, 60, 0.25)";
                                        }}
                                      >
                                        <i className="fa-solid fa-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                    ) : (
                      <p className="text-muted ps-2">
                        <strong>No videos uploaded yet...</strong>
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="wrapper text-center">
                <div className="blue ball"></div>
                <div className="red ball"></div>
                <div className="yellow ball"></div>
                <div className="green ball"></div>
              </div>
            )}
          </div>
        );
      case "assignments":
        return (
          <div className="container-fluid pt-0 assignments-section">
            {/* Banner */}
            <div className="teacher-students-banner-modern mb-4">
              <div className="banner-icon">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <div className="banner-content">
                <h2 className="banner-title">Assignments & Submissions</h2>
                <p className="banner-subtitle">
                  Create and manage all tasks for your classes ✨
                </p>
              </div>
            </div>

            {store.assignmentsOverview.length === 0 ? (
              <p className="text-muted">No assignments found yet.</p>
            ) : (
              store.assignmentsOverview.map((course) => (
                <div key={course.course_id} className="mb-5">
                  {/* Course Title */}
                  <h3
                    className="mb-3"
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                      background: "linear-gradient(135deg, #2d3078, #3f42a0)",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      paddingLeft: "12px",
                      borderLeft: "4px solid #3f42a0",
                    }}
                  >
                    {course.course_title}
                  </h3>

                  {/* Groups */}
                  {course.schedules.map((sch) => (
                    <div
                      key={sch.schedule_id}
                      className="card shadow-sm p-4 mb-4 border-0 rounded-4 assignment-group-card"
                    >
                      <h5 className="fw-bold mb-3 group-header">
                        {sch.group_name} — {sch.day_of_week} ({sch.start_time}–
                        {sch.end_time})
                      </h5>

                      {/* Recordings */}
                      {sch.recordings.length === 0 ? (
                        <p className="text-muted ms-2">No recordings yet.</p>
                      ) : (
                        sch.recordings.map((rec) => (
                          <div key={rec.recording_id} className="mb-4 ps-3">
                            {/* 🎥 Recording Title + BUTTON */}
                            <div className="d-flex justify-content-between align-items-center">
                              <h5 className="fw-bold recording-title">
                                {rec.recording_title}
                              </h5>

                              {rec.assignments.length === 0 ? (
                                // ⭐ SI NO HAY TAREAS → BOTÓN VERDE NORMAL
                                <button
                                  className="btn btn-success"
                                  style={{
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                    padding: "6px 14px",
                                  }}
                                  onClick={() =>
                                    openCreateAssignmentModal(rec, course)
                                  }
                                >
                                  <i className="fa-solid fa-plus me-1"></i>
                                  Create Task
                                </button>
                              ) : (
                                // ⭐ SI YA HAY TAREAS → TEXTO MUTEADO
                                <span
                                  className="text-muted"
                                  style={{
                                    fontStyle: "italic",
                                    fontSize: "0.85rem",
                                    paddingRight: "10px",
                                  }}
                                >
                                  <i className="fa-solid fa-circle-check me-1 text-success"></i>
                                  Task already created
                                </span>
                              )}
                            </div>

                            {/* Assignments list */}
                            {rec.assignments.length === 0 ? (
                              <p className="text-muted ms-4">
                                No tasks yet for this class.
                              </p>
                            ) : (
                              rec.assignments
                                .slice()
                                .sort(
                                  (a, b) =>
                                    new Date(b.created_at) -
                                    new Date(a.created_at),
                                )
                                .map((a) => (
                                  <div
                                    key={a.assignment_id}
                                    className="card p-3 border-0 shadow-sm rounded-3 mt-3 ms-3 assignment-card"
                                  >
                                    <h6 className="fw-bold text-dark">
                                      {a.title}
                                    </h6>
                                    <p className="text-muted">
                                      {a.description}
                                    </p>

                                    <div className="d-flex align-items-center gap-2 mb-4">
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() =>
                                          openEditAssignmentModal(a)
                                        }
                                      >
                                        <i className="fa-solid fa-pen-to-square me-1"></i>
                                        Edit
                                      </button>

                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() =>
                                          handleDelete(a.assignment_id)
                                        }
                                      >
                                        Delete
                                      </button>
                                    </div>

                                    {/* Submissions */}
                                    {/* Submissions */}
                                    <div className="submissions-wrapper mt-4">
                                      <div className="submissions-header">
                                        <i className="fa-solid fa-user-check me-2"></i>
                                        Submissions
                                      </div>

                                      {a.submissions.length === 0 ? (
                                        <p className="no-submissions">
                                          No submissions yet.
                                        </p>
                                      ) : (
                                        <div className="submissions-card">
                                          <table className="table table-hover align-middle submissions-table">
                                            <thead>
                                              <tr>
                                                <th>Student</th>
                                                <th>Status</th>
                                                <th>Submitted</th>
                                                <th>Feedback</th>
                                                <th></th>
                                              </tr>
                                            </thead>

                                            <tbody>
                                              {a.submissions.map((s) => (
                                                <tr
                                                  key={s.submission_id}
                                                  className="submission-row"
                                                >
                                                  <td className="student-name">
                                                    <i className="fa-solid fa-user-circle me-2 text-primary"></i>
                                                    {s.student_name}
                                                  </td>

                                                  <td>
                                                    <span
                                                      className={`submission-badge badge-${s.status}`}
                                                    >
                                                      {s.status}
                                                    </span>
                                                  </td>

                                                  <td className="submitted-date">
                                                    {new Date(
                                                      s.submitted_at,
                                                    ).toLocaleString()}
                                                  </td>

                                                  <td className="feedback-field">
                                                    {s.feedback || (
                                                      <span className="text-muted">
                                                        —
                                                      </span>
                                                    )}
                                                  </td>

                                                  <td>
                                                    <div className="submission-actions">
                                                      {/* Approve */}
                                                      <button
                                                        className="submission-btn approve"
                                                        onClick={async () => {
                                                          await actions.reviewAssignment(
                                                            s.submission_id,
                                                            "approved",
                                                          );
                                                          actions.getTeacherAssignmentsOverview();
                                                        }}
                                                      >
                                                        <i className="fa-solid fa-check"></i>
                                                      </button>

                                                      {/* Reject */}
                                                      <button
                                                        className="submission-btn reject"
                                                        onClick={async () => {
                                                          const { value: fb } =
                                                            await Swal.fire({
                                                              title:
                                                                "Reject Task",
                                                              input: "textarea",
                                                              showCancelButton: true,
                                                            });

                                                          await actions.reviewAssignment(
                                                            s.submission_id,
                                                            "rejected",
                                                            fb || "",
                                                          );

                                                          actions.getTeacherAssignmentsOverview();
                                                        }}
                                                      >
                                                        <i className="fa-solid fa-xmark"></i>
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
                                  </div>
                                ))
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              ))
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
                    }, {}),
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
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
      {showUploadModal && selectedCourse && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header">
                <h2>
                  <i className="fa-solid fa-upload modal-icon"></i>
                  Upload Recording — {selectedCourse.title}
                </h2>
                <button
                  className="close-modal"
                  onClick={() => setShowUploadModal(false)}
                  aria-label="Close Modal"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body">
                {/* 📄 Título */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={recordingTitle}
                    onChange={(e) => setRecordingTitle(e.target.value)}
                    placeholder="Class 1 - Introduction"
                  />
                </div>

                {/* 🎥 Subir archivo */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Upload Video File
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    className="form-control"
                    onChange={(e) => setRecordingUrl(e.target.files[0])}
                  />
                </div>

                {/* 🧭 Grupo asociado */}
                {selectedCourse.schedules?.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Select Group</label>
                    <select
                      className="form-select"
                      value={selectedGroupId || ""}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                    >
                      <option value="">-- Select a group --</option>
                      {selectedCourse.schedules.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.group_name} — {group.day_of_week} (
                          {group.start_time} - {group.end_time})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 📚 Lecciones relacionadas */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Related Lessons</label>
                  <div className="lessons-checkboxes">
                    {selectedCourse.modules?.map((module) => (
                      <div key={module.id} className="mb-2">
                        {/* Nombre del módulo */}
                        <div className="fw-bold text-primary mb-1">
                          <i className="fa-solid fa-layer-group me-2"></i>
                          {module.title}
                        </div>

                        {/* Lecciones del módulo */}
                        {module.lessons.map((lesson, index) => (
                          <div key={lesson.id} className="form-check ms-3 mb-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              value={lesson.id}
                              checked={selectedLessons.includes(lesson.id)}
                              onChange={(e) => {
                                const id = Number(e.target.value);
                                setSelectedLessons((prev) =>
                                  prev.includes(id)
                                    ? prev.filter((l) => l !== id)
                                    : [...prev, id],
                                );
                              }}
                            />
                            <label className="form-check-label">
                              Lesson {lesson.order || index + 1}: {lesson.title}
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🟢 Botones de acción */}
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleUploadVideo}
                  >
                    <i className="fa-solid fa-upload me-1"></i> Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editingVideo && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-pen modal-icon"></i>
                Edit Recording — {editingVideo.title}
              </h2>
              <button
                className="close-modal"
                onClick={() => setShowEditModal(false)}
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter new title"
                />
              </div>

              <div className="form-group">
                <label>Recording URL</label>
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleUpdateVideo}
                >
                  <i className="fa-solid fa-save me-2"></i> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {store.notification.show && (
        <div
          className={`notification ${store.notification.type}`}
          aria-live="polite"
          role="status"
        >
          <div className="notification-content">
            {store.notification.type === "success" ? (
              <FiCheckCircle className="notification-icon" />
            ) : (
              <FiXCircle className="notification-icon" />
            )}
            <span>{store.notification.message}</span>
            <button
              className="close-notification"
              onClick={() => actions.closeNotification()}
              aria-label="Close Notification"
            >
              <FiX size={16} />
            </button>
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
      {/* 🎬 Modal para ver video */}
      {/* 🎬 Modal para ver video centrado */}
      {showVideoModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowVideoModal(false)} // cerrar al hacer clic fuera
        >
          <div
            className="modal-content"
            style={{
              width: "90%",
              maxWidth: "1000px",
              background: "#fff",
              borderRadius: "16px",
              overflow: "hidden",
              padding: 0,
            }}
            onClick={(e) => e.stopPropagation()} // evitar cierre al hacer clic dentro
          >
            {/* HEADER IGUAL QUE TUS OTROS MODALES */}
            <div
              className="modal-header"
              style={{ borderBottom: "none", position: "relative" }}
            >
              <div>
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <i className="fa-solid fa-video modal-icon"></i>
                  {selectedVideoTitle}
                  <span
                    style={{
                      background: "#e2e8f0",
                      color: "#001933",
                      fontSize: "0.85rem",
                      padding: "4px 10px",
                      borderRadius: "50px",
                      fontWeight: "600",
                    }}
                  >
                    0:58
                  </span>
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    marginTop: "4px",
                  }}
                >
                  Full-Stack Web — Evening Cohort A
                </p>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <button
                  className="close-modal"
                  onClick={() => setShowVideoModal(false)}
                  aria-label="Close Modal"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* CUERPO DEL MODAL */}
            <div
              className="modal-body"
              style={{
                padding: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#000",
                borderRadius: "0 0 16px 16px",
              }}
            >
              <video
                src={selectedVideoUrl}
                controls
                autoPlay
                style={{
                  width: "100%",
                  height: "70vh",
                  objectFit: "contain",
                  borderRadius: "0 0 16px 16px",
                  backgroundColor: "black",
                }}
              />
            </div>
          </div>
        </div>
      )}
      {showProfileModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: "550px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 🟣 Header */}
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-user-pen modal-icon"></i>
                Edit Profile
              </h2>
              <button
                className="close-modal"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* 🔹 Body */}
            <div className="modal-body">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const success = await actions.updateUserProfile(profileData);
                  if (success) {
                    setShowProfileModal(false);
                  }
                }}
                className="user-edit-form"
              >
                {/* 🖼️ Imagen de perfil */}
                <div className="text-center mb-3">
                  <img
                    src={
                      profileData.preview
                        ? profileData.preview
                        : profileData.image_url &&
                          profileData.image_url.trim() !== ""
                        ? profileData.image_url
                        : noImage // 👈 Usa la imagen por defecto al eliminar
                    }
                    alt="Profile"
                    className="rounded-circle shadow-sm"
                    style={{
                      width: "110px",
                      height: "110px",
                      objectFit: "cover",
                      objectPosition: "top",
                      transition: "all 0.3s ease-in-out",
                    }}
                  />

                  <div className="mt-2">
                    <div className="modern-file-upload mt-3">
                      <label htmlFor="file-upload" className="upload-btn">
                        <i className="fa-solid fa-cloud-arrow-up me-2"></i>
                        Choose Image
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfileData({
                              ...profileData,
                              image: file,
                              preview: URL.createObjectURL(file),
                            });
                          }
                        }}
                      />
                      {profileData.image && (
                        <span className="selected-file">
                          {profileData.image.name}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-danger mt-3"
                      style={{
                        borderRadius: "8px",
                        fontWeight: "500",
                        opacity:
                          profileData.image_url || profileData.preview
                            ? "1"
                            : "0.6",
                      }}
                      disabled={!profileData.image_url && !profileData.preview}
                      onClick={() => {
                        setProfileData({
                          ...profileData,
                          image: null,
                          image_url: "",
                          preview: null,
                        });

                        // 👇 Limpia también la versión de localStorage para forzar el rerender
                        const storedUser = JSON.parse(
                          localStorage.getItem("user"),
                        );
                        if (storedUser) {
                          storedUser.image_url = "";
                          localStorage.setItem(
                            "user",
                            JSON.stringify(storedUser),
                          );
                        }
                      }}
                    >
                      <i className="fa-solid fa-trash me-2"></i>
                      Remove Image
                    </button>
                  </div>
                </div>

                {/* 🟠 Campos editables */}
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={profileData.first_name || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={profileData.last_name || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* 🔒 Datos informativos */}
                <div className="form-group">
                  <label>Email</label>
                  <p className="text-muted">
                    {profileData.email || "Not provided"}
                  </p>
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <p className="text-muted">{profileData.country || "—"}</p>
                </div>

                <div className="form-group">
                  <label>ID / Document</label>
                  <p className="text-muted">{profileData.id_number || "—"}</p>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <p
                    className="text-muted"
                    style={{
                      background: "#f8f9fa",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {profileData.bio || "No bio provided"}
                  </p>
                </div>

                {/* Footer buttons */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowProfileModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fa-solid fa-save me-2"></i> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showCreateAssignmentModal && selectedRecording && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-solid fa-clipboard-list me-2"></i>
                  Create Task — {selectedRecording.title}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowCreateAssignmentModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={assignmentDescription}
                    onChange={(e) => setAssignmentDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateAssignmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleCreateAssignment}
                >
                  <i className="fa-solid fa-check me-1"></i>
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditAssignmentModal && editingAssignment && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-solid fa-pen-to-square me-2"></i>
                  Edit Task — {editingAssignment.title}
                </h5>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editAssignmentTitle}
                    onChange={(e) => setEditAssignmentTitle(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={editAssignmentDescription}
                    onChange={(e) =>
                      setEditAssignmentDescription(e.target.value)
                    }
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditAssignmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateAssignment}
                >
                  <i className="fa-solid fa-save me-1"></i>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
