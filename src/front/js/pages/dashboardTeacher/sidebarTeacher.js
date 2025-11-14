import React from "react";
import { SidebarBase } from "../../component/sidebarBase";
import { FiHome, FiMonitor, FiUsers, FiClipboard } from "react-icons/fi";

export const TeacherSidebar = ({ activeView, setActiveView }) => {
  const studentMenuItems = [
    { view: "dashboard", icon: <FiHome />, label: "Home" },
    { view: "students", icon: <FiUsers />, label: "Students" },
    { view: "my-courses", icon: <FiMonitor />, label: "Class Recordings" },
    { view: "assignments", icon: <FiClipboard />, label: "Assigments" },
  ];

  return (
    <SidebarBase
      activeView={activeView}
      setActiveView={setActiveView}
      menuItems={studentMenuItems}
    />
  );
};
