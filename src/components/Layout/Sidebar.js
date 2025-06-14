import React from "react"; // Importation de React pour utiliser JSX et les fonctionnalités React.
import userImg from "../../assets/img/user.png"; // Importation de l'image de profil par défaut.
import logo from "../../assets/img/minlogo.png"; // Importation du logo de l'application.
import SidebarLinks from "./SidebarLinks"; // Importation du composant SidebarLinks qui contient les liens de la barre latérale.

const Sidebar = ({ user }) => {
  // Définition du composant Sidebar qui prend un utilisateur en prop.

  return (
    <div className="sidebar b-bar d-flex pb-3 bg-body">
      <div className="navbar bg-body navbar-body">
        {/* Partie logo et nom de l'application */}
        <a href="#" className="navbar-brand mx-4 mb-3 d-flex align-items-end">
          <img
            src={logo} // Affichage du logo de l'application
            alt="Logo"
            className="rounded-circle bg-body"
            width="40"
            height="40"
          />
          <h3 className="m-0 ps-2" style={{ color: "#ed3731" }}>
            {" "}
            {/* Affichage du titre "Gest v1" */}
            <strong>Gest v1</strong>
          </h3>
        </a>
        {/* Section profil utilisateur */}
        <div className="d-flex align-items-center ms-4 mb-4">
          <div className="position-relative">
            <img
              src={userImg} // Affichage de l'image de profil par défaut
              alt="Profile"
              className="rounded-circle"
              width="40"
              height="40"
            />
            {/* Indicateur de statut en ligne */}
            <div className="bg-success rounded-circle border border-2 border-body position-absolute end-0 bottom-0 p-1"></div>
          </div>
          {user && ( // Vérifie si l'utilisateur est défini (authentifié).
            <div className="ms-3">
              <h6 className="mb-0">
                {user.prenom} <strong>{user.nom}</strong>{" "}
                {/* Affiche le prénom et le nom de l'utilisateur */}
              </h6>
              <span>{user.role ? "Admin" : "Staff"}</span>{" "}
              {/* Affiche le rôle de l'utilisateur (Admin ou Staff) */}
            </div>
          )}
        </div>
        {/* Inclure les liens de navigation */}
        <SidebarLinks user={user} />{" "}
        {/* Affichage des liens en fonction de l'utilisateur */}
      </div>
    </div>
  );
};

export default Sidebar; // Exportation du composant Sidebar pour qu'il soit utilisé ailleurs dans l'application.
