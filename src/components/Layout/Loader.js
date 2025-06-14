import React from "react";
import "../../assets/css/Loader.css"; // Importation du fichier CSS pour le style du loader

const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
