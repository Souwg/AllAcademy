// src/front/js/component/dashboard/adminSidebar.js
import React from "react";
import { SidebarBase } from "../../component/sidebarBase";
import { FiHome, FiUsers, FiBook, FiSettings } from "react-icons/fi";

export const AdminSidebar = ({ activeView, setActiveView }) => {
  const adminMenuItems = [
    { view: "dashboard", icon: <FiHome />, label: "Dashboard" },
    { view: "users", icon: <FiUsers />, label: "Users" },
    { view: "courses", icon: <FiBook />, label: "Courses" },
    { view: "settings", icon: <FiSettings />, label: "Settings" },
  ];

  return (
    <SidebarBase
      activeView={activeView}
      setActiveView={setActiveView}
      menuItems={adminMenuItems}
    />
  );
};
