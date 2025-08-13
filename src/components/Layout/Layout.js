// Importation des dépendances nécessaires
import React from "react";
import "../../assets/css/Home.css"; // Importation du fichier CSS pour la mise en page
import HomeScript from "../../assets/js/HomeScript"; // Importation d'un script personnalisé pour la page
import loginImage from "../../assets/img/user.png"; // Importation d'une image pour le profil utilisateur
import { useNavigate, Link } from "react-router-dom"; // Importation de 'useNavigate' pour la navigation
import logo from "../../assets/img/minlogo.png"; // Importation du logo de l'application.
import Sidebar from "./Sidebar"; // Importation du composant Sidebar
import ThemeSwitcher from "../others/ThemeSwitcher"; // Importation du composant ThemeSwitcher
import { fetchWithToken } from "../../utils/fetchWithToken";
import useRappelCount from "../hooks/useRappelCount";
import useIdleLogout from "../../utils/useIdleLogout";

// Définition du composant Layout qui sera utilisé comme un modèle de page (avec du contenu dynamique via 'children')
const Layout = ({ children }) => {
  useIdleLogout(20);

  // Récupération des informations de l'utilisateur depuis le sessionStorage (si elles existent)
  let user = JSON.parse(sessionStorage.getItem("user-info"));
  const [load, setLoad] = React.useState(false); // État pour gérer le chargement (non utilisé dans ce code, mais peut être utile pour des opérations asynchrones)
  const totalRappels = useRappelCount();

  // Utilisation de 'useNavigate' pour effectuer des redirections dans l'application
  const navigate = useNavigate();

  // Fonction de déconnexion qui efface les informations de l'utilisateur du sessionStorage et redirige vers la page de connexion
  async function logOut() {
    try {
      setLoad(true);
      await fetchWithToken(`${process.env.REACT_APP_API_BASE_URL}/logout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    } finally {
      setLoad(false);
      // Nettoyage et redirection
      sessionStorage.clear();
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
            <div className="nav-item dropdown d-block d-lg-none">
              <button
                type="button"
                className="nav-link dropdown-toggle btn"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {/* Cloche + Badge à l’intérieur du <i> */}
                <span className="position-relative me-lg-2">
                  <i className="fa fa-bell"></i>

                  {totalRappels > 0 && (
                    <span
                      className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {totalRappels > 99 ? "99+" : totalRappels}
                    </span>
                  )}
                </span>

                {/* Texte à côté de la cloche */}
                <span className="d-none d-lg-inline-flex items text-body">
                  Alertes
                </span>
              </button>

              <div className="dropdown-menu dropdown-menu-end bg-body border-0 rounded-bottom m-0 p-0">
                {totalRappels > 0 ? (
                  <Link to="/rappels" className="dropdown-item p-0">
                    <div className="d-flex align-items-center m-0 p-0">
                      {/* <img
                        src={loginImage}
                        alt="Profile"
                        className="rounded-circle"
                        width="40"
                        height="40"
                      /> */}
                      <div className="alert alert-danger m-0">
                        <h6 className="text-body mb-0">Voir les rappels</h6>
                        <small className="text-muted">
                          {totalRappels > 1
                            ? `Vous avez ${totalRappels} rappels en cours`
                            : "Vous avez 1 rappel"}
                          <br />
                          Cliquez pour voir
                        </small>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="dropdown-item text-muted">Aucune alerte</div>
                )}
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
                  <button
                    type="button"
                    className="dropdown-item text-body"
                    onClick={logOut}
                  >
                    {load ? (
                      <span>
                        <i className="fas fa-spinner fa-spin"></i> Chargement...
                      </span>
                    ) : (
                      <span>Déconnexion</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Contenu dynamique de la page, qui sera fourni par le parent (via 'children') */}
        <div className="p-2 min-vh-100">{children}</div>
        <div className="footer px-4 pt-4 mt-5">
          <div className="bg-body">
            <div className="row small">
              <div className="col-12 col-sm-6 text-center text-sm-start">
                &copy; {new Date().getFullYear()} <Link to="/">Gest</Link>,
                AsNumeric - J/E. Tous droits réservés.
              </div>
              <div className="col-12 col-sm-6 text-center text-sm-end text-muted ">
                Designed By <Link to="/">Joel E. Daho</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de retour en haut de la page */}
      <button className="btn btn-lg btn-primary btn-lg-square back-to-top hide">
        <i className="bi bi-arrow-up"></i>
      </button>

      {/* Script spécifique à la page Home */}
      <HomeScript />
    </div>
  );
};

export default Layout;
