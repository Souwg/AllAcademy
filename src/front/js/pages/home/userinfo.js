import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const UserInfo = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUserData(user);
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${process.env.BACKEND_URL}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cerrar sesión");
      }

      // Limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");

      // Redirigir al login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Asegurarse de limpiar el localStorage incluso si hay error en el servidor
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      navigate("/login");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="mb-4">Has iniciado sesión</h2>

          {userData && (
            <div className="mb-4">
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
              <p>
                <strong>Nombre:</strong> {userData.first_name}{" "}
                {userData.last_name}
              </p>
              <p>
                <strong>Rol:</strong>{" "}
                {userData.is_admin ? "Administrador" : "Usuario"}
              </p>
            </div>
          )}

          <button onClick={handleLogout} className="btn btn-danger px-4 py-2">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
