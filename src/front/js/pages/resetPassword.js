import React, { useContext, useState } from "react";
import man from "../../img/man.png";
import "../../styles/login.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Context } from "../store/appContext";

export const ResetPassword = () => {
  const { actions } = useContext(Context);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("El enlace no es válido. Solicita uno nuevo.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    const result = await actions.resetPassword(
      token,
      formData.newPassword,
      formData.confirmPassword,
    );

    if (result.success) {
      setMessage(result.message);
      setPasswordUpdated(true);

      setTimeout(() => {
        navigate("/login");
      }, 1800);
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
                <h3 className="fw-bold mb-3">Crear nueva contraseña</h3>
                <p className="text-muted">
                  Ingresa una contraseña nueva para recuperar el acceso a tu
                  cuenta.
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

              {!token ? (
                <div className="text-center">
                  <p className="text-muted">
                    Este enlace no contiene un token válido.
                  </p>
                  <Link
                    to="/forgot-password"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Solicitar nuevo enlace
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      placeholder="Nueva contraseña"
                      value={formData.newPassword}
                      onChange={handleChange}
                      disabled={passwordUpdated}
                      required
                    />
                    <label htmlFor="newPassword">Nueva contraseña</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirmar contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={passwordUpdated}
                      required
                    />
                    <label htmlFor="confirmPassword">
                      Confirmar contraseña
                    </label>
                  </div>

                  <button
                    className="btn btn-primary w-100 py-2 mb-3 rounded-pill fw-bold"
                    type="submit"
                    disabled={isLoading || passwordUpdated}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Guardando...
                      </>
                    ) : (
                      "Actualizar contraseña"
                    )}
                  </button>

                  <p className="text-center text-muted mb-0">
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Volver al login
                    </Link>
                  </p>
                </form>
              )}
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
