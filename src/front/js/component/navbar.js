import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import image from "../../img/Logo.png";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary mt-2 mx-0">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
          {/* Logo y botón toggler */}
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
                    transition: "all 0.3s ease", // Para animación suave al cambiar tamaño
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

          {/* Menú de navegación */}
          <div className="col-12 col-lg-4 order-lg-2">
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link links active"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "17px",
                    }}
                    aria-current="page"
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link links"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "17px",
                    }}
                  >
                    Features
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/"
                    className="nav-link links"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "17px",
                    }}
                  >
                    Pricing
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <Link
                    to="/"
                    className="nav-link dropdown-toggle links"
                    style={{
                      color: "#001933",
                      fontWeight: "600",
                      fontSize: "17px",
                    }}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Dropdown link
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#">
                        Action
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Another action
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Something else here
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          {/* Botones */}
          <div className="col-12 col-lg-auto order-lg-3 mt-3 mt-lg-0">
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                className="btn me-md-2"
                style={{
                  borderRadius: "20px",
                  backgroundColor: "#E4263C",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "17px",
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
                  fontSize: "17px",
                  whiteSpace: "nowrap",
                }}
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
