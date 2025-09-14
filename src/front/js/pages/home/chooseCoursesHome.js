import React from "react";
import "../../../styles/chooseCourses.css";
import { Link } from "react-router-dom";
import { courses } from "../coursesData";

export const ChooseCourses = () => {
  return (
    <div
      className="container-fluid"
      style={{
        background: "linear-gradient(to right, #E7ECF5 0%, #C8D3E3 100%)",
        maxWidth: "100vw",
        height: "auto",
        overflowX: "hidden",
        padding: "0 1rem 6rem 1rem",
      }}
    >
      {/* Encabezado */}
      <div className="container mb-4">
        <div className="row">
          <div className="popular-courses-header">
            <div className="title-with-line">
              <h2>POPULAR COURSES</h2>
              <div className="title-line"></div>
            </div>
            <p>
              Choose Our <span className="underline">Top Courses</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de cursos */}
      <div className="container">
        <div className="row g-4">
          {courses.slice(0, 6).map((course) => (
            <div key={course.id} className="col-12 col-md-6 col-lg-4">
              <div className="modern-course-card">
                {/* Imagen del curso */}
                <div className="course-image-container">
                  <img
                    src={course.image}
                    alt={course.alt}
                    className="course-image"
                  />
                  <div className="course-hover-overlay">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="preview-button"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="course-card-content">
                  <div className="course-meta">
                    <span className="course-level">{course.level}</span>
                  </div>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="course-title-link"
                  >
                    <h3 className="course-title">{course.title}</h3>
                  </Link>

                  <p className="course-description">{course.description}</p>

                  <div className="course-footer">
                    <div className="course-stats">
                      <div className="stat-item">
                        <i className="fas fa-play-circle"></i>
                        <span>{course.lessons} Lecciones</span>
                      </div>
                      <div className="stat-item">
                        <i className="fas fa-clock"></i>
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div className="course-price-container">
                      <span className="price">${course.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
