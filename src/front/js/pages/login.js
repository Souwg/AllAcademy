import React, { useState, useEffect } from "react";
import man from "../../img/man.png";
import "../../styles/Login.css";
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

  // Verificar si hay una sesión activa al montar el componente
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user && isMounted) {
      navigate(`/${user.role}/dashboard`);
      return;
    }

    const savedCredentials = localStorage.getItem("rememberMeCredentials");
    if (savedCredentials && isMounted) {
      try {
        const { email, password } = JSON.parse(savedCredentials);
        setFormData((prev) => ({
          ...prev,
          email,
          password,
          rememberMe: true,
        }));
      } catch (e) {
        console.error("Error parsing credentials", e);
      }
    }

    return () => {
      isMounted = false;
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
    console.log("[Login] Inicio del proceso de login");
    setError("");
    setIsLoading(true);

    try {
      console.log("[Login] Enviando credenciales al servidor...", {
        email: formData.email,
        rememberMe: formData.rememberMe,
      });

      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log("[Login] Respuesta recibida del servidor", {
        status: response.status,
        ok: response.ok,
      });

      const data = await response.json();
      console.log("[Login] Datos de respuesta:", data);

      if (!response.ok) {
        // Manejar específicamente el error de usuario bloqueado
        if (response.status === 403) {
          const errorMessage = console.log(
            "[Login] Usuario bloqueado:",
            data.msg
          );
          showBlockedAlert(errorMessage);
          throw new Error(errorMessage);
        }
        console.error("[Login] Error en la respuesta del servidor:", data.msg);
        throw new Error(data.msg || "Error al iniciar sesión");
      }

      console.log("[Login] Guardando token y datos de usuario en localStorage");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (formData.rememberMe) {
        console.log("[Login] Guardando credenciales por 'Remember Me'");
        localStorage.setItem(
          "rememberMeCredentials",
          JSON.stringify({
            email: formData.email,
            password: formData.password,
          })
        );
      } else {
        console.log("[Login] Eliminando credenciales de 'Remember Me'");
        localStorage.removeItem("rememberMeCredentials");
      }

      console.log(`[Login] Redirigiendo a dashboard de ${data.user.role}`);
      navigate(`/${data.user.role}/dashboard`);
    } catch (error) {
      console.error("[Login] Error durante el proceso:", {
        message: error.message,
        error: error,
      });
      // Solo mostrar error en el formulario si no es un error de bloqueo
      if (!error.message.includes("bloqueada")) {
        setError(error.message);
      }
    } finally {
      console.log("[Login] Finalizando estado de carga");
      setIsLoading(false);
      console.log("[Login] Proceso de login completado");
    }
  };

  // Si ya hay una sesión activa, mostrar mensaje en lugar del formulario
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

  // Mostrar el formulario de login si no hay sesión activa
  return (
    <div className="container-fluid min-vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-xxl-2 d-none d-xxl-block"></div>

        <div className="col-xxl-8 col-12 d-flex align-items-center justify-content-center py-4">
          <div className="card login-card shadow-lg border-0 w-100 my-4">
            <div className="card-body px-3 px-md-5 py-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-3">Welcome back</h2>
                <p className="text-muted">
                  Sign in to your account to continue
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="d-flex justify-content-center gap-2 mb-4">
                <button className="btn btn-social btn-google">
                  <i className="fab fa-google"></i>
                </button>
                <button className="btn btn-social btn-facebook">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="btn btn-social btn-apple">
                  <i className="fab fa-apple"></i>
                </button>
              </div>

              <div className="divider d-flex align-items-center my-4">
                <p className="text-center text-muted mx-3 mb-0">
                  or sign in with email
                </p>
              </div>

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
                  <label htmlFor="email">Email address</label>
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
                  <label htmlFor="password">Password</label>
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
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="small text-nowrap text-decoration-none"
                  >
                    Forgot password?
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
                    "Sign In"
                  )}
                </button>

                <p className="text-center text-muted mb-0">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-decoration-none fw-bold">
                    Sign up
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
