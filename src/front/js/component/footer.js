import React from "react";
import logo from "../../img/logoWhite.png";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <>
      <div
        className="container-fluid"
        style={{
          background: "#2D3078",
          paddingTop: "4rem",
          maxWidth: "100vw",
          height: "auto",
          overflowX: "hidden",
        }}
      >
        <div className="container">
          <div className="row" style={{ marginBottom: "3rem" }}>
            {/* Logo */}
            <div className="col-12 col-md-3 mb-4 mb-md-0 text-center text-md-start">
              <img
                src={logo}
                alt="Logo"
                className="img-fluid"
                style={{ height: "3.5rem", marginTop: "1rem" }}
              />
              <p
                className="text-light mt-4 mb-0 me-lg-4 pe-lg-4 text-center text-md-start"
                style={{
                  fontSize: "clamp(14px, 1.8vw, 16px)",
                  lineHeight: "1.5",
                }}
              >
                We're always in search for talented and motivated people. Don't
                be shy introduce yourself!
              </p>
            </div>

            {/**********Courses**********/}
            <div className="col-6 col-md-3 pt-4">
              <h5 className="text-light mb-4">Courses</h5>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Website Development</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Digital Marketing</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Graphic Design</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Creative Writing</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Social Marketing</p>
              </Link>
            </div>

            {/**********Company**********/}
            <div className="col-6 col-md-3 pt-4">
              <h5 className="text-light mb-4">Company</h5>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- About Us</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Knowledge Base</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Program</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Community</p>
              </Link>
            </div>

            {/***********Contact Info***********/}
            <div className="col-12 col-md-3 pt-4 mt-4 mt-md-0">
              <h5 className="text-light mb-4">Contact Info</h5>
              <div className="row mb-3 align-items-center">
                <div className="col-auto pe-0 me-3 mb-3">
                  {" "}
                  {/* Añadí me-3 para margen derecho */}
                  <i
                    className="fa-solid fa-mobile-screen"
                    style={{ fontSize: "25px", color: "#fff" }}
                  ></i>
                </div>
                <div className="col ps-0 text-light">
                  <h5 className="mb-0">Phone number</h5>
                  <p>+58 4140000000</p>
                </div>
              </div>
              <div className="row align-items-center">
                <div className="col-auto pe-0 me-3 mb-3">
                  {" "}
                  {/* Añadí me-3 para margen derecho */}
                  <i
                    className="fa-solid fa-envelope"
                    style={{ fontSize: "25px", color: "#fff" }}
                  ></i>
                </div>
                <div className="col ps-0 text-light">
                  <h5 className="mb-0">Email Address</h5>
                  <p>info@allacademy.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="row pb-4">
            <div
              style={{
                height: "1px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                width: "100%",
                margin: "1rem 0",
                marginBottom: "3rem",
              }}
            ></div>

            {/* Copyright y links */}
            <div
              className="col-12 col-md-9 text-light text-center text-md-start mb-3 mb-md-0"
              style={{ fontSize: "16px", fontWeight: "600" }}
            >
              <i className="fa-regular fa-copyright"></i> 2025. All Right
              Reserved.
            </div>
            <div className="col-12 col-md-3 d-flex flex-column flex-md-row justify-content-md-between">
              <Link
                to="/"
                className="text-light text-decoration-none text-center text-md-start mb-2 mb-md-0"
              >
                <p style={{ fontSize: "16px", fontWeight: "600" }}>
                  Terms of use
                </p>
              </Link>
              <Link
                to="/"
                className="text-light text-decoration-none text-center text-md-start"
              >
                <p style={{ fontSize: "16px", fontWeight: "600" }}>
                  Privacy Policy
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
