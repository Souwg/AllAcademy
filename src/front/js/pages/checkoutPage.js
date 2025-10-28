// pages/checkoutPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckoutForm } from "./checkoutForm";
import { Context } from "../store/appContext"; // Si usas context

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const courseId = localStorage.getItem("selectedCourseId");
    const clientSecret = localStorage.getItem("clientSecret");

    console.log("📋 CheckoutPage - Course ID:", courseId);
    console.log(
      "📋 CheckoutPage - Client Secret:",
      clientSecret ? "✅ Presente" : "❌ Ausente"
    );

    if (courseId) {
      // Aquí podrías hacer un fetch para obtener más info del curso si lo necesitas
      setCourseInfo({ id: courseId });
    }

    if (!clientSecret) {
      console.error("❌ No hay clientSecret - redirigiendo a cursos");
      navigate("/allCourses");
      return;
    }

    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Preparando checkout...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow border-0">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0">
                <i className="fa-solid fa-lock me-2"></i>
                Finalizar Compra
              </h3>
            </div>

            <div className="card-body p-4">
              {/* Información del curso */}
              <div className="alert alert-info mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">Estás comprando:</h5>
                    <p className="mb-0">
                      Curso ID:{" "}
                      <strong>{courseInfo?.id || "No disponible"}</strong>
                    </p>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">Pago seguro con</small>
                    <div>
                      <i className="fa-brands fa-cc-stripe fs-4 text-primary"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de pago */}
              <div className="mb-3">
                <h5 className="mb-3">Información de pago</h5>
                <CheckoutForm />
              </div>

              {/* Información de seguridad */}
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex align-items-center justify-content-center text-muted small">
                  <i className="fa-solid fa-shield-alt me-2 text-success"></i>
                  <span>Pago 100% seguro y encriptado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de volver */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/allCourses")}
              className="btn btn-outline-secondary"
            >
              <i className="fa-solid fa-arrow-left me-2"></i>
              Volver a cursos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
