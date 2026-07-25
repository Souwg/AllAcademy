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
                Allcademy es una plataforma creada para acercar el aprendizaje a
                más personas, con contenidos claros, prácticos y pensados para
                avanzar paso a paso.
              </p>
            </div>

            {/**********Courses**********/}
            <div className="col-6 col-md-3 pt-4">
              <h5 className="text-light mb-4">Contenido</h5>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Cursos disponibles</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Clases en vivo</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Próximamente</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Recursos de aprendizaje</p>
              </Link>
            </div>

            {/**********Company**********/}
            <div className="col-6 col-md-3 pt-4">
              <h5 className="text-light mb-4">Allcademy</h5>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Sobre nosotros</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Nuestra misión</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Comunidad</p>
              </Link>
              <Link to="/" className="text-light text-decoration-none d-block">
                <p className="mb-3">- Contacto</p>
              </Link>
            </div>

            {/***********Contact Info***********/}
            <div className="col-12 col-md-3 pt-4 mt-4 mt-md-0">
              <h5 className="text-light mb-4">Contacto</h5>
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
                  <h5 className="mb-0">Teléfono</h5>
                  <p>+584123633743</p>
                </div>
              </div>
              <div className="row align-items-center">
                <div className="col-auto pe-0 me-3 mb-3">
                  {" "}
                  {/* Añadí me-3 para margen derecho */}
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
              <i className="fa-regular fa-copyright"></i> 2025 Allcademy. Todos
              los derechos reservados.
            </div>
            <div className="col-12 col-md-3 d-flex flex-column flex-md-row justify-content-md-between">
              <Link
                to="/"
                className="text-light text-decoration-none text-center text-md-start mb-2 mb-md-0"
              >
                <p style={{ fontSize: "16px", fontWeight: "600" }}>
                  Términos y condiciones
                </p>
              </Link>
              <Link
                to="/"
                className="text-light text-decoration-none text-center text-md-start"
              >
                <p style={{ fontSize: "16px", fontWeight: "600" }}>
                  Política de privacidad
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
