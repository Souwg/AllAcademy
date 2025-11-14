import React from "react";
import { SidebarBase } from "../../component/sidebarBase";
import { FiHome, FiMonitor, FiClipboard, FiUser } from "react-icons/fi";

export const StudentSidebar = ({ activeView, setActiveView }) => {
  const studentMenuItems = [
    { view: "dashboard", icon: <FiHome />, label: "Home" },
    { view: "teacher", icon: <FiUser />, label: "Teachers" },
    { view: "my-courses", icon: <FiMonitor />, label: "My Class Recordings" },
    { view: "my-assignments", icon: <FiClipboard />, label: "Assigments" },
  ];

  return (
    <SidebarBase
      activeView={activeView}
      setActiveView={setActiveView}
      menuItems={studentMenuItems}
    />
  );
};
