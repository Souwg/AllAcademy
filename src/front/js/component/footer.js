import React from "react";
import logo from "../../img/logoWhite.png";
import { Link } from "react-router-dom";
import "../../styles/footer.css";

export const Footer = () => {
  return (
    <footer className="allcademy-footer">
      <div className="container">
        {/* Contenido completo: solo tablet y escritorio */}
        <div className="row footer-desktop-content">
          {/* Logo y descripción */}
          <div className="col-12 col-md-3 mb-4 mb-md-0 text-center text-md-start">
            <img src={logo} alt="Allcademy" className="footer-logo" />

            <p className="footer-description">
              Allcademy es una plataforma creada para acercar el aprendizaje a
              más personas, con contenidos claros, prácticos y pensados para
              avanzar paso a paso.
            </p>
          </div>

          {/* Contenido */}
          <div className="col-6 col-md-3 pt-4">
            <h5 className="text-light mb-4">Contenido</h5>

            <Link to="/" className="footer-link">
              Cursos disponibles
            </Link>

            <Link to="/" className="footer-link">
              Clases en vivo
            </Link>

            <Link to="/" className="footer-link">
              Próximamente
            </Link>

            <Link to="/" className="footer-link">
              Recursos de aprendizaje
            </Link>
          </div>

          {/* Allcademy */}
          <div className="col-6 col-md-3 pt-4">
            <h5 className="text-light mb-4">Allcademy</h5>

            <Link to="/" className="footer-link">
              Sobre nosotros
            </Link>

            <Link to="/" className="footer-link">
              Nuestra misión
            </Link>

            <Link to="/" className="footer-link">
              Comunidad
            </Link>

            <Link to="/" className="footer-link">
              Contacto
            </Link>
          </div>

          {/* Contacto */}
          <div className="col-12 col-md-3 pt-4 mt-4 mt-md-0">
            <h5 className="text-light mb-4">Contacto</h5>

            <div className="footer-contact">
              <i className="fa-solid fa-mobile-screen"></i>

              <div>
                <h5 className="mb-0">Teléfono</h5>
                <p className="mb-0">+584123633743</p>
              </div>
            </div>
          </div>
        </div>

        {/* En móvil solo se muestra este logo compacto */}
        <div className="footer-mobile-logo">
          <img src={logo} alt="Allcademy" className="footer-logo" />
        </div>

        <div className="footer-divider"></div>

        {/* Parte inferior */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            <i className="fa-regular fa-copyright"></i>{" "}
            {new Date().getFullYear()} Allcademy. Todos los derechos reservados.
          </p>

          <div className="footer-legal-links">
            <Link to="/">Términos y condiciones</Link>
            <Link to="/">Política de privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
