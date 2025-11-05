// components/StripeModal.js
import React from "react";
import ReactDOM from "react-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "./checkoutForm";
import "../../styles/stripeModal.css";

const stripePromise = loadStripe(
  "pk_test_51SEDdyLxJdjDhzqNZoyoCG0PYioqRVmaTIK5LRUAsk0GfhxzYKxKnFx4Zt9lj8J0NYoe7Yzq6ZbO6zX6PDl6cX6200USUJHrBN"
);

export const StripeModal = ({ show, onClose, clientSecret, onSuccess }) => {
  if (!show) return null;

  const modal = (
    <div className="stripe-overlay">
      <div className="stripe-modal">
        <div className="stripe-header">
          <h5>
            <i className="fa-brands fa-stripe"></i> Complete your payment
          </h5>
          <button className="stripe-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="stripe-body">
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              {/* ✅ Pasamos onSuccess */}
              <CheckoutForm onClose={onClose} onSuccess={onSuccess} />
            </Elements>
          ) : (
            <p className="stripe-loading">Loading payment form...</p>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};
