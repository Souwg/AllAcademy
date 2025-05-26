import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";

export const ContactMeNavbar = () => {
  return (
    <>
      <div
        className="container-fluid pb-2"
        style={{ backgroundColor: "#2D3078" }}
      >
        <div className="container text-center">
          <div className="row">
            <div className="col d-flex mt-3">
              <div className="icon">
                <ion-icon name="call"></ion-icon>
              </div>
              <p className="contactNavbar ms-2 mt-1">+58 4140000000</p>
            </div>
            <div className="col d-flex mt-3">
              <div className="icon me-1">
                <i class="fa-solid fa-envelope"></i>
              </div>
              <p className="contactNavbar ms-2 mt-1">info@allacademy.com</p>
            </div>
            <div className="col-auto d-flex mt-3">
              <div className="icon">
                <ion-icon name="time-outline"></ion-icon>
              </div>
              <p className="contactNavbar ms-2 mt-1">
                Mon to sat Open: 9am - 6pm
              </p>
            </div>
            <div className="col d-flex justify-content-end gap-3 mt-3">
              {/* WhatsApp */}
              <Link to="/whatsapp" className="text-decoration-none">
                <div className="socialMediaIcon d-flex align-items-center justify-content-center rounded-circle border p-2 whatsapp-hover">
                  <ion-icon name="logo-whatsapp"></ion-icon>
                </div>
              </Link>

              {/* Instagram */}
              <Link to="/instagram" className="text-decoration-none">
                <div className="socialMediaIcon d-flex align-items-center justify-content-center rounded-circle border p-2 instagram-hover">
                  <ion-icon name="logo-instagram" className="icon"></ion-icon>
                </div>
              </Link>

              {/* Facebook */}
              <Link to="/facebook" className="text-decoration-none">
                <div className="socialMediaIcon d-flex align-items-center justify-content-center rounded-circle border p-2 facebook-hover">
                  <ion-icon name="logo-facebook" className="icon"></ion-icon>
                </div>
              </Link>

              {/* Twitter */}
              <Link to="/twitter" className="text-decoration-none">
                <div className="socialMediaIcon d-flex align-items-center justify-content-center rounded-circle border p-2  twitter-hover">
                  <ion-icon name="logo-twitter" className="icon"></ion-icon>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
