import React from "react";
import { useParams } from "react-router-dom";
import { courses } from "./allCourses"; // Asegúrate de exportar el array de cursos

export const CourseDetails = () => {
  const { slug } = useParams();
  const course = courses.find((course) => course.slug === slug);

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="container py-5">
      <h1>{course.title}</h1>
      <img src={course.image} alt={course.alt} className="img-fluid" />
      <p>{course.description}</p>
      {/* Agrega más detalles del curso aquí */}
    </div>
  );
};
