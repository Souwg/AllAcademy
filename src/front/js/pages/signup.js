import React, { useState } from "react";
import man from "../../img/man.png";
import "../../styles/signup.css";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "The passwords you entered do not match",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!formData.acceptTerms) {
      Swal.fire({
        icon: "error",
        title: "Terms Not Accepted",
        text: "You must accept the terms and conditions to continue",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          accept_terms: formData.acceptTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Error en el registro");
        return;
      }

      // Registro exitoso
      console.log("Usuario registrado:", data.user);
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Registration successful",
        showConfirmButton: false,
        timer: 1500,
        backdrop: true,
      });
      navigate("/login"); // Redirige al login después del registro
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "There was a problem connecting to the server. Please try again later.",
        confirmButtonColor: "#3085d6",
      });
      console.error("Error:", err);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-xxl-2 d-none d-xxl-block"></div>

        <div className="col-xxl-8 col-12 d-flex align-items-center justify-content-center py-4">
          <div className="card signup-card shadow-lg border-0 w-100 my-4">
            <div className="card-body px-3 px-md-5 py-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-3">Create your account</h2>
                <p className="text-muted">Start your learning journey today</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="firstName">First Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="lastName">Last Name</label>
                    </div>
                  </div>
                </div>

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
                    minLength="6"
                  />
                  <label htmlFor="password">Password</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                </div>

                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                  />
                  <label className="form-check-label small" htmlFor="terms">
                    I agree to the{" "}
                    <a
                      href="#!"
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        Swal.fire({
                          title: "Terms and Conditions",
                          html: `<div style="text-align: left; max-height: 400px; overflow-y: auto;">
        <p>...</p>
        <!-- Más contenido -->
      </div>`,
                          showCloseButton: true,
                          confirmButtonText: "I Understand",
                          width: "800px",
                        });
                      }}
                    >
                      Terms and conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="#!"
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        Swal.fire({
                          title: "Privacy Policy",
                          html: `<div style="text-align: left; max-height: 400px; overflow-y: auto;">
        <p>Here goes your privacy policy...</p>
        <!-- Más contenido -->
      </div>`,
                          showCloseButton: true,
                          confirmButtonText: "I Understand",
                          width: "800px",
                        });
                      }}
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  className="btn btn-primary w-100 py-2 mb-3 rounded-pill fw-bold"
                  type="submit"
                >
                  Create Account
                </button>

                <p className="text-center text-muted mb-0">
                  Already have an account?{" "}
                  <Link to="/login" className="text-decoration-none fw-bold">
                    Sign in
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
