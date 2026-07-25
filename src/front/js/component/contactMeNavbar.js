import React from "react";
import { Link } from "react-router-dom";
import "../../styles/contactMeNavbar.css";

export const ContactMeNavbar = () => {
  return (
    <>
      <div
        className="container-fluid pb-2"
        style={{ backgroundColor: "#2D3078" }}
      >
        <div className="container-fluid text-center">
          <div className="row">
            <div className="col d-flex mt-3">
              <div className="icon">
                <ion-icon name="call"></ion-icon>
              </div>
              <p className="contactNavbar ms-2 mt-1">+584123633743</p>
            </div>
            <div className="col d-flex mt-3">
              <div className="icon me-1">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <p className="contactNavbar ms-2 mt-1">allcademy.ed@gmail.com</p>
            </div>
            <div className="col-auto d-flex mt-3">
              <div className="icon">
                <ion-icon name="time-outline"></ion-icon>
              </div>
              <p className="contactNavbar ms-2 mt-1">
                Lunes a Viernes: 9:00am - 6:00pm
              </p>
            </div>
            <div className="col d-flex justify-content-end gap-4 mt-3">
              {/* WhatsApp */}
              <Link to="/whatsapp" className="text-decoration-none">
                <div className="socialMediaIcon d-flex align-items-center justify-content-center rounded-circle border p-2 whatsapp-hover">
                  <i className="fa-brands fa-whatsapp"></i>
                </div>
              </Link>

              {/* Instagram */}
              <Link to="/instagram" className="text-decoration-none">
                <div className="socialMediaIcon d-flex align-items-center justify-content-center rounded-circle border p-2 instagram-hover">
                  <i className="fa-brands fa-instagram"></i>
                </div>
              </Link>

              {/* Facebook */}
              <Link to="/facebook" className="text-decoration-none">
                <div className="socialMediaIcon d-flex align-items-center justify-content-center rounded-circle border p-2 facebook-hover">
                  <i className="fa-brands fa-facebook"></i>
                </div>
              </Link>

              {/* Twitter */}
              <Link to="/twitter" className="text-decoration-none">
                <div className="socialMediaIcon d-flex align-items-center justify-content-center rounded-circle border p-2  twitter-hover">
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
