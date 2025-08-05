import React from "react";
import { Link } from "react-router-dom";
import { courses } from "./coursesData";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/allCourses.css";

export const AllCourses = () => {
  const featuredCourses = [...courses];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true, // Activar autoplay
    autoplaySpeed: 3000, // Velocidad en milisegundos (3 segundos)
    cssEase: "ease-in-out",
    draggable: true,
    swipeToSlide: true,
    arrows: false, // Ocultar flechas
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerPadding: "20px",
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerPadding: "10px",
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerPadding: "20px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerPadding: "10px",
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "30px",
          centerMode: true,
        },
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "20px",
          centerMode: true,
        },
      },
    ],
  };

  return (
    <div className="courses-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1>
                Launch Your Future with <br />
                <span>Cutting-Edge Courses</span>
              </h1>

              <p>
                Master in-demand skills with project-based learning and
                industry-expert instructors.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <button className="btn btn-outline-light btn-lg px-4 py-3">
                  <i className="fas fa-play me-2"></i> How It Works
                </button>
              </div>

              <div className="d-flex flex-wrap gap-4 mt-3">
                <div className="d-flex align-items-center">
                  <div className="icon-benefit">
                    <i className="fas fa-certificate"></i>
                  </div>
                  <span>Industry Certificates</span>
                </div>

                <div className="d-flex align-items-center">
                  <div className="icon-benefit">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <span>Career-Focused</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="hero-image-container">
                <img
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Online learning"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className="container mb-5">
        <h2 className="featured-courses-title">Featured Courses</h2>

        <Slider {...sliderSettings}>
          {featuredCourses.map((course) => (
            <div key={course.id} style={{ padding: "0 10px" }}>
              <div className="course-card">
                <div className="position-relative">
                  <img src={course.image} alt={course.alt} />
                </div>
                <div className="course-card-content">
                  <div style={{ flex: 1 }}>
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                  </div>

                  <div className="course-meta">
                    <span className="d-flex align-items-center">
                      <i className="far fa-clock me-1"></i> {course.duration}
                    </span>
                    <span className="d-flex align-items-center">
                      <i className="far fa-list-alt me-1"></i> {course.lessons}{" "}
                      lessons
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      <span className="course-price">${course.price}</span>
                    </div>
                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn btn-sm btn-outline-primary btn-view-details"
                    >
                      View Details
                    </Link>
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
          <h2 className="all-courses-title mb-0">All Our Courses</h2>

          <div className="d-flex flex-wrap gap-2">
            <div className="position-relative">
              <button
                className="btn btn-outline-secondary btn-sm dropdown-toggle filter-btn"
                aria-expanded="false"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-tags"></i>
                <span>Categories</span>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    Web Development
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Business
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Design
                  </a>
                </li>
              </ul>
            </div>

            <div className="position-relative">
              <button
                className="btn btn-outline-secondary btn-sm dropdown-toggle filter-btn"
                aria-expanded="false"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-sliders-h"></i>
                <span>Filters</span>
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end p-3"
                style={{ minWidth: "280px" }}
              >
                <li className="mb-2">
                  <label className="form-label d-block">Price Range</label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="500"
                  />
                </li>
                <li className="mb-2">
                  <label className="form-label">Duration</label>
                  <select className="form-select form-select-sm">
                    <option>Any</option>
                    <option>0-5 hours</option>
                    <option>5-10 hours</option>
                  </select>
                </li>
                <li>
                  <button className="btn btn-primary btn-sm w-100 mt-2">
                    Apply
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {courses.map((course) => (
            <div key={course.id} className="col">
              <div className="grid-course-card">
                <div className="grid-course-image">
                  <img
                    src={course.image}
                    alt={course.alt}
                    className="img-fluid w-100 h-100"
                  />
                </div>

                <div className="grid-course-content">
                  <div className="mb-2">
                    <h3 className="grid-course-title">{course.title}</h3>
                    <p className="instructor-name">By {course.instructor}</p>
                  </div>

                  <p className="grid-course-description">
                    {course.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="course-meta-info">
                      <span className="d-flex align-items-center">
                        <i className="far fa-clock me-1"></i> {course.duration}
                      </span>
                      <span className="d-flex align-items-center">
                        <i className="far fa-list-alt me-1"></i>{" "}
                        {course.lessons} lessons
                      </span>
                    </div>
                    <span className="level-badge badge">{course.level}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      <span className="price-container">${course.price}</span>
                      {course.originalPrice && (
                        <span className="original-price">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn btn-primary btn-sm btn-enroll"
                    >
                      Enroll Now
                    </Link>
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
            <h2 className="cta-title">Master New Skills Today</h2>
            <p className="cta-description">
              Access professional knowledge designed to boost your growth.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link
                to="/signup"
                className="btn btn-light btn-lg px-4 py-2 btn-cta-primary"
              >
                Sign Up Free
              </Link>
              <Link
                to="/how-it-works"
                className="btn btn-outline-light btn-lg px-4 py-2 btn-cta-outline"
              >
                How It Works
              </Link>
            </div>
            <div className="trust-badge">
              <i className="fas fa-lock me-2"></i>
              <span>100% Secure Learning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
