import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import { PaymentSuccessModal } from "../../component/payments/paymentSucessModal";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { actions } = useContext(Context);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const methodParam = searchParams.get("method") || "stripe";
    setMethod(methodParam);

    if (methodParam === "paypal") {
      const orderId = searchParams.get("token");
      if (!orderId) {
        setStatus("error");
        setMessage("No se encontró el token de PayPal.");
        return;
      }

      (async () => {
        const resp = await actions.capturePaypalOrder(orderId);
        if (resp?.error) {
          setStatus("error");
          setMessage("Error confirmando el pago con PayPal.");
        } else {
          setStatus("success");
          setMessage("Pago completado con éxito mediante PayPal.");
          setShowModal(true); // 🎯 Muestra el modal
        }
      })();
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-2">Confirmando tu pago...</p>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <PaymentSuccessModal
          method={method}
          message={message}
          onClose={() => navigate("/dashboard")}
        />
      )}
    </>
  );
};
