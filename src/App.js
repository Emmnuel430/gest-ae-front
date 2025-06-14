import React from "react"; // Importation de React pour pouvoir utiliser JSX et les fonctionnalités de React.
import "./App.css"; // Importation du fichier CSS pour styliser le composant App.
import AppRoutes from "./routes"; // Importation du composant AppRoutes, qui contient les routes de l'application.

const App = () => {
  // Définition du composant fonctionnel App.
  return (
    // Rendu du JSX pour le composant App.
    <div className="App">
      {/* Conteneur principal du composant avec une classe CSS 'App' appliquée. */}
      <AppRoutes />{" "}
      {/* Insertion du composant AppRoutes, qui gère la navigation de l'application. */}
    </div>
  );
};

export default App; // Exportation du composant App pour qu'il soit utilisable dans d'autres fichiers.
