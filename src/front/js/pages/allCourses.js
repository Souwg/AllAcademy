import React from "react";
import { Link } from "react-router-dom";
import image from "../../img/noImage.jpg";

export const courses = [
  {
    id: 1,
    slug: "advanced-math",
    image: image,
    alt: "Advanced Mathematics",
    title: "Advanced Mathematics: Calculus & Linear Algebra",
    description:
      "Explore the depths of calculus and linear algebra in this advanced course designed for aspiring mathematicians and engineers.",
  },
  {
    id: 2,
    slug: "art-fundamentals",
    image: image,
    alt: "Art Fundamentals",
    title: "Fundamentals of Fine Arts & Creative Design",
    description:
      "Dive into the world of fine arts and creative design, mastering the essential techniques and concepts that form the foundation of artistic expression.",
  },
  {
    id: 3,
    slug: "business-management",
    image: image,
    alt: "Business Management",
    title: "Modern Business Management & Entrepreneurship",
    description:
      "Learn the principles of modern business management and entrepreneurship, equipping yourself with the skills to succeed in today's dynamic business environment.",
  },
  {
    id: 4,
    slug: "web-development",
    image: image,
    alt: "Programming Course",
    title: "Full-Stack Web Development Bootcamp",
    description:
      "Become a full-stack web developer with this comprehensive bootcamp, covering everything from front-end design to back-end programming.",
  },
  {
    id: 5,
    slug: "statistics-data-analysis",
    image: image,
    alt: "Statistics Course",
    title: "Applied Statistics & Data Analysis",
    description:
      "Master the art of data analysis with applied statistics, learning how to interpret and visualize data effectively.",
  },
  {
    id: 6,
    slug: "digital-art-design",
    image: image,
    alt: "Digital Art",
    title: "Digital Illustration & Graphic Design",
    description:
      "Unleash your creativity with digital illustration and graphic design, mastering the tools and techniques to create stunning visual content.",
  },
  {
    id: 7,
    slug: "digital-marketing",
    image: image,
    alt: "Marketing Course",
    title: "Digital Marketing & Social Media Strategy",
    description:
      "Explore the world of digital marketing and social media strategy, learning how to effectively promote brands and engage audiences online.",
  },
  {
    id: 8,
    slug: "mobile-development",
    image: image,
    alt: "Mobile Development",
    title: "Mobile App Development with React Native",
    description:
      "Learn how to build cross-platform mobile applications using React Native, a powerful framework for mobile development.",
  },
  {
    id: 9,
    slug: "data-science",
    image: image,
    alt: "Discrete Mathematics",
    title: "Discrete Mathematics for Computer Science",
    description:
      "Delve into discrete mathematics, a crucial area for computer science, covering topics such as logic, set theory, and graph theory.",
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
        {courses.map((course, index) => {
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
                  src={course.image}
                  alt={course.alt}
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
                  <Link
                    to={`/courses/${course.slug}`}
                    className="text-decoration-none mb-3"
                  >
                    <h5 className="card-title text-start">{course.title}</h5>
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
                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn btn-primary"
                    >
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
