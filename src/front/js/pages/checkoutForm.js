import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "../../styles/checkoutForm.css";

export const CheckoutForm = ({ onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      setMessage("Stripe is not initialized yet...");
    } else {
      setMessage(null);
    }
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("The payment system is not ready yet. Please wait.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message || "Payment failed. Please try again.");
        console.error("❌ Payment failed:", error);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded:", paymentIntent);
        if (onSuccess) onSuccess(); // 👉 avisa al padre para mostrar el modal de éxito
        if (onClose) onClose(); // 👉 cierra el modal de Stripe
      } else {
        setMessage("Payment could not be completed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error processing payment:", err);
      setMessage("An unexpected error occurred while processing the payment.");
    }

    setLoading(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="checkout-loader">
        <div className="spinner"></div>
        <p>Initializing secure payment...</p>
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
              "Error loading the payment form. Please refresh the page."
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
            Processing payment...
          </>
        ) : (
          <>
            <i className="fa-solid fa-lock me-2"></i>
            Pay now
          </>
        )}
      </button>

      {message && (
        <div className="checkout-error-message text-danger mt-3">{message}</div>
      )}

      <div className="checkout-security-note mt-3">
        <i className="fa-solid fa-shield-alt me-1"></i>
        Your payment data is protected and encrypted
      </div>
    </form>
  );
};
