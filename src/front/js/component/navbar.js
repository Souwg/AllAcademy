import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import image from "../../img/Logo.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary mt-2 mx-0 mb-4">
      <div className="container">
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
              <ul className="navbar-nav pt-4" style={{ gap: "2rem" }}>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link links active"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "18px",
                    }}
                    aria-current="page"
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/allCourses"
                    className="nav-link links"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "18px",
                    }}
                  >
                    Courses
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link links"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "18px",
                    }}
                  >
                    Pricing
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <Link
                    to="/"
                    className="nav-link dropdown-toggle"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "18px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                    }}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Dropdown link
                    <span
                      className="dropdown-arrow"
                      style={{
                        display: "inline-block",
                        marginLeft: "8px",
                      }}
                    >
                      ▼
                    </span>
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <a
                        className="dropdown-item"
                        style={{
                          padding: "10px 20px",
                          color: "#001933",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                        }}
                        href="#"
                      >
                        <span style={{ marginRight: "10px" }}>→</span> Action
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
                        }}
                        href="#"
                      >
                        <span style={{ marginRight: "10px" }}>→</span> Another
                        action
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
                        }}
                        href="#"
                      >
                        <span style={{ marginRight: "10px" }}>→</span> Something
                        else here
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-12 col-lg-auto order-lg-3 mt-3 mt-lg-0 pt-3">
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                className="btn me-md-2"
                style={{
                  borderRadius: "20px",
                  backgroundColor: "#E4263C",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "18px",
                  whiteSpace: "nowrap",
                }}
                type="button"
              >
                Contact us
              </button>
              <button
                className="btn"
                style={{
                  borderRadius: "20px",
                  borderColor: "#eee",
                  borderWidth: "3px",
                  color: "#001933",
                  fontWeight: "600",
                  fontSize: "18px",
                  whiteSpace: "nowrap",
                }}
                onClick={handleLogin}
                type="button"
              >
                My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
