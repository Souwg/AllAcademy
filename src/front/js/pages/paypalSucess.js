// pages/PayPalSuccess.jsx
import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const PayPalSuccess = () => {
  const [searchParams] = useSearchParams();
  const { actions } = useContext(Context);
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, msg: "", ok: false });

  useEffect(() => {
    const doCapture = async () => {
      const orderId = searchParams.get("token"); // PayPal envía token = orderId
      if (!orderId) {
        setState({ loading: false, msg: "Falta token de PayPal", ok: false });
        return;
      }
      const resp = await actions.capturePaypalOrder(orderId);
      if (resp?.error) {
        setState({
          loading: false,
          msg: "Error capturando el pago",
          ok: false,
        });
      } else {
        setState({
          loading: false,
          msg: "Pago completado con éxito",
          ok: true,
        });
      }
    };
    doCapture();
  }, []);

  if (state.loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status" />
        <p className="mt-2">Confirmando tu pago con PayPal...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 text-center">
      {state.ok ? (
        <div className="alert alert-success">
          <i className="fa-solid fa-circle-check me-2"></i>
          {state.msg}
        </div>
      ) : (
        <div className="alert alert-danger">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {state.msg}
        </div>
      )}
      <button
        className="btn btn-primary mt-3"
        onClick={() => navigate("/dashboard")}
      >
        Ir a mi dashboard
      </button>
    </div>
  );
};
