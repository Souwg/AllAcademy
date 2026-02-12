import React, { useState, useRef, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import image from "../../img/Logo.png";

export const Navbar = () => {
  const { actions } = useContext(Context);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const API_BASE = process.env.BACKEND_URL;

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDashboard = () => {
    if (user && user.role) {
      navigate(`/${user.role}/dashboard`);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : {},
      });
    } catch (error) {
      console.warn("⚠️ Error en logout del backend");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🧽 Limpiar store global
      actions.clearSession();

      navigate("/login");
    }
  };

  // Efecto para manejar el hover del dropdown
  useEffect(() => {
    const dropdownElement = dropdownRef.current;
    if (!dropdownElement) return;

    const showDropdown = () => setDropdownOpen(true);
    const hideDropdown = () => setDropdownOpen(false);

    dropdownElement.addEventListener("mouseenter", showDropdown);
    dropdownElement.addEventListener("mouseleave", hideDropdown);

    return () => {
      dropdownElement.removeEventListener("mouseenter", showDropdown);
      dropdownElement.removeEventListener("mouseleave", hideDropdown);
    };
  }, []);

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "linear-gradient(to right, #e7ecf5 0%, #c8d3e3 100%)",
        paddingTop: "1rem",
        paddingBottom: "1rem",
      }}
    >
      <div className="container-fluid">
        <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center">
            <div className="col-auto">
              <Link to="/">
                <img
                  src={image}
                  alt="Allacademy Logo"
                  className="img-fluid"
                  style={{
                    height: "4rem",
                    maxHeight: "60px",
                    width: "auto",
                  }}
                />
              </Link>
            </div>
            <button
              className="navbar-toggler ms-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="col-12 col-lg-auto order-lg-2 mx-lg-auto">
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
              <ul className="navbar-nav pt-4" style={{ gap: "8rem" }}>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link links active"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "1rem",
                      position: "relative",
                    }}
                    aria-current="page"
                  >
                    Home
                    <span className="nav-link-underline"></span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/allCourses"
                    className="nav-link links"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "1rem",
                      position: "relative",
                    }}
                  >
                    Courses
                    <span className="nav-link-underline"></span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link links"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "1rem",
                      position: "relative",
                    }}
                  >
                    Pricing
                    <span className="nav-link-underline"></span>
                  </Link>
                </li>
                <li
                  className="nav-item dropdown"
                  ref={dropdownRef}
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    to="/"
                    className="nav-link dropdown-toggle"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "1rem",
                      padding: "8px 16px",
                      borderRadius: "8px",
                    }}
                    role="button"
                    aria-expanded={dropdownOpen}
                    onClick={(e) => e.preventDefault()}
                  >
                    Resources
                    <span
                      className="dropdown-arrow"
                      style={{
                        display: "inline-block",
                        marginLeft: "8px",
                        transition: "transform 0.2s ease",
                        transform: dropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </Link>
                  <ul
                    className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
                    style={{
                      marginTop: "0",
                      position: "absolute",
                      left: "0",
                      top: "100%",
                    }}
                  >
                    <li>
                      <a
                        className="dropdown-item"
                        style={{
                          padding: "10px 20px",
                          color: "#001933",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                        }}
                        href="#"
                      >
                        <span style={{ marginRight: "10px" }}>→</span>{" "}
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        style={{
                          padding: "10px 20px",
                          color: "#001933",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                        }}
                        href="#"
                      >
                        <span style={{ marginRight: "10px" }}>→</span> Tutorials
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        style={{
                          padding: "10px 20px",
                          color: "#001933",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                        }}
                        href="#"
                      >
                        <span style={{ marginRight: "10px" }}>→</span> Community
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          {/* Resto del código permanece igual */}
          <div className="col-12 col-lg-auto order-lg-3 mt-3 mt-lg-0 pt-3">
            <div className="d-grid gap-2 d-md-flex justify-content-md-end align-items-center">
              <button
                className="btn me-md-2 contact-btn"
                style={{
                  borderRadius: "20px",
                  backgroundColor: "#E4263C",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "1rem",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
                type="button"
              >
                Contact us
              </button>
              {user ? (
                <div className="d-flex align-items-center user-section">
                  <div className="user-greeting me-3">
                    <span
                      className="d-block welcome-text"
                      style={{
                        color: "#6c757d",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}
                    >
                      Hello, {user.role}
                    </span>
                    <span
                      className="d-block user-name"
                      style={{
                        color: "#001933",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                      }}
                    >
                      {user.first_name}
                    </span>
                  </div>
                  <button
                    className="btn me-2 dashboard-btn"
                    style={{
                      borderRadius: "20px",
                      backgroundColor: "#001933",
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                      padding: "8px 20px",
                    }}
                    onClick={handleDashboard}
                    type="button"
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#003366";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 8px rgba(0, 25, 51, 0.2)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#001933";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    className="btn logout-btn"
                    style={{
                      borderRadius: "20px",
                      border: "2px solid #eee",
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                      padding: "8px 20px",
                    }}
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className="btn login-btn"
                  style={{
                    borderRadius: "20px",
                    border: "2px solid #eee",
                    color: "#001933",
                    fontWeight: "600",
                    fontSize: "18px",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    padding: "8px 20px",
                  }}
                  onClick={handleLogin}
                  type="button"
                >
                  My Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
