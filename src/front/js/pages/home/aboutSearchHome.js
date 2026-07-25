import React from "react";
import { Link } from "react-router-dom";
import "../../../styles/aboutSearch.css";
import chica from "../../../img/chicaPensativa.png";

export const AboutSearch = () => {
  return (
    <>
      <div className="container-fluid px-0 me-0 about-search-container">
        {/* Hero Section */}
        <div className="hero-section">
          {/* Floating abstract shapes */}

          <div className="floating-shape floating-shape-1"></div>
          <div className="floating-shape floating-shape-2"></div>
          <div className="floating-icons">
            <span className="shape circle"></span>
            <span className="shape circle small"></span>
            <span className="shape triangle"></span>
            <span className="shape triangle small"></span>
            <span className="shape square"></span>
            <span className="shape square small"></span>
            <span className="shape diamond"></span>
            <span className="shape star"></span>
          </div>
          <div className="floating-icons themed">
            {/* Tecnología */}
            <i className="fa-solid fa-laptop-code"></i>
            <i className="fa-solid fa-robot"></i>

            {/* Creatividad */}
            <i className="fa-solid fa-paintbrush"></i>
            <i className="fa-solid fa-pen-nib"></i>

            {/* Ciencia / Datos */}
            <i className="fa-solid fa-database"></i>
            <i className="fa-solid fa-brain"></i>

            {/* Idiomas */}
            <i className="fa-solid fa-language"></i>
            <i className="fa-solid fa-globe"></i>

            {/* Motivación */}
            <i className="fa-solid fa-bolt"></i>
            <i className="fa-solid fa-star"></i>
          </div>

          <div className="container position-relative">
            <div className="row align-items-center">
              {/* Text Content */}
              <div className="col-lg-6 mb-5 mb-lg-0 pe-lg-5 hero-text-col">
                <h1 className="main-heading">
                  Aprende en vivo con{" "}
                  <span className="highlight-purple">horarios flexibles</span>
                </h1>

                <p className="hero-subtitle">
                  Inscríbete en el horario que prefieras y aprende en clases en
                  vivo coordinadas por profesores con tu grupo.
                </p>

                {/* Animated Search Bar */}
                <div className="search-container-modern mb-4">
                  <div className="search-icon-modern">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path
                        fill="#6c757d"
                        d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Busca cursos..."
                    className="search-input-modern"
                  />
                  <button className="search-button-modern">
                    Explorar
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ms-2"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="trending-topics-container">
                  <span className="trending-text">Cursos populares:</span>
                  <div className="topics-wrapper">
                    {[
                      "Python para principiantes",
                      /* "Web Development",*/
                      /* "Data Analytics",*/
                    ].map((topic, i) => (
                      <a key={i} href="#" className="topic-badge">
                        {topic}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student Image */}
              <div className="col-lg-6 position-relative hero-image-col">
                <div className="student-image-container">
                  <img
                    src={chica}
                    alt="Student enjoying online learning"
                    className="img-fluid student-image"
                  />
                  <div className="decorative-badge">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="floating-card">
                  <div className="floating-card-header">
                    <div className="floating-card-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L3 7L12 12L21 7L12 2Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 17L12 22L21 17"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 12L12 17L21 12"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="floating-card-title">Clase en vivo</span>
                  </div>
                  <p className="floating-card-text">
                    Iniciación a la programación
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="container-fluid px-0 cards-section-container">
        <div className="container">
          <div className="row g-4 cards-row">
            {/* Card 1 - Interactive Courses */}
            <div className="col-md-6 col-lg-4">
              <div className="modern-card h-100">
                <div className="card-icon card-icon-1">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L3 7L12 12L21 7L12 2Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 17L12 22L21 17"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 12L12 17L21 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="card-body p-4">
                  <h5 className="card-title">Aprendizaje práctico</h5>
                  <p className="card-text">
                    Creamos contenidos claros y aplicables para que puedas
                    desarrollar nuevas habilidades de forma sencilla, paso a
                    paso y sin sentirte perdido.
                  </p>
                  <Link to="/allCourses" className="modern-card-btn btn-1">
                    Empezar a aprender
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ms-2"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2 - Expert Instructors */}
            <div className="col-md-6 col-lg-4">
              <div className="modern-card h-100">
                <div className="card-icon card-icon-2">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="white"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="card-body p-4">
                  <h5 className="card-title">Contenido pensado para ti</h5>
                  <p className="card-text">
                    En Allcademy buscamos ofrecer una experiencia cercana, útil
                    y fácil de seguir, enfocada en personas que quieren crecer y
                    prepararse mejor.
                  </p>
                  <Link to="/allCourses" className="modern-card-btn btn-2">
                    Conocer más
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ms-2"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3 - Flexible Learning */}
            <div className="col-md-6 col-lg-4">
              <div className="modern-card h-100">
                <div className="card-icon card-icon-3">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 12H18L15 21L9 3L6 12H2"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="card-body p-4">
                  <h5 className="card-title">Aprende a tu ritmo</h5>
                  <p className="card-text">
                    Avanza cuando puedas, desde donde estés, con una plataforma
                    diseñada para acompañarte en tu proceso de aprendizaje.
                  </p>
                  <Link to="/allCourses" className="modern-card-btn btn-3">
                    Ver contenido
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ms-2"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
