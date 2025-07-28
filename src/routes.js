// Importation des dépendances React et des composants nécessaires de React Router
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Importation des pages et composants utilisés dans les routes
import Login from "./pages/Login";
import Home from "./pages/Home";
import Logs from "./pages/Logs";
import Global from "./pages/Global";
import Protected from "./components/Protected";
import AccessDenied from "./components/AccessDenied";
import Register from "./pages/users/Register";
import UserList from "./pages/users/UserList";
import UserUpdate from "./pages/users/UserUpdate";
import MoniteurList from "./pages/moniteurs/MoniteurList";
import AddMoniteur from "./pages/moniteurs/AddMoniteur";
import MoniteurUpdate from "./pages/moniteurs/MoniteurUpdate";
import Moniteur from "./pages/moniteurs/Moniteur";
import EtudiantUpdate from "./pages/etudiants/EtudiantUpdate";
import EtudiantList from "./pages/etudiants/EtudiantList";
import AddEtudiant from "./pages/etudiants/AddEtudiant";
import Etudiant from "./pages/etudiants/Etudiant";
import Resultats from "./pages/resultats/ResultatsList";
import AddResultat from "./pages/resultats/AddResultat";
import RappelList from "./pages/rappels/RappelList";
import AddRappel from "./pages/rappels/AddRappel";
import RappelsComplets from "./pages/rappels/RappelsComplets"; // Importation du composant RappelsComplets.
import ProgrammationList from "./pages/programmation/ProgrammationList";
import AddProgrammation from "./pages/programmation/AddProgrammation";
import Recap from "./pages/programmation/Recap";

import ScrollToTop from "./components/ScrollToTop";
import Parametres from "./pages/Parametres";

// Définition du composant AppRoutes qui va gérer les routes de l'application
const AppRoutes = () => {
  return (
    // Utilisation de BrowserRouter pour permettre la navigation côté client
    <BrowserRouter>
      <ScrollToTop />
      {/* Définition des différentes routes et des composants associés */}
      <Routes>
        {/* Route pour la page d'accueil qui renvoie vers la page de connexion */}
        <Route path="/" element={<Login />} />

        {/* Routes protégées (requièrent un utilisateur connecté) */}
        <Route path="/home" element={<Protected Cmp={Home} />} />
        {/* ------------------ */}
        <Route path="/etudiants" element={<Protected Cmp={EtudiantList} />} />
        <Route path="/add/etudiant" element={<Protected Cmp={AddEtudiant} />} />
        <Route path="/etudiant/:id" element={<Protected Cmp={Etudiant} />} />
        <Route
          path="/update/etudiant/:id"
          element={<Protected Cmp={EtudiantUpdate} />}
        />
        {/* ------------------ */}
        <Route path="/resultats" element={<Protected Cmp={Resultats} />} />
        <Route path="add/resultat" element={<Protected Cmp={AddResultat} />} />
        {/* ------------------ */}
        <Route
          path="/programmations"
          element={<Protected Cmp={ProgrammationList} />}
        />
        <Route path="/recap" element={<Protected Cmp={Recap} />} />
        <Route
          path="add/programmation"
          element={<Protected Cmp={AddProgrammation} />}
        />
        {/* ------------------ */}
        <Route
          path="/utilisateurs"
          element={<Protected Cmp={UserList} adminOnly />}
        />
        <Route
          path="/register"
          element={<Protected Cmp={Register} adminOnly />}
        />
        <Route
          path="/update/user/:id"
          element={<Protected Cmp={UserUpdate} adminOnly />}
        />
        {/* ------------------ */}
        <Route
          path="/moniteurs"
          element={<Protected Cmp={MoniteurList} adminOnly />}
        />
        <Route
          path="/add/moniteur"
          element={<Protected Cmp={AddMoniteur} adminOnly />}
        />
        <Route
          path="/moniteur/:id"
          element={<Protected Cmp={Moniteur} adminOnly />}
        />
        <Route
          path="/update/moniteur/:id"
          element={<Protected Cmp={MoniteurUpdate} adminOnly />}
        />
        {/* ------------------ */}
        <Route path="/rappels" element={<Protected Cmp={RappelList} />} />
        <Route path="/add/rappel" element={<Protected Cmp={AddRappel} />} />
        <Route
          path="/rappels-complets"
          element={<Protected Cmp={RappelsComplets} />}
        />
        {/* ------------------ */}
        <Route path="/global" element={<Protected Cmp={Global} adminOnly />} />
        <Route path="/logs" element={<Protected Cmp={Logs} adminOnly />} />
        <Route
          path="/parametres"
          element={<Protected Cmp={Parametres} adminOnly />}
        />

        {/* Si l'URL n'est pas définie, renvoyer l'utilisateur vers la page de connexion */}
        <Route path="*" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
};

// Exportation du composant AppRoutes pour l'utiliser dans d'autres parties de l'application
export default AppRoutes;
