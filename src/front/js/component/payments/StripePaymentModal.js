import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "./checkoutForm";
import "../../../styles/stripePaymentModal.css";

const stripePromise = loadStripe(
  "pk_test_51SEDdyLxJdjDhzqNZoyoCG0PYioqRVmaTIK5LRUAsk0GfhxzYKxKnFx4Zt9lj8J0NYoe7Yzq6ZbO6zX6PDl6cX6200USUJHrBN"
);

export const StripePaymentModal = ({
  clientSecret,
  onClose,
  setShowSuccessModal,
  setPaymentMessage,
  setPaymentMethod,
}) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (clientSecret) setReady(true);
  }, [clientSecret]);

  if (!ready) return null;

  return (
    <div className="stripe-modal-overlay">
      <div className="stripe-modal-content shadow-lg">
        {/* Header */}
        <div className="stripe-modal-header">
          <h5>
            <i className="fa-solid fa-credit-card me-2 text-primary"></i>
            Secure Payment
          </h5>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Stripe Form */}
        <div className="stripe-modal-body">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                labels: "floating",
              },
            }}
          >
            <CheckoutForm
              setShowSuccessModal={setShowSuccessModal}
              setPaymentMessage={setPaymentMessage}
              setPaymentMethod={setPaymentMethod}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};
