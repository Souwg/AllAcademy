// src/front/js/component/dashboard/adminSidebar.js
import React from "react";
import { SidebarBase } from "../../component/sidebarBase";
import { FiHome, FiUsers, FiBook, FiSettings } from "react-icons/fi";

export const AdminSidebar = ({ activeView, setActiveView }) => {
  const adminMenuItems = [
    { view: "dashboard", icon: <FiHome />, label: "Panel de Control" },
    { view: "users", icon: <FiUsers />, label: "Usuarios" },
    { view: "courses", icon: <FiBook />, label: "Cursos" },
    { view: "settings", icon: <FiSettings />, label: "Configuración" },
  ];

  return (
    <SidebarBase
      activeView={activeView}
      setActiveView={setActiveView}
      menuItems={adminMenuItems}
    />
  );
};
