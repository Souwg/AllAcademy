import React, { useContext, useEffect } from "react";
import { Context } from "../../store/appContext";
import "../../../styles/chooseCourses.css";
import { Link } from "react-router-dom";
import noImage from "../../../img/noImage.jpg";

export const ChooseCourses = () => {
  const { store, actions } = useContext(Context);
  const { courses, coursesLoading, coursesError } = store;

  useEffect(() => {
    actions.loadCourses();
  }, []);

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
              <h2>CONTENIDO DESTACADO</h2>
              <div className="title-line"></div>
            </div>
            <p>
              Explora <span className="underline">lo que puedes aprender</span>
            </p>
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {coursesLoading && (
        <p className="text-center text-muted">Cargando cursos...</p>
      )}
      {coursesError && (
        <p className="text-center text-danger">{coursesError}</p>
      )}

      {/* Tarjetas de cursos */}
      <div className="container">
        <div className="row g-4">
          {courses.slice(0, 6).map((course) => (
            <div key={course.id} className="col-12 col-md-6 col-lg-4">
              <div className="modern-course-card">
                {/* Imagen del curso */}
                <div className="course-image-container">
                  <img
                    src={
                      course.image_url && course.image_url.trim() !== ""
                        ? course.image_url
                        : noImage
                    }
                    alt={course.title}
                    className="course-image"
                  />
                  {!course.isDummy && (
                    <div className="course-hover-overlay">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="preview-button"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  )}
                </div>

                {/* Contenido de la tarjeta */}
                <div className="course-card-content">
                  <div className="course-meta">
                    <span className="course-level">
                      {course.level || "BEGINNER"}
                    </span>
                  </div>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="course-title-link"
                  >
                    <h3 className="course-title">{course.title}</h3>
                  </Link>

                  <p className="course-description">
                    {course.short_description}
                  </p>

                  <div className="course-footer">
                    {course.isDummy ? (
                      <span className="coming-soon">Próximamente</span>
                    ) : (
                      <>
                        <div className="course-stats">
                          <div className="stat-item">
                            <i className="fas fa-play-circle"></i>
                            <span>{course.lessons || 0} Lecciones</span>
                          </div>
                          <div className="stat-item">
                            <i className="fas fa-clock"></i>
                            <span>{course.duration || "N/A"}</span>
                          </div>
                        </div>
                        <div>
                          <span className="price-container">
                            ${course.discount_price}
                          </span>
                          {course.price > 0 && (
                            <span className="original-price">
                              ${course.price}
                            </span>
                          )}
                        </div>
                      </>
                    )}
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
