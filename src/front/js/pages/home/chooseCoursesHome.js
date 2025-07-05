import React from "react";
import "../../../styles/chooseCourses.css";
import { Link } from "react-router-dom";
import image from "../../../img/noImage.jpg";

export const ChooseCourses = () => {
  return (
    <div
      className="container-fluid"
      style={{
        background: "#F7F7F7",
        maxWidth: "100vw",
        height: "auto",
        overflowX: "hidden",
        padding: "0 1rem 6rem 1rem",
        borderTopLeftRadius: "4rem",
        borderTopRightRadius: "4rem",
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

      {/* Contenedor principal de cartas con espaciado uniforme */}
      <div className="container">
        <div className="row g-4">
          {" "}
          {/* g-4 añade gap uniforme */}
          {/* Carta 1 */}
          <div className="col-12 col-md-6">
            <div
              className="card border-0 bg-white overflow-hidden shadow-sm d-flex flex-column h-100"
              style={{ transition: "transform 0.2s", borderRadius: "0.5rem" }}
            >
              {/* Contenido de la carta 1 */}
              <div className="card-body pe-4 ps-0 pt-0 pb-0">
                <div className="row g-2 align-items-start flex-md-row flex-column">
                  <div className="col-12 col-md-6 pe-0 ps-0 mb-2">
                    <img
                      src={image}
                      className="img-fluid rounded-3"
                      alt="Curso de diseño"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-6 ps-md-4 ps-0">
                    <Link to="/" style={{ color: "#001933" }}>
                      <span className="d-block pt-4">Design</span>
                    </Link>
                    <Link to="/Desing" className="text-decoration-none">
                      <h4
                        className="fw-semibold mt-4 course-title"
                        style={{ color: "#001933" }}
                      >
                        Basic Fundamentals Of Interior & Graphics Design
                      </h4>
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className="px-4 pt-4 ps-1 mt-auto"
                style={{ paddingBottom: "3rem" }}
              >
                <div className="d-flex flex-wrap justify-content-start">
                  <span className="me-3 mb-2">
                    <i
                      className="fa-solid fa-calendar-days me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3 Lessons
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-clock me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3h 45m
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-star me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    4.9
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-table-cells me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    30 Seats Available
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Carta 2 */}
          <div className="col-12 col-md-6">
            <div
              className="card border-0 bg-white overflow-hidden shadow-sm d-flex flex-column h-100"
              style={{ transition: "transform 0.2s", borderRadius: "0.5rem" }}
            >
              {/* Contenido de la carta 2 */}
              <div className="card-body pe-4 ps-0 pt-0 pb-0">
                <div className="row g-2 align-items-start flex-md-row flex-column">
                  <div className="col-12 col-md-6 pe-0 ps-0 mb-2">
                    <img
                      src={image}
                      className="img-fluid rounded-3"
                      alt="Curso de programación"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-6 ps-md-4 ps-0">
                    <Link to="/" style={{ color: "#001933" }}>
                      <span className="d-block pt-4">Programming</span>
                    </Link>
                    <Link to="/Desing" className="text-decoration-none">
                      <h4
                        className="fw-semibold mt-4 course-title"
                        style={{ color: "#001933" }}
                      >
                        Full-Stack Web Development Bootcamp
                      </h4>
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className="px-4 pt-4 ps-1 mt-auto"
                style={{ paddingBottom: "3rem" }}
              >
                <div className="d-flex flex-wrap justify-content-start">
                  <span className="me-3 mb-2">
                    <i
                      className="fa-solid fa-calendar-days me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3 Lessons
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-clock me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3h 45m
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-star me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    4.9
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-table-cells me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    30 Seats Available
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Carta 3 */}
          <div className="col-12 col-md-6">
            <div
              className="card border-0 bg-white overflow-hidden shadow-sm d-flex flex-column h-100"
              style={{ transition: "transform 0.2s", borderRadius: "0.5rem" }}
            >
              {/* Contenido de la carta 3 */}
              <div className="card-body pe-4 ps-0 pt-0 pb-0">
                <div className="row g-2 align-items-start flex-md-row flex-column">
                  <div className="col-12 col-md-6 pe-0 ps-0 mb-2">
                    <img
                      src={image}
                      className="img-fluid rounded-3"
                      alt="Curso de negocios"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-6 ps-md-4 ps-0">
                    <Link to="/" style={{ color: "#001933" }}>
                      <span className="d-block pt-4">Business</span>
                    </Link>
                    <Link to="/Desing" className="text-decoration-none">
                      <h4
                        className="fw-semibold mt-4 course-title"
                        style={{ color: "#001933" }}
                      >
                        Modern Business Management
                      </h4>
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className="px-4 pt-4 ps-1 mt-auto"
                style={{ paddingBottom: "3rem" }}
              >
                <div className="d-flex flex-wrap justify-content-start">
                  <span className="me-3 mb-2">
                    <i
                      className="fa-solid fa-calendar-days me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3 Lessons
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-clock me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3h 45m
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-star me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    4.9
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-table-cells me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    30 Seats Available
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Carta 4 */}
          <div className="col-12 col-md-6">
            <div
              className="card border-0 bg-white overflow-hidden shadow-sm d-flex flex-column h-100"
              style={{ transition: "transform 0.2s", borderRadius: "0.5rem" }}
            >
              {/* Contenido de la carta 4 */}
              <div className="card-body pe-4 ps-0 pt-0 pb-0">
                <div className="row g-2 align-items-start flex-md-row flex-column">
                  <div className="col-12 col-md-6 pe-0 ps-0 mb-2">
                    <img
                      src={image}
                      className="img-fluid rounded-3"
                      alt="Curso de matemáticas"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-6 ps-md-4 ps-0">
                    <Link to="/" style={{ color: "#001933" }}>
                      <span className="d-block pt-4">Math</span>
                    </Link>
                    <Link to="/Desing" className="text-decoration-none">
                      <h4
                        className="fw-semibold mt-4 course-title"
                        style={{ color: "#001933" }}
                      >
                        Advanced Mathematics Concepts
                      </h4>
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className="px-4 pt-4 ps-1 mt-auto"
                style={{ paddingBottom: "3rem" }}
              >
                <div className="d-flex flex-wrap justify-content-start">
                  <span className="me-3 mb-2">
                    <i
                      className="fa-solid fa-calendar-days me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3 Lessons
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-clock me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3h 45m
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-star me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    4.9
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-table-cells me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    30 Seats Available
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Carta 5 */}
          <div className="col-12 col-md-6">
            <div
              className="card border-0 bg-white overflow-hidden shadow-sm d-flex flex-column h-100"
              style={{ transition: "transform 0.2s", borderRadius: "0.5rem" }}
            >
              {/* Contenido de la carta 5 */}
              <div className="card-body pe-4 ps-0 pt-0 pb-0">
                <div className="row g-2 align-items-start flex-md-row flex-column">
                  <div className="col-12 col-md-6 pe-0 ps-0 mb-2">
                    <img
                      src={image}
                      className="img-fluid rounded-3"
                      alt="Curso de pintura avanzada"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-6 ps-md-4 ps-0">
                    <Link to="/" style={{ color: "#001933" }}>
                      <span className="d-block pt-4">Design</span>
                    </Link>
                    <Link to="/Desing" className="text-decoration-none">
                      <h4
                        className="fw-semibold mt-4 course-title"
                        style={{ color: "#001933" }}
                      >
                        Advanced Painting Techniques
                      </h4>
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className="px-4 pt-4 ps-1 mt-auto"
                style={{ paddingBottom: "3rem" }}
              >
                <div className="d-flex flex-wrap justify-content-start">
                  <span className="me-3 mb-2">
                    <i
                      className="fa-solid fa-calendar-days me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3 Lessons
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-clock me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3h 45m
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-star me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    4.9
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-table-cells me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    30 Seats Available
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Carta 6 */}
          <div className="col-12 col-md-6">
            <div
              className="card border-0 bg-white overflow-hidden shadow-sm d-flex flex-column h-100"
              style={{ transition: "transform 0.2s", borderRadius: "0.5rem" }}
            >
              {/* Contenido de la carta 6 */}
              <div className="card-body pe-4 ps-0 pt-0 pb-0">
                <div className="row g-2 align-items-start flex-md-row flex-column">
                  <div className="col-12 col-md-6 pe-0 ps-0 mb-2">
                    <img
                      src={image}
                      className="img-fluid rounded-3"
                      alt="Curso de diseño gráfico"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-6 ps-md-4 ps-0">
                    <Link to="/" style={{ color: "#001933" }}>
                      <span className="d-block pt-4">Design</span>
                    </Link>
                    <Link to="/Desing" className="text-decoration-none">
                      <h4
                        className="fw-semibold mt-4 course-title"
                        style={{ color: "#001933" }}
                      >
                        Graphic Design Fundamentals
                      </h4>
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className="px-4 pt-4 ps-1 mt-auto"
                style={{ paddingBottom: "3rem" }}
              >
                <div className="d-flex flex-wrap justify-content-start">
                  <span className="me-3 mb-2">
                    <i
                      className="fa-solid fa-calendar-days me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3 Lessons
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-clock me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    3h 45m
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-star me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    4.9
                  </span>
                  <span>
                    <i
                      className="fa-solid fa-table-cells me-1"
                      style={{ color: "#2D3078", marginLeft: "2rem" }}
                    ></i>
                    30 Seats Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
