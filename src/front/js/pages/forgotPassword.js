import React, { useContext, useState } from "react";
import man from "../../img/man.png";
import "../../styles/login.css";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

export const ForgotPassword = () => {
  const { actions } = useContext(Context);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setIsLoading(true);

    const result = await actions.requestPasswordReset(email);

    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-xxl-2 d-none d-xxl-block"></div>

        <div className="col-xxl-8 col-12 d-flex align-items-center justify-content-center py-4">
          <div className="card login-card shadow-lg border-0 w-100 my-4">
            <div className="card-body px-3 px-md-5 py-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-3">Recuperar contraseña</h3>
                <p className="text-muted">
                  Ingresa tu correo y te enviaremos un enlace para crear una
                  nueva contraseña.
                </p>
              </div>

              {message && (
                <div className="alert alert-success" role="alert">
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="email">Email</label>
                </div>

                <button
                  className="btn btn-primary w-100 py-2 mb-3 rounded-pill fw-bold"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace"
                  )}
                </button>

                <p className="text-center text-muted mb-0">
                  ¿Recordaste tu contraseña?{" "}
                  <Link to="/login" className="text-decoration-none fw-bold">
                    Iniciar sesión
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="col-xxl-2 d-none d-xxl-flex align-items-center position-relative">
          <img
            src={man}
            alt="Man"
            className="position-absolute h-100 w-auto"
            style={{
              right: "80px",
              bottom: "0",
              objectFit: "contain",
              objectPosition: "right bottom",
            }}
          />
        </div>
      </div>
    </div>
  );
};
