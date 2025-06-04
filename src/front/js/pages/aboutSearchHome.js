import React from "react";
import "../../styles/aboutSearch.css";
import { Link } from "react-router-dom";

export const AboutSearch = () => {
  return (
    <>
      <div
        className="container-fluid mx-0 bg-body-tertiary"
        style={{
          maxWidth: "100vw",
          height: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          className="container-fluid"
          style={{
            background: "#f4f4f4",
            paddingTop: "12rem",
            paddingBottom: "6rem",
            borderRadius: "4rem",
            marginBottom: "2rem",
            position: "relative", // Añade esto
            zIndex: 1, // Menor que el z-index de las cartas (3)
          }}
        >
          <div className="row">
            <div className="col-12">
              <p
                className="text-dark text-center position-relative"
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 80px)",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  padding: "0 1rem",
                  wordWrap: "break-word",
                }}
              >
                Get smart{" "}
                <span className="position-relative d-inline-block">
                  <span
                    className="d-none d-md-inline highlight-oval"
                    style={{
                      fontSize: "80px",
                      color: "#2D3078",
                      fontWeight: "700",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    opportunity
                  </span>
                </span>{" "}
                for your best future
              </p>
              <p
                className="text-center"
                style={{
                  fontSize: "20px",
                  fontWeight: "500",
                  fontFamily: "unset",
                  color: "#888",
                }}
              >
                It is a long established fact that reader will be distracted
                readable content of a page when.
              </p>
              <div className="search-container mb-5">
                <input
                  type="text"
                  placeholder="Search for courses"
                  className="search-input"
                />
                <button className="search-button">
                  <svg className="search-icon" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                    />
                  </svg>
                </button>
              </div>
              <div
                className="text-center mt-4 d-flex flex-wrap justify-content-center align-items-center gap-1 gap-md-2"
                style={{
                  marginBottom: "9rem",
                  padding: "0 1rem",
                }}
              >
                <p
                  className="mb-1 mb-md-0 me-2"
                  style={{
                    color: "#666",
                    fontFamily: "unset",
                    fontSize: "clamp(14px, 3vw, 16px)", // Texto responsive
                  }}
                >
                  Popular Topic:
                </p>

                {/* Enlaces individuales con estilos responsive */}
                <Link
                  to="/Design"
                  className="links-courses"
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 15px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Design.
                </Link>
                <Link
                  to="/Development"
                  className="links-courses"
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 15px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Development.
                </Link>
                <Link
                  to="/Graphics"
                  className="links-courses"
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 15px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Graphics.
                </Link>
                <Link
                  to="/Marketing"
                  className="links-courses"
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 15px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Marketing.
                </Link>
                <Link
                  to="/Business"
                  className="links-courses"
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 15px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Business.
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*cards*/}
      <div
        className="container-fluid"
        style={{
          background: "#f9f9f9",
          maxWidth: "100vw",
          height: "auto",

          paddingTop: "4rem",
          borderRadius: "4rem 4rem 0 0",
        }}
      >
        <div
          className="container"
          style={{
            background: "#F8F8F8",
            width: "auto",
            height: "auto",
            padding: "0 1rem 6rem 1rem",
            position: "relative",
            paddingTop: "1rem",
            zIndex: "2",
          }}
        >
          <div
            className="row"
            style={{ position: "relative", marginTop: "-250px", zIndex: "3" }}
          >
            <div className="col-sm-6 col-lg-4 mb-3 px-0">
              <div
                className="card h-100"
                style={{
                  borderLeft: "none",
                  boxShadow: `
        0 -12px 18px -6px rgba(0, 0, 0, 0.08),
        0 12px 18px -6px rgba(0, 0, 0, 0.08)
      `,
                  borderRadius: "1rem 1rem 2rem 2rem",
                }}
              >
                <div className="card-body">
                  <div className="row">
                    <h5 className="card-title">Special title treatment</h5>
                  </div>
                  <div className="row">
                    <p className="card-text">
                      With supporting text below as a natural lead-in to
                      additional content.
                    </p>
                  </div>
                  <button className="btn-79 d-inline">
                    <span>
                      Explore
                      <i
                        className="fa-solid fa-arrow-right ms-2"
                        style={{ fontSize: "13px", color: "#fff" }}
                      ></i>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-4 mb-3 px-0">
              <div
                className="card h-100 "
                style={{
                  borderLeft: "none",
                  boxShadow: `
        0 -12px 18px -6px rgba(0, 0, 0, 0.08),
        0 12px 18px -6px rgba(0, 0, 0, 0.08)
      `,
                  borderRadius: "1rem 1rem 2rem 2rem",
                }}
              >
                <div className="card-body">
                  <div className="row">
                    <h5 className="card-title">Special title treatment</h5>
                  </div>
                  <div className="row">
                    <p className="card-text">
                      With supporting text below as a natural lead-in to
                      additional content.
                    </p>
                  </div>
                  <button className="btn-79 d-inline">
                    <span>
                      Explore
                      <i
                        className="fa-solid fa-arrow-right ms-2"
                        style={{ fontSize: "13px", color: "#fff" }}
                      ></i>
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-3 px-0">
              <div
                className="card h-100 "
                style={{
                  borderRight: "none",
                  boxShadow: `
        0 -12px 18px -6px rgba(0, 0, 0, 0.08),
        0 12px 18px -6px rgba(0, 0, 0, 0.08)
      `,
                  borderRadius: "1rem 1rem 2rem 2rem",
                }}
              >
                <div className="card-body">
                  <div className="row">
                    <h5 className="card-title">Special title treatment</h5>
                  </div>
                  <div className="row">
                    <p className="card-text">
                      With supporting text below as a natural lead-in to
                      additional content.
                    </p>
                  </div>

                  <button className="btn-79 d-inline">
                    <span>
                      Explore
                      <i
                        className="fa-solid fa-arrow-right ms-2"
                        style={{ fontSize: "13px", color: "#fff" }}
                      ></i>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
