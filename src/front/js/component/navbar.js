import React, { useState, useRef, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../styles/navbar.css";
import image from "../../img/Logo.png";

export const Navbar = () => {
  const { actions } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const API_BASE = process.env.BACKEND_URL;

  const isDashboardPage = location.pathname.includes("/dashboard");

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

            <div
              className="collapse navbar-collapse"
              id="navbarNavDropdown"
              style={{
                marginLeft: "5rem",
                transform: "translateY(9px)",
              }}
            >
              <ul
                className="navbar-nav align-items-lg-center mb-0"
                style={{ gap: "3.5rem" }}
              >
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link links active"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "1rem",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      height: "60px",
                      padding: "0",
                    }}
                    aria-current="page"
                  >
                    Inicio
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
                      display: "flex",
                      alignItems: "center",
                      height: "60px",
                      padding: "0",
                    }}
                  >
                    Cursos
                    <span className="nav-link-underline"></span>
                  </Link>
                </li>
              </ul>
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

          {/* Resto del código permanece igual */}
          <div className="col-12 col-lg-auto mt-3 mt-lg-0">
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
                Contáctanos
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
                      Bienvenido,
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
                  {!isDashboardPage && (
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
                      Panel de control
                    </button>
                  )}
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
                    Cerrar sesión
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
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
