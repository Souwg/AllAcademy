import React from "react";
import { Link } from "react-router-dom";
import "../../styles/contactMeNavbar.css";

export const ContactMeNavbar = () => {
  return (
    <>
      <div className="contact-topbar">
        <div className="contact-topbar-inner">
          <div className="contact-topbar-row">
            {/* Teléfono */}
            <div className="contact-info-item">
              <div className="icon">
                <ion-icon name="call"></ion-icon>
              </div>

              <p className="contactNavbar">+584123633743</p>
            </div>

            {/* Correo */}
            <div className="contact-info-item">
              <div className="icon">
                <i className="fa-solid fa-envelope"></i>
              </div>

              <p className="contactNavbar">allcademy.ed@gmail.com</p>
            </div>

            {/* Horario */}
            <div className="contact-info-item contact-schedule">
              <div className="icon">
                <ion-icon name="time-outline"></ion-icon>
              </div>

              <p className="contactNavbar">Lunes a Viernes: 9:00am - 6:00pm</p>
            </div>

            {/* Redes sociales */}
            <div className="contact-socials">
              <Link
                to="/whatsapp"
                className="text-decoration-none"
                aria-label="WhatsApp"
              >
                <div className="socialMediaIcon whatsapp-hover">
                  <i className="fa-brands fa-whatsapp"></i>
                </div>
              </Link>

              <Link
                to="/instagram"
                className="text-decoration-none"
                aria-label="Instagram"
              >
                <div className="socialMediaIcon instagram-hover">
                  <i className="fa-brands fa-instagram"></i>
                </div>
              </Link>

              <Link
                to="/facebook"
                className="text-decoration-none"
                aria-label="Facebook"
              >
                <div className="socialMediaIcon facebook-hover">
                  <i className="fa-brands fa-facebook"></i>
                </div>
              </Link>

              <Link
                to="/twitter"
                className="text-decoration-none"
                aria-label="Twitter"
              >
                <div className="socialMediaIcon twitter-hover">
                  <i className="fa-brands fa-twitter"></i>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="ticker-container" style={{ cursor: "pointer" }}>
        <div className="ticker-wrapper">
          <div className="ticker-content">
            {"APRENDE A TU RITMO • CLASES EN VIVO Y CONTENIDO PRÁCTICO • EXPLORA ALLCADEMY\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0".repeat(
              5,
            )}
          </div>
          <div className="ticker-content">
            {"APRENDE A TU RITMO • CLASES EN VIVO Y CONTENIDO PRÁCTICO • EXPLORA ALLCADEMY\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0".repeat(
              5,
            )}
          </div>
        </div>
      </div>
    </>
  );
};
