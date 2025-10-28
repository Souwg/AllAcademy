// pages/PayPalCancel.jsx
import React from "react";
export const PayPalCancel = () => (
  <div className="container py-5 text-center">
    <div className="alert alert-secondary">
      <i className="fa-solid fa-circle-xmark me-2"></i>
      Pago cancelado. Puedes intentar nuevamente cuando quieras.
    </div>
    <a className="btn btn-outline-primary mt-3" href="/allCourses">
      Volver a cursos
    </a>
  </div>
);
