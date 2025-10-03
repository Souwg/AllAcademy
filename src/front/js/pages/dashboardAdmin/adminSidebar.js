import React from "react";
import { FiHome, FiUsers, FiBook, FiSettings } from "react-icons/fi";

export const AdminSidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { view: "dashboard", icon: <FiHome />, label: "Dashboard" },
    { view: "users", icon: <FiUsers />, label: "Users" },
    { view: "courses", icon: <FiBook />, label: "Courses" },
    { view: "settings", icon: <FiSettings />, label: "Settings" },
  ];

  return (
    <div className="admin-sidebar">
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
