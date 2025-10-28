// components/checkoutForm.js
import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import "../../styles/checkoutForm.css"; // 👈 hoja de estilos separada

export const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      setMessage("Stripe no está inicializado todavía...");
    } else {
      setMessage(null);
    }
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("El sistema de pago no está listo. Por favor espera.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "always",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
        } else {
          setMessage(
            "Ocurrió un error inesperado. Por favor intenta nuevamente."
          );
        }
      }
    } catch (err) {
      setMessage("Ocurrió un error inesperado al procesar el pago.");
    }

    setLoading(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="checkout-loader">
        <div className="spinner"></div>
        <p>Inicializando pago seguro...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form-container">
      <div className="payment-element-wrapper">
        <PaymentElement
          onReady={() => setPaymentElementReady(true)}
          onLoadError={() =>
            setMessage(
              "Error al cargar el formulario de pago. Recarga la página."
            )
          }
          options={{
            layout: "tabs",
            fields: {
              billingDetails: {
                name: "auto",
                email: "auto",
              },
            },
          }}
        />
      </div>

      <button
        disabled={!stripe || !elements || loading || !paymentElementReady}
        className={`checkout-button ${loading ? "loading" : ""}`}
      >
        {loading ? (
          <>
            <span className="button-spinner"></span>
            Procesando pago...
          </>
        ) : (
          <>
            <i className="fa-solid fa-lock me-2"></i>
            Pagar ahora
          </>
        )}
      </button>

      {message && (
        <div
          className={`checkout-alert ${
            message.includes("éxito") || message.includes("exitosamente")
              ? "alert-success"
              : "alert-error"
          }`}
          role="alert"
        >
          <i
            className={`fa-solid ${
              message.includes("éxito") || message.includes("exitosamente")
                ? "fa-check-circle"
                : "fa-exclamation-triangle"
            } me-2`}
          ></i>
          {message}
        </div>
      )}

      <div className="checkout-security-note">
        <i className="fa-solid fa-shield-alt me-1"></i>
        Tus datos de pago están protegidos y encriptados
      </div>
    </form>
  );
};
