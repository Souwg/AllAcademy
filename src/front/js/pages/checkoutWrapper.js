// components/CheckoutWrapper.js
import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutPage } from "../pages/checkoutPage"; // Ajusta la ruta según tu estructura

const stripePromise = loadStripe(
  "pk_test_51SEDdyLxJdjDhzqNZoyoCG0PYioqRVmaTIK5LRUAsk0GfhxzYKxKnFx4Zt9lj8J0NYoe7Yzq6ZbO6zX6PDl6cX6200USUJHrBN"
);

export const CheckoutWrapper = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const secret = localStorage.getItem("clientSecret");
    console.log("🔍 CheckoutWrapper - ClientSecret del localStorage:", secret);

    if (secret) {
      setClientSecret(secret);
    } else {
      setError(
        "No se encontró información de pago válida. Por favor, inicia el proceso de compra nuevamente."
      );
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando formulario de pago...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">
          <h4>Error en el proceso de pago</h4>
          <p>{error}</p>
          <a href="/allCourses" className="btn btn-primary">
            Volver a cursos
          </a>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h4>Información de pago no disponible</h4>
          <p>Por favor, regresa al curso y haz clic en "Comprar" nuevamente.</p>
          <a href="/allCourses" className="btn btn-primary">
            Volver a cursos
          </a>
        </div>
      </div>
    );
  }

  console.log("✅ CheckoutWrapper - Renderizando Elements con clientSecret");

  return clientSecret ? (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe" },
      }}
    >
      <CheckoutPage />
    </Elements>
  ) : (
    <div className="container py-5 text-center">
      <div className="alert alert-warning">
        <h4>Información de pago no disponible</h4>
        <p>Por favor, regresa al curso y haz clic en "Comprar" nuevamente.</p>
        <a href="/allCourses" className="btn btn-primary">
          Volver a cursos
        </a>
      </div>
    </div>
  );
};
