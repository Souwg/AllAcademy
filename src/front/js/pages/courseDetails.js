import React from "react";
import { useParams, Link } from "react-router-dom";
import { courses } from "./coursesData";
import {
  FaClock,
  FaCalendarAlt,
  FaCertificate,
  FaMoneyBillWave,
  FaChevronRight,
  FaVideo,
  FaPlayCircle,
} from "react-icons/fa";

export const CourseDetails = () => {
  const { slug } = useParams();
  const course = courses.find((course) => course.slug === slug);

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary mt-3">
          Browse All Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="course-details-page" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Hero Section */}
      <div
        className="hero-section-course py-5"
        style={{ backgroundColor: "#001933" }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/" className="text-white-50">
                      Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/courses" className="text-white-50">
                      Courses
                    </Link>
                  </li>
                  <li
                    className="breadcrumb-item active text-white"
                    aria-current="page"
                  >
                    {course.title}
                  </li>
                </ol>
              </nav>
              <h1 className="text-white display-4 fw-bold mb-3">
                {course.title}
              </h1>
              <p className="text-white-50 lead mb-4">{course.description}</p>

              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center text-white">
                  <FaClock className="me-2" />
                  <span>Last updated {course.lastUpdated}</span>
                </div>

                {/* Horario de clases en vivo - desde los datos del curso */}
                {course.liveClasses && course.schedule && (
                  <div className="d-flex align-items-center text-white">
                    <FaPlayCircle className="me-2 text-warning" />
                    <span>
                      Clases en vivo: {course.schedule.days.join(" y ")} de{" "}
                      {course.schedule.time} ({course.schedule.timezone})
                    </span>
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success px-3 py-2 rounded-pill">
                  New Release
                </span>
                <span className="badge bg-info px-3 py-2 rounded-pill">
                  {course.level}
                </span>
                {course.liveClasses && (
                  <span className="badge bg-warning px-3 py-2 rounded-pill">
                    <FaVideo className="me-1" /> Clases en vivo
                  </span>
                )}
                {course.recordedVideos && (
                  <span className="badge bg-secondary px-3 py-2 rounded-pill">
                    <FaVideo className="me-1" /> Videos guardados
                  </span>
                )}
              </div>
            </div>
            <div className="col-lg-4 d-none d-lg-block">
              <div className="ratio ratio-16x9">
                <img
                  src={course.image}
                  alt={course.alt}
                  className="img-fluid rounded-3 shadow"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row">
          {/* Left Column - Course Content */}
          <div className="col-lg-8 pe-lg-5">
            {/* Información de clases en vivo - solo si el curso tiene clases en vivo */}
            {course.liveClasses && (
              <section className="mb-5 p-4 bg-light rounded-3">
                <h2 className="fw-bold mb-4 text-primary">
                  <FaPlayCircle className="me-2" />
                  Modalidad de Clases
                </h2>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle p-3 me-3">
                        <FaClock size={24} />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Horario de Clases</h5>
                        <p className="mb-0">
                          {course.schedule.days.join(" y ")} de{" "}
                          {course.schedule.time} ({course.schedule.timezone})
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success text-white rounded-circle p-3 me-3">
                        <FaVideo size={24} />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Clases en Vivo</h5>
                        <p className="mb-0">
                          Interactúa en tiempo real con el instructor
                        </p>
                      </div>
                    </div>
                  </div>
                  {course.recordedVideos && (
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-info text-white rounded-circle p-3 me-3">
                          <FaPlayCircle size={24} />
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">Acceso a Grabaciones</h5>
                          <p className="mb-0">
                            Todas las clases se graban y quedan disponibles
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-warning text-white rounded-circle p-3 me-3">
                        <FaCalendarAlt size={24} />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Acceso Continuo</h5>
                        <p className="mb-0">
                          Accede a los videos las 24/7 después de cada clase
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* What You'll Learn */}
            <section className="mb-5">
              <h2 className="fw-bold mb-4">What you'll learn</h2>
              <div className="row">
                {course.whatYouLearn.map((item, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="d-flex">
                      <span className="text-success me-2">
                        <FaChevronRight />
                      </span>
                      <span>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Content */}
            <section className="mb-5">
              <h2 className="fw-bold mb-4">Course content</h2>
              <div className="accordion" id="courseAccordion">
                {course.curriculum.map((item, index) => (
                  <div
                    key={index}
                    className="accordion-item mb-2 border-0 shadow-sm rounded-3 overflow-hidden"
                  >
                    <h3 className="accordion-header">
                      <button
                        className="accordion-button collapsed bg-white fw-bold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                      >
                        <span className="me-3">
                          {item.module}: {item.title}
                        </span>
                        <span className="text-muted">
                          {item.lessons} lessons
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                      data-bs-parent="#courseAccordion"
                    >
                      <div className="accordion-body pt-0">
                        <div className="list-group list-group-flush">
                          {[...Array(item.lessons)].map((_, i) => (
                            <div
                              key={i}
                              className="list-group-item border-0 py-3 d-flex justify-content-between align-items-center"
                            >
                              <div className="d-flex align-items-center">
                                <span className="me-3 text-muted">
                                  {i + 1}.
                                </span>
                                <span>
                                  Lesson {i + 1}: {item.title} topic
                                </span>
                              </div>
                              {/* Se han eliminado las etiquetas "En vivo" y "Grabación" */}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Requirements */}
            <section className="mb-5">
              <h2 className="fw-bold mb-4">Requirements</h2>
              <ul className="list-unstyled">
                {course.requirements.map((item, index) => (
                  <li key={index} className="mb-2">
                    <span className="me-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructor */}
            <section className="mb-5">
              <h2 className="fw-bold mb-4">Instructor</h2>
              <div className="d-flex align-items-start">
                <img
                  src={course.instructorImage}
                  alt={course.instructor}
                  className="rounded-circle me-4"
                  width="100"
                  height="100"
                />
                <div>
                  <h3 className="fw-bold mb-1">{course.instructor}</h3>
                  <p className="text-muted mb-2">{course.instructorBio}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Pricing & Details */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              <div className="card shadow-lg border-0">
                <img
                  src={course.image}
                  alt={course.alt}
                  className="card-img-top d-lg-none"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <div className="mb-3">
                    <h3 className="card-title fw-bold mb-0">
                      ${course.discountPrice || course.price}
                    </h3>
                    {course.discountPrice && (
                      <span className="text-muted text-decoration-line-through ms-2">
                        ${course.price}
                      </span>
                    )}
                    <div className="mt-2 text-muted small">
                      * Use code <strong>LEARN20</strong> at checkout for 20%
                      off
                    </div>
                  </div>

                  <div className="d-grid gap-2 mb-4">
                    <button className="btn btn-primary btn-lg py-3 fw-bold">
                      Enroll Now
                    </button>
                    <button className="btn btn-outline-secondary py-3">
                      Add to Wishlist
                    </button>
                  </div>

                  <h5 className="fw-bold mb-3">This course includes:</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <FaClock className="text-primary me-2" />
                      <span>{course.lessons} on-demand lessons</span>
                    </li>
                    <li className="mb-2">
                      <FaCalendarAlt className="text-primary me-2" />
                      <span>Lifetime access</span>
                    </li>
                    {course.liveClasses && (
                      <li className="mb-2">
                        <FaPlayCircle className="text-primary me-2" />
                        <span>Clases en vivo programadas</span>
                      </li>
                    )}
                    {course.recordedVideos && (
                      <li className="mb-2">
                        <FaVideo className="text-primary me-2" />
                        <span>Grabaciones de todas las clases</span>
                      </li>
                    )}
                    {course.certificate && (
                      <li className="mb-2">
                        <FaCertificate className="text-primary me-2" />
                        <span>Certificate of completion</span>
                      </li>
                    )}
                  </ul>

                  {/* Información adicional sobre horarios - solo si hay clases en vivo */}
                  {course.liveClasses && course.schedule && (
                    <div className="mt-4 p-3 bg-light rounded-3">
                      <h6 className="fw-bold mb-2">
                        <FaClock className="me-2 text-warning" />
                        Horario de clases:
                      </h6>
                      <p className="mb-1">{course.schedule.days.join(" y ")}</p>
                      <p className="mb-0 fw-bold">
                        {course.schedule.time} ({course.schedule.timezone})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Courses */}
      <div className="bg-white py-5">
        <div className="container">
          <h2 className="fw-bold mb-4">More courses you might like</h2>
          <div className="row g-4">
            {courses
              .filter((c) => c.id !== course.id)
              .slice(0, 3)
              .map((relatedCourse) => (
                <div key={relatedCourse.id} className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <img
                      src={relatedCourse.image}
                      alt={relatedCourse.alt}
                      className="card-img-top"
                      style={{ height: "180px", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{relatedCourse.title}</h5>
                      <p className="card-text text-muted small">
                        {relatedCourse.description.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="card-footer bg-white border-0">
                      <Link
                        to={`/courses/${relatedCourse.slug}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
