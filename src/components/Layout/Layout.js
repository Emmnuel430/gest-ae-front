// Importation des dépendances nécessaires
import React from "react";
import "../../assets/css/Home.css"; // Importation du fichier CSS pour la mise en page
import HomeScript from "../../assets/js/HomeScript"; // Importation d'un script personnalisé pour la page
import loginImage from "../../assets/img/user.png"; // Importation d'une image pour le profil utilisateur
import { useNavigate } from "react-router-dom"; // Importation de 'useNavigate' pour la navigation
import logo from "../../assets/img/minlogo.png"; // Importation du logo de l'application.
import Sidebar from "./Sidebar"; // Importation du composant Sidebar
import ThemeSwitcher from "../others/ThemeSwitcher"; // Importation du composant ThemeSwitcher
import { fetchWithToken } from "../../utils/fetchWithToken";

// Définition du composant Layout qui sera utilisé comme un modèle de page (avec du contenu dynamique via 'children')
const Layout = ({ children }) => {
  // Récupération des informations de l'utilisateur depuis le localStorage (si elles existent)
  let user = JSON.parse(localStorage.getItem("user-info"));

  // Utilisation de 'useNavigate' pour effectuer des redirections dans l'application
  const navigate = useNavigate();

  // Fonction de déconnexion qui efface les informations de l'utilisateur du localStorage et redirige vers la page de connexion
  async function logOut() {
    try {
      await fetchWithToken(`${process.env.REACT_APP_API_BASE_URL}/logout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    } finally {
      setLoad(false);
      // Nettoyage et redirection
      localStorage.clear();
      navigate("/");
    }
  }

  return (
    <div className="container-fluid position-relative bg-body d-flex p-0">
      {/* Sidebar affichée sur le côté gauche */}
      <Sidebar user={user} />

      {/* Main content - Contenu principal de la page */}
      <div className="content shifted bg-body">
        {/* Navbar en haut de la page */}
        <nav className="navbar navbar-expand bg-body navbar-body sticky-top px-4 py-0">
          {/* Logo ou icône en version mobile */}
          <a href="#" className="navbar-brand d-flex d-lg-none me-4">
            <img
              src={logo} // Affichage du logo de l'application
              alt="Logo"
              className="rounded-circle"
              width="40"
              height="40"
            />
          </a>
          {/* Bouton pour basculer l'affichage de la sidebar */}
          <button
            className="sidebar-toggle flex-shrink-0 text-primary"
            style={{
              border: "none",
              zIndex: 1000,
              background: "none",
              fontSize: "1.5rem",
            }}
          >
            <i className="fa fa-bars"></i>
          </button>
          {/* Formulaire de recherche (caché sur mobile) 
          <form className="d-none d-md-flex ms-4">
            <input
              type="search"
              className="form-control border-0"
              placeholder="Search"
            />
          </form> */}
          {/* Section de la barre de navigation avec notifications et messages */}
          <div className="navbar-nav align-items-center ms-auto">
            {/* Notification d'alertes */}
            <div className="nav-item dropdown">
              <button type="button" className="nav-link dropdown-toggle btn">
                <i className="fa fa-bell me-lg-2"></i>
                <span className="d-none d-lg-inline-flex items text-body">
                  Alertes
                </span>
              </button>
              <div className="dropdown-menu dropdown-menu-end bg-body border-0 rounded-bottom m-0">
                <div className="dropdown-item">
                  <div className="d-flex align-items-center">
                    {/* Image de profil de l'expéditeur */}
                    <img
                      src={loginImage}
                      alt="Profile"
                      className="rounded-circle"
                      width="40"
                      height="40"
                    />
                    <div className="ms-2">
                      <h6 className="text-body">John sent you a message</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Changement de thème */}
            <ThemeSwitcher />

            {/* Section pour afficher l'image de profil et permettre la déconnexion */}
            {user && (
              <div className="nav-item dropdown">
                <a href="#" className="nav-link dropdown-toggle">
                  {/* Affichage de l'image de profil */}
                  <img
                    src={loginImage} // Remplacez 'loginImage' par l'image appropriée si nécessaire
                    alt="Profile"
                    className="rounded-circle"
                    width="40"
                    height="40"
                  />
                  <span className="d-none d-lg-inline items text-body">
                    {user && user.prenom} <strong>{user && user.nom}</strong>
                  </span>
                </a>
                {/* Menu déroulant avec l'option de déconnexion */}
                <div className="dropdown-menu dropdown-menu-end bg-body border-0 rounded-bottom m-0">
                  <a
                    href="#"
                    className="dropdown-item text-body"
                    onClick={logOut}
                  >
                    Déconnexion
                  </a>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Contenu dynamique de la page, qui sera fourni par le parent (via 'children') */}
        <div className="p-2">{children}</div>
        <br />
        <br />
      </div>
      <br />
      <br />

      {/* Bouton de retour en haut de la page */}
      <a
        href="#"
        className="btn btn-lg btn-primary btn-lg-square back-to-top hide"
      >
        <i className="bi bi-arrow-up"></i>
      </a>

      {/* Script spécifique à la page Home */}
      <HomeScript />
    </div>
  );
};

export default Layout;
