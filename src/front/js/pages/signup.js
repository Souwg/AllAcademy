import React from "react";
import man from "../../img/man.png";
import "../../styles/signup.css";
import { Link } from "react-router-dom";

export const Signup = () => {
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
                  or sign up with email
                </p>
              </div>

              <form>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        placeholder="John"
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
                        placeholder="Doe"
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
                    placeholder="name@example.com"
                  />
                  <label htmlFor="email">Email address</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                  />
                  <label htmlFor="password">Password</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                </div>

                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms"
                    required
                  />
                  <label className="form-check-label small" htmlFor="terms">
                    I agree to the{" "}
                    <a href="#!" className="text-decoration-none">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#!" className="text-decoration-none">
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
              right: "0",
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
