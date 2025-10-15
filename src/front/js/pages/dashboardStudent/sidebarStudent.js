import React from "react";
import { SidebarBase } from "../../component/sidebarBase";
import { FiHome, FiBook, FiHeart, FiSettings, FiUser } from "react-icons/fi";

export const StudentSidebar = ({ activeView, setActiveView }) => {
  const studentMenuItems = [
    { view: "dashboard", icon: <FiHome />, label: "Home" },
    { view: "teacher", icon: <FiUser />, label: "Teachers" },
    { view: "my-courses", icon: <FiBook />, label: "My Courses" },
    { view: "wishlist", icon: <FiHeart />, label: "Wishlist" },
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
