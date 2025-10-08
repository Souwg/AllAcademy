import React from "react";
import "../../styles/sidebarBase.css";

export const SidebarBase = ({ activeView, setActiveView, menuItems }) => {
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
