// components/PaymentSuccess.js
import React from "react";
import { useSearchParams } from "react-router-dom";
export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const status = searchParams.get("redirect_status");

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <h1>Pago completado</h1>
        <p>¡Gracias por tu compra!</p>

        {paymentIntent && (
          <p>
            ID de transacción: <strong>{paymentIntent}</strong>
          </p>
        )}

        <p>
          Estado: <strong>{status}</strong>
        </p>

        <a href="/" className="success-link">
          Volver al inicio
        </a>
      </div>
    </div>
  );
};
