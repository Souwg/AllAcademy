import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext"; // ajusta la ruta
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/allCourses.css";
import noImage from "../../img/noImage.jpg";

export const AllCourses = () => {
  const { store, actions } = useContext(Context);
  const { courses, coursesLoading, coursesError } = store;

  useEffect(() => {
    actions.loadCourses();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "ease-in-out",
    draggable: true,
    swipeToSlide: true,
    arrows: false,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 3 } },
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1, centerMode: true } },
      { breakpoint: 400, settings: { slidesToShow: 1, centerMode: true } },
    ],
  };

  if (coursesLoading) {
    return (
      <div className="text-center my-5">
        {" "}
        <div className="wrapper">
          <div className="blue ball"></div>
          <div className="red ball"></div>
          <div className="yellow ball"></div>
          <div className="green ball"></div>
        </div>
      </div>
    );
  }

  if (coursesError) {
    return <p className="text-center my-5 text-danger">{coursesError}</p>;
  }

  return (
    <div className="courses-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1>
                Impulsa tu futuro con <br />
                <span>cursos de alto nivel</span>
              </h1>

              <p>
                Aprende habilidades prácticas con proyectos reales y mentores
                expertos.
              </p>
              <div className="d-flex flex-wrap gap-4 mt-3">
                <div className="d-flex align-items-center">
                  <div className="icon-benefit">
                    <i className="fas fa-certificate"></i>
                  </div>
                  <span>Certificados profesionales</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="icon-benefit">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <span>Enfocado en tu carrera</span>
                </div>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="hero-image-container">
                <img
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Aprendizaje online"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      {/* Featured Courses Section */}
      <div className="container mb-5">
        <h2 className="featured-courses-title">Cursos destacados</h2>

        <Slider {...sliderSettings}>
          {courses.map((course) => (
            <div key={course.id} style={{ padding: "0 10px" }}>
              <div className="course-card">
                <div className="position-relative">
                  <img
                    src={
                      course.image_url && course.image_url.trim() !== ""
                        ? course.image_url
                        : noImage
                    }
                    alt={course.title}
                  />
                </div>
                <div className="course-card-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">
                    {course.short_description}
                  </p>

                  {/* Ocultar meta y precio si es dummy */}
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    {course.isDummy ? (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Próximamente
                      </button>
                    ) : (
                      <Link
                        to={`/courses/${course.slug}`}
                        className="btn btn-sm btn-outline-primary btn-view-details"
                      >
                        Ver detalles
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* All Courses Section */}
      <div className="container mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <h2 className="all-courses-title mb-0">Todos nuestros cursos</h2>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {courses.map((course) => (
            <div key={course.id} className="col">
              <div className="grid-course-card">
                <div className="grid-course-image">
                  <img
                    src={
                      course.image_url && course.image_url.trim() !== ""
                        ? course.image_url
                        : noImage
                    }
                    alt={course.title}
                    className="img-fluid w-100 h-100"
                  />
                </div>
                <div className="grid-course-content">
                  <h3 className="grid-course-title">{course.title}</h3>
                  <p className="grid-course-description">
                    {course.short_description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="course-meta-info">
                      {course.isDummy ? (
                        <span>Próximamente</span>
                      ) : (
                        <>
                          <span className="d-flex align-items-center">
                            <i className="far fa-clock me-1"></i>{" "}
                            {course.duration || "N/A"}
                          </span>
                          <span className="d-flex align-items-center">
                            <i className="far fa-list-alt me-1"></i>{" "}
                            {course.lessons} lecciones
                          </span>
                        </>
                      )}
                    </div>

                    <span className="level-badge badge">{course.level}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    {course.isDummy ? (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Próximamente
                      </button>
                    ) : (
                      <>
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
                        <Link
                          to={`/courses/${course.slug}`}
                          className="btn btn-primary btn-sm btn-enroll"
                        >
                          Ver detalles
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center p-5 cta-container">
            <h2 className="cta-title">Aprende nuevas habilidades hoy</h2>
            <p className="cta-description">
              Accede a conocimiento profesional diseñado para impulsar tu
              crecimiento.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link
                to="/signup"
                className="btn btn-light btn-lg px-4 py-2 btn-cta-primary"
              >
                Registrarse gratis
              </Link>
            </div>
            <div className="trust-badge">
              <i className="fas fa-lock me-2"></i>
              <span>Aprendizaje 100% seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
