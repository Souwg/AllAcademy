import React from "react";
import { Link } from "react-router-dom";
import "../../styles/skillsHome.css";
import student2 from "../../img/student2.png";
import student1 from "../../img/student1.jpg";
import student3 from "../../img/student3.jpg";

export const SkillsHome = () => {
  return (
    <>
      <div className="container-fluid skills-home-container">
        <div className="row skills-home-row align-items-center">
          {/* Columna izquierda - Imagen principal */}
          <div className="col-12 col-md-5 col-lg-4 skills-home-main-img-col">
            <img
              src={student2}
              className="img-fluid skills-home-main-img"
              alt="Student"
            />
          </div>

          {/* Columna central - Texto */}
          <div className="col-12 col-md-7 col-lg-5 skills-home-text-col">
            <div className="title-with-line">
              <h6
                className="mt-2"
                style={{
                  fontWeight: "700",
                  color: "#001933",
                  fontSize: "16px",
                }}
              >
                ABOUT US
              </h6>
              <div className="title-line"></div>
            </div>
            <h2 className="skills-home-title text-start">
              Empowering Learner for a Brighter Future
            </h2>
            <p className="skills-home-description text-start">
              Education is a vital process that fosters personal growth,
              societal development, and intellectual advancement. It equips
              individuals with the knowledge, skills, and critical thinking.
            </p>
            <div className="row justify-content-center">
              <div className="col-lg-6 col-xl-5 skills-home-button-col mb-4 position-relative">
                <button className="btn-18">
                  <span className="text-container">
                    <span className="text">Button</span>
                  </span>
                </button>
                <div className="skills-home-divider"></div>
              </div>
              <div className="col-lg-6 col-xl-5 mb-4">
                <p className="skills-home-additional-text text-muted text-start">
                  Education not only empowers people pursue their career goals
                  but also encourages them to become informed, responsible
                  citizens.
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
