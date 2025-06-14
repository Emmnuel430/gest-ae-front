import React from "react";
import { Link, useLocation } from "react-router-dom";
import useRappelCount from "../hooks/useRappelCount";

const SidebarLinks = ({ user }) => {
  const location = useLocation();
  const totalRappels = useRappelCount();

  // Fonction pour vérifier si une route est active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar-nav w-100">
      {[
        { to: "/home", icon: "tachometer-alt", label: "Dashboard" },
        {
          to: "/etudiants",
          icon: "users",
          label: "Étudiants",
          extra: ["/add/etudiant"],
        },
        {
          to: "/resultats",
          icon: "clipboard-check",
          label: "Résultats",
          extra: ["/add/resultat"],
        },
        {
          to: "/programmations",
          icon: "calendar-alt",
          label: "Programmation",
          extra: ["/add/programmation"],
        },
        { to: "/rappels", icon: "bell", label: "Rappels" },
        ...(user.role == 1
          ? [
              { to: "/global", icon: "globe", label: "Global" },
              {
                to: "/utilisateurs",
                icon: "user-friends",
                label: "Utilisateurs",
                extra: ["/register"],
              },
              {
                to: "/moniteurs",
                icon: "chalkboard-teacher",
                label: "Moniteurs",
              },
              { to: "/logs", icon: "file-alt", label: "Logs" },
            ]
          : []),
      ].map(({ to, icon, label, extra = [] }) => {
        const isActiveLink =
          isActive(to) || extra.some((path) => isActive(path));
        return (
          <Link
            key={to}
            to={to}
            className={`nav-item nav-link ${
              isActiveLink ? "active bg-body-secondary fw-bold" : ""
            }`}
          >
            <div>
              <i className={`fa fa-${icon} me-2`}></i>
              <span className="text-body">{label}</span>
              {label === "Rappels" && totalRappels > 0 && (
                <span className="bg-danger-subtle border border-danger rounded-pill p-1 ms-2 text-body">
                  {totalRappels > 99 ? "99+" : totalRappels}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SidebarLinks;
