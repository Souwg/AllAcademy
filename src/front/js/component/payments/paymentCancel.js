import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const method = searchParams.get("method") || "unknown";

  return (
    <div className="container py-5 text-center">
      <div className="alert alert-secondary shadow-sm py-4">
        <i className="fa-solid fa-circle-xmark fa-2x mb-3 text-secondary" />
        <h2 className="fw-bold mb-3">Pago cancelado</h2>
        <p className="mb-3">
          Tu transacción fue cancelada.
          {method !== "unknown" && ` Método: ${method.toUpperCase()}.`}
        </p>
        <button
          className="btn btn-outline-primary rounded-pill px-4"
          onClick={() => navigate("/allCourses")}
        >
          Volver a los cursos
        </button>
      </div>
    </div>
  );
};
