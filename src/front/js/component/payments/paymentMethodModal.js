import React from "react";
import "../../../styles/paymentMethodModal.css";

export const PaymentMethodModal = ({
  onClose,
  onSelectStripe,
  onSelectPayPal,
  onSelectPagoMovil,
}) => {
  return (
    <div className="payment-method-modal-overlay-modern">
      <div className="payment-method-modal-modern p-4 shadow-lg">
        {/* 🪙 Header */}
        <div className="payment-method-header-modern text-center mb-4">
          <i className="fa-solid fa-wallet fa-2x text-success mb-2"></i>
          <h5 className="text-primary">Select your payment method</h5>
          <p className="text-muted small mt-1">
            Choose how you want to securely make your payment
          </p>
        </div>

        {/* 🔘 Opciones */}
        <div className="d-grid gap-3">
          <button
            className="payment-method-option-modern stripe"
            onClick={onSelectStripe}
          >
            <i className="fa-brands fa-stripe"></i>
            <span>Pay with Stripe</span>
          </button>

          <button
            className="payment-method-option-modern paypal"
            onClick={onSelectPayPal}
          >
            <i className="fa-brands fa-paypal"></i>
            <span>Pay with PayPal</span>
          </button>

          <button
            className="payment-method-option-modern pagomovil"
            onClick={onSelectPagoMovil}
          >
            <i className="fa-solid fa-mobile-screen-button"></i>
            <span>Pagar con Pago Móvil</span>
          </button>

          <button
            className="payment-method-option-modern cancel"
            onClick={onClose}
          >
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
