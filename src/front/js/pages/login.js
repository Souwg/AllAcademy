import React, { useState, useEffect, useRef } from "react";
import man from "../../img/man.png";
import "../../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const isMounted = useRef(true);
  const API_BASE = process.env.BACKEND_URL;

  useEffect(() => {
    isMounted.current = true;

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      navigate(`/${user.role}/dashboard`);
      return;
    }

    const savedCredentials = localStorage.getItem("rememberMeCredentials");
    if (savedCredentials) {
      try {
        const { email, password } = JSON.parse(savedCredentials);
        if (isMounted.current) {
          setFormData((prev) => ({
            ...prev,
            email,
            password,
            rememberMe: true,
          }));
        }
      } catch (e) {
        console.error("Error parsing credentials", e);
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const showBlockedAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Cuenta Bloqueada",
      text: message,
      confirmButtonText: "Entendido",
      confirmButtonColor: "#dc3545",
      background: "#fff",
      customClass: {
        popup: "border-radius-20",
        confirmButton: "btn-sweet-alert",
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isMounted.current) setError("");
    if (isMounted.current) setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          showBlockedAlert(data.msg);
          throw new Error(data.msg);
        }
        throw new Error(data.msg || "Error al iniciar sesión");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (formData.rememberMe) {
        localStorage.setItem(
          "rememberMeCredentials",
          JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        );
      } else {
        localStorage.removeItem("rememberMeCredentials");
      }

      navigate(`/${data.user.role}/dashboard`);
    } catch (error) {
      console.error("Error durante el proceso de login:", error);
      if (isMounted.current && !error.message.includes("bloqueada")) {
        setError(error.message);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  if (isLoggedIn) {
    return (
      <div className="container-fluid min-vh-100 d-flex flex-column">
        <div className="row flex-grow-1">
          <div className="col-xxl-2 d-none d-xxl-block"></div>
          <div className="col-xxl-8 col-12 d-flex align-items-center justify-content-center py-4">
            <div className="card login-card shadow-lg border-0 w-100 my-4">
              <div className="card-body px-3 px-md-5 py-4 text-center">
                <h2 className="fw-bold mb-3">Ya hay una sesión activa</h2>
                <p className="text-muted">
                  Serás redirigido automáticamente a tu dashboard
                </p>
                <div className="spinner-border text-primary mt-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
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
  }

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-xxl-2 d-none d-xxl-block"></div>
        <div className="col-xxl-8 col-12 d-flex align-items-center justify-content-center py-4">
          <div className="card login-card shadow-lg border-0 w-100 my-4">
            <div className="card-body px-3 px-md-5 py-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-3">Bienvenido de nuevo</h3>
                <p className="text-muted">
                  Inicia sesión en tu cuenta para continuar
                </p>
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="email">Email</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="password">Contraseña</label>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                  <div className="form-check mb-2 mb-md-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor="rememberMe"
                    >
                      Recordarme
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="small text-nowrap text-decoration-none"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
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
                      Signing in...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </button>

                <p className="text-center text-muted mb-0">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/signup" className="text-decoration-none fw-bold">
                    Registrarme
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
