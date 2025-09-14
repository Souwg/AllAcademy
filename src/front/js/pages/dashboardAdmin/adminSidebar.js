import React from "react";
import { FiHome, FiUsers, FiBook, FiSettings } from "react-icons/fi";

export const AdminSidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { view: "dashboard", icon: <FiHome />, label: "Inicio" },
    { view: "users", icon: <FiUsers />, label: "Usuarios" },
    { view: "courses", icon: <FiBook />, label: "Cursos" },
    { view: "settings", icon: <FiSettings />, label: "Configuración" },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Panel de Administración</h3>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.view}
            className={`menu-item ${activeView === item.view ? "active" : ""}`}
            onClick={() => setActiveView(item.view)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
