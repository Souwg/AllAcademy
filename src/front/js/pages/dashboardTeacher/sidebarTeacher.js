import React from "react";
import { SidebarBase } from "../../component/sidebarBase";
import {
  FiHome,
  FiBook,
  FiMessageCircle,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

export const TeacherSidebar = ({ activeView, setActiveView }) => {
  const studentMenuItems = [
    { view: "dashboard", icon: <FiHome />, label: "Home" },
    { view: "students", icon: <FiUsers />, label: "Students" },
    { view: "my-courses", icon: <FiBook />, label: "My Courses" },
    { view: "settings", icon: <FiSettings />, label: "Settings" },
  ];

  return (
    <SidebarBase
      activeView={activeView}
      setActiveView={setActiveView}
      menuItems={studentMenuItems}
    />
  );
};
