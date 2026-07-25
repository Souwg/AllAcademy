import React from "react";
import { Link } from "react-router-dom";
import "../../../styles/skillsHome.css";
import student2 from "../../../img/student2.png";
import student1 from "../../../img/student1.jpg";
import student3 from "../../../img/student3.jpg";

export const SkillsHome = () => {
  return (
    <>
      <div className="container-fluid skills-home-container px-0 mx-0">
        <div className="row skills-home-row align-items-center">
          {/* Columna izquierda - Imagen principal */}
          <div className="col-12 col-md-5 col-lg-4 skills-home-main-img-col ps-0">
            <div className="skills-home-main-img-wrapper">
              <img
                src={student2}
                className="img-fluid skills-home-main-img"
                alt="Student"
              />

              {/* Tarjeta horizontal mejorada */}
              <div className="skills-home-card">
                <div className="skills-home-card-content">
                  <div className="skills-home-card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="skills-home-card-text">
                    <h5>Tu camino de aprendizaje</h5>
                    <div className="skills-home-card-status">
                      <div className="skills-home-card-dot"></div>
                      <span className="skills-home-card-status-text">
                        Avanza paso a paso
                      </span>
                    </div>
                  </div>
                </div>

                <div className="skills-home-card-progress">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E7ECF5"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2D3078"
                      strokeWidth="3"
                      strokeDasharray="65, 100"
                    />
                    <text
                      x="18"
                      y="22"
                      textAnchor="middle"
                      fill="#2D3078"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      65%
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Columna central - Texto */}
          <div className="col-12 col-md-7 col-lg-5 skills-home-text-col">
            <div className="title-with-line">
              <h6 className="mt-2 skills-home-subtitle">SOBRE NOSOTROS</h6>
              <div className="title-line"></div>
            </div>
            <h2 className="skills-home-title text-start">
              Impulsamos tu aprendizaje para abrir nuevas oportunidades
            </h2>
            <p className="skills-home-description text-start">
              Allcademy nace con la idea de hacer el aprendizaje más accesible,
              práctico y cercano para personas que quieren crecer, mejorar sus
              habilidades y prepararse para nuevas oportunidades.
            </p>
            <div className="row justify-content-center">
              <div className="col-lg-6 col-xl-5 skills-home-button-col mb-4 position-relative">
                <button className="btn-18">
                  <span className="text-container">
                    <span className="text">Conocer más</span>
                  </span>
                </button>
                <div className="skills-home-divider"></div>
              </div>
              <div className="col-lg-6 col-xl-5 mb-4">
                <p className="skills-home-additional-text text-muted text-start">
                  Creemos que aprender no tiene que ser complicado. Nuestro
                  objetivo es crear una experiencia clara, sencilla y
                  motivadora, donde cada persona pueda avanzar a su ritmo y
                  sentirse acompañada en su proceso.
                </p>
              </div>
            </div>
          </div>

          {/* Columna derecha - Imágenes adicionales */}
          <div className="col-lg-3 skills-home-secondary-col">
            <div className="skills-home-secondary-img-container">
              <img
                src={student1}
                className="img-fluid skills-home-secondary-img skills-home-secondary-img-1"
                alt="Student"
              />
              <img
                src={student3}
                className="img-fluid skills-home-secondary-img skills-home-secondary-img-2"
                alt="Student"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
