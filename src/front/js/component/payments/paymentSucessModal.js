import React from "react";
import "../../../styles/paymentSucessModal.css";

export const PaymentSuccessModal = ({ method, message, onClose }) => {
  return (
    <div className="success-modal-overlay">
      <div className="success-modal-content shadow-lg animate-pop">
        {/* ✅ Icon */}
        <div className="success-modal-icon">
          <i className="fa-solid fa-circle-check text-success fa-3x"></i>
        </div>

        {/* 🎉 Título */}
        <h4 className="fw-bold text-dark mt-3 mb-2">Payment Successful!</h4>
        <p className="text-muted mb-3">{message}</p>

        {/* 💳 Método de pago */}
        {method && (
          <div className="success-method-pill">
            <i
              className={`fa-brands ${
                method === "paypal" ? "fa-paypal" : "fa-stripe"
              } me-2`}
            ></i>
            {method.charAt(0).toUpperCase() + method.slice(1)}
          </div>
        )}

        {/* 🎯 Botones */}
        <div className="d-flex flex-column gap-2 mt-4 w-100">
          <button className="btn btn-success rounded-pill" onClick={onClose}>
            <i className="fa-solid fa-check me-2"></i>
            Continue
          </button>
          <button
            className="btn btn-outline-secondary rounded-pill"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <i className="fa-solid fa-user me-2"></i>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
