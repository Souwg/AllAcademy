import React from "react";
import { Link } from "react-router-dom";
import image from "../../img/noImage.jpg";

const courses = [
  {
    image: image,
    alt: "Advanced Mathematics",
    title: "Advanced Mathematics: Calculus & Linear Algebra",
  },
  {
    image: image,
    alt: "Art Fundamentals",
    title: "Fundamentals of Fine Arts & Creative Design",
  },
  {
    image: image,
    alt: "Business Management",
    title: "Modern Business Management & Entrepreneurship",
  },
  {
    image: image,
    alt: "Programming Course",
    title: "Full-Stack Web Development Bootcamp",
  },
  {
    image: image,
    alt: "Statistics Course",
    title: "Applied Statistics & Data Analysis",
  },
  {
    image: image,
    alt: "Digital Art",
    title: "Digital Illustration & Graphic Design",
  },
  {
    image: image,
    alt: "Marketing Course",
    title: "Digital Marketing & Social Media Strategy",
  },
  {
    image: image,
    alt: "Mobile Development",
    title: "Mobile App Development with React Native",
  },
  {
    image: image,
    alt: "Discrete Mathematics",
    title: "Discrete Mathematics for Computer Science",
  },
];

export const AllCourses = () => (
  <div
    className="container-fluid"
    style={{
      background: "#f7f7f7",
      padding: "2rem 0",
      borderTopLeftRadius: "4rem",
      borderTopRightRadius: "4rem",
    }}
  >
    <div className="row">
      <h2
        className="text-center"
        style={{
          marginTop: "10rem",
          fontSize: "3rem",
          fontWeight: "700",
          marginBottom: "1.5rem",
          color: "#001933",
        }}
      >
        All Courses
      </h2>
      <span
        className="d-flex justify-content-center align-items-center"
        style={{ color: "#001933" }}
      >
        <Link
          className="text-decoration-none mb-3 me-2"
          to="/"
          style={{ color: "#001933" }}
        >
          Home
        </Link>
        <p style={{ color: "#001933" }}>/ All Courses</p>
      </span>
    </div>

    <div className="container text-center">
      <div className="row">
        <div className="popular-courses-header">
          <div className="title-with-line mt-5">
            <h2>POPULAR COURSES</h2>
            <div className="title-line"></div>
          </div>
          <p>
            Choose Our <span className="underline">Top Courses</span>
          </p>
        </div>
      </div>
      <div className="row gx-3 gy-4">
        {courses.map(({ image, alt, title }, index) => {
          const isFirstRow = index < 3;
          const isLastRow = index >= courses.length - 3;

          return (
            <div
              key={index}
              className={`col-12 col-md-6 col-lg-4 d-flex ${
                isFirstRow ? "mt-5" : ""
              } ${isLastRow ? "mb-5" : ""}`}
            >
              <div
                className="card border w-100"
                style={{
                  borderRadius: "10px",
                  aspectRatio: "1 / 1",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={image}
                  alt={alt}
                  className="img-fluid"
                  style={{
                    width: "100%",
                    aspectRatio: "3 / 2",
                    objectFit: "cover",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                />
                <div className="card-body d-flex flex-column justify-content-between p-3">
                  <Link to="/" className="text-decoration-none mb-3">
                    <h5 className="card-title text-start">{title}</h5>
                  </Link>
                  <div
                    className="d-flex flex-wrap mb-3"
                    style={{ gap: "0.5rem 1rem" }}
                  >
                    {[
                      { icon: "calendar-days", text: "3 Lessons" },
                      { icon: "clock", text: "3h 45min" },
                      { icon: "star", text: "4.9" },
                      { icon: "table-cells", text: "30 Seats" },
                    ].map(({ icon, text }, i) => (
                      <span key={i} className="d-flex align-items-center">
                        <i className={`fa-solid fa-${icon} me-2`}></i>
                        <span>{text}</span>
                      </span>
                    ))}
                  </div>
                  <div className="text-start">
                    <Link to="/" className="btn btn-primary">
                      Check Course
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
