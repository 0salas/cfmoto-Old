/* global google */
import React, { useEffect, useContext } from "react";
import { LoginContext } from "../../LoginContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { setUser } = useContext(LoginContext);
  const navigate = useNavigate();

  function handleCallbackResponse(response) {
    const userObject = JSON.parse(atob(response.credential.split(".")[1])); // Decode JWT
    setUser(userObject);
    navigate("/"); // Redirect to the main app
  }

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: "470191599805-hs5li8tsj72nmmru2q830mo9s7gh77ob.apps.googleusercontent.com",
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    );
  }, []);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column", // To stack the image and text vertically
      }}
    >
      <div>
        {/* Add your image */}
        <img
          src="/logodoble.png"
          alt="Moto Logo"
          style={{ width: "400px", marginBottom: "20px" }}
        />
        <h2>Bienvenido al cotizador de Motos CF por favor inicia sesión</h2>
        <div id="signInDiv"></div>
      </div>
    </div>
  );
  
};

export default Login;
