import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importez Link pour les redirections
import Loader from "../../components/Layout/Loader"; // Assurez-vous que le chemin est correct
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale"; // Importation pour la localisation française

const LastSection = () => {
  const [timeState, setTimeState] = useState(Date.now()); // État pour forcer le re-rendu
  const [rappelsImportant, setRappelsImportant] = useState([]); // État pour stocker les rappels importants
  const [resultats, setResultats] = useState([]); // État pour stocker les resultats
  const [logs, setLogs] = useState([]); // État pour stocker les logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Navigation entre les pages

  useEffect(() => {
    fetchRappels(); // Appel de la fonction pour récupérer les rappels importants
    fetchResulats(); // Appel de la fonction pour récupérer les resultats
    fetchLogs(); // Appel de la fonction pour récupérer les logs
    const interval = setInterval(() => {
      setTimeState(Date.now()); // Met à jour l'état pour forcer un re-rendu
    }, 59000); // Intervalle de 59 secondes

    return () => clearInterval(interval); // Nettoie l'intervalle lors du démontage
  }, []); // Le tableau vide [] signifie que l'effet ne s'exécute qu'une seule fois après le premier rendu

  const userInfo = JSON.parse(localStorage.getItem("user-info")); //
  // Récupération des informations utilisateur

  // Fonction pour récupérer la liste des rappesls importants depuis l'API
  const fetchRappels = async () => {
    setLoading(true); // Active le spinner global
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/generate_rappels`
      ); // Appel API
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des rappels."); // Gère les erreurs HTTP
      }
      const data = await response.json(); // Parse les données JSON
      // console.log(data);
      setRappelsImportant(data.rappelActifs);
    } catch (err) {
      setError("Impossible de charger les données : " + err.message); // Stocke le message d'erreur
    } finally {
      setLoading(false); // Désactive le spinner global
    }
  };

  const fetchResulats = async () => {
    setLoading(true); // Active le spinner global
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/latest_resultat`
      ); // Appel API
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des derniers résultats."
        ); // Gère les erreurs HTTP
      }
      const data = await response.json(); // Parse les données JSON
      // console.log(data);
      setResultats(data.resultats);
    } catch (err) {
      setError("Impossible de charger les données : " + err.message); // Stocke le message d'erreur
    } finally {
      setLoading(false); // Désactive le spinner global
    }
  };

  const fetchLogs = async () => {
    setLoading(true); // Active le spinner global
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/latest_logs`
      ); // Appel API
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des derniers logs."); // Gère les erreurs HTTP
      }
      const data = await response.json(); // Parse les données JSON
      // console.log(data);
      setLogs(data.logs);
    } catch (err) {
      setError("Impossible de charger les données : " + err.message); // Stocke le message d'erreur
    } finally {
      setLoading(false); // Désactive le spinner global
    }
  };

  // console.log(resultats);

  const formatDateRelative = (date) => {
    const formatted = formatDistanceToNow(new Date(date), {
      addSuffix: false, // Pas de suffixe (ex. "il y a")
      locale: fr, // Locale française
    });

    if (/moins d.?une minute/i.test(formatted)) {
      return "À l'instant"; // Cas particulier pour "moins d'une minute"
    }

    // Remplacements pour abréger les unités de temps
    const abbreviations = [
      { regex: /environ /i, replacement: "≈" },
      { regex: / heures?/i, replacement: "h" },
      { regex: / minutes?/i, replacement: "min" },
      { regex: / secondes?/i, replacement: "s" },
      { regex: / jours?/i, replacement: "j" },
      { regex: / semaines?/i, replacement: "sem" },
      { regex: / mois?/i, replacement: "mois" },
      { regex: / ans?/i, replacement: "an" },
    ];

    let shortened = formatted;
    abbreviations.forEach(({ regex, replacement }) => {
      shortened = shortened.replace(regex, replacement); // Applique les remplacements
    });

    return shortened; // Retourne la version abrégée
  };

  // Couleurs des actions
  const getActionColor = (action) => {
    switch (action) {
      case "add":
        return "bg-success";
      case "update":
        return "bg-primary";
      case "delete":
        return "bg-danger";
      case "maj":
        return "bg-info";
      default:
        return "bg-warning";
    }
  };

  return (
    <div>
      {/* Affiche un message d'erreur si une erreur est survenue */}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
        >
          <Loader />
        </div>
      ) : (
        <>
          <div className="row g-4">
            {/* Rappels importants */}
            <div className="col-sm-12 col-md-6 col-xl-4">
              <div className="h-100 bg-body rounded border p-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="mb-0">Alertes</h6>
                  <Link to="/rappels">Voir</Link>
                </div>
                {rappelsImportant.length > 0 ? (
                  rappelsImportant
                    .slice(0, 3) // Limite à 3 rappels
                    .map((rappel, index) => (
                      <div
                        key={index}
                        className={`d-flex align-items-center border shadow-sm rounded p-3 mb-2 
                      ${
                        rappel.priorite === "élevée"
                          ? "border-danger bg-danger-subtle"
                          : "border-warning bg-warning-subtle"
                      }`}
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          switch (rappel.type) {
                            case "paiement":
                            case "inactivité":
                            case "formation":
                            case "affectation":
                              navigate(`/update/etudiant/${rappel.model_id}`);
                              break;
                            case "résultat":
                              navigate("/resultats");
                              break;
                            case "examen":
                              navigate("/programmations");
                              break;
                            default:
                              // Ne rien faire
                              break;
                          }
                        }}
                      >
                        <i
                          className={`bi ${
                            rappel.priorite === "élevée"
                              ? "bi-exclamation-triangle-fill text-danger"
                              : "bi-exclamation-circle-fill text-warning"
                          }`}
                          style={{ fontSize: "2rem" }}
                        ></i>
                        <div className="w-100 ms-3">
                          <div className="d-flex w-100 justify-content-between">
                            <h6
                              className={`mb-0 fw-bold ${
                                rappel.priorite === "élevée"
                                  ? "text-danger"
                                  : "text-warning"
                              }`}
                            >
                              {rappel.titre}
                            </h6>
                            <small className="text-muted">
                              {formatDateRelative(rappel.created_at)}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-muted h-100 d-flex align-items-center justify-content-center">
                    Tout baigne pour l'instant, aucun rappel important.
                  </div>
                )}
              </div>
            </div>
            {/* Derniers logs */}
            <div className="col-sm-12 col-md-6 col-xl-4">
              <div className="h-100 bg-body rounded border p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="mb-0">Logs (admin only)</h6>
                  {userInfo?.role && <Link to="/logs">Voir</Link>}
                </div>
                <div className="d-flex flex-column align-items-center">
                  {userInfo?.role ? (
                    logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-center border-bottom py-2 w-100"
                        >
                          <div className="w-100 ms-3">
                            <div className="w-100 d-flex align-items-center justify-content-between">
                              <p
                                className={`${getActionColor(
                                  log.action
                                )} text-uppercase mb-0 text-white rounded-pill p-2`}
                              >
                                {log.action}
                              </p>
                              <p className="mb-0 text-capitalize">
                                {log.table_concernee}
                              </p>
                              <p className="mb-0">
                                {formatDateRelative(log.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted h-100 d-flex align-items-center justify-content-center">
                        Aucun log disponible.
                      </div>
                    )
                  ) : (
                    <div className="text-center text-danger h-100 d-flex align-items-center justify-content-center">
                      Vous n'avez pas les droits pour voir les logs.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Rappels */}
            <div className="col-sm-12 col-md-6 col-xl-4">
              <div className="h-100 bg-body rounded border p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="mb-0">Resultats non rétirés</h6>
                  <Link to="/resultats">Voir</Link>
                </div>
                <div className="d-flex flex-column align-items-center py-2">
                  {resultats.length > 0 ? (
                    resultats.map((resultat, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center border-bottom w-100 pb-1 mb-2"
                      >
                        <i
                          className={`bi bi-file-earmark-text-fill ${
                            resultat.libelle === "code"
                              ? "text-info"
                              : "text-warning"
                          }`}
                          style={{ fontSize: "2rem" }}
                        ></i>
                        <div className="w-100 ms-3">
                          <div className="w-100 d-flex align-items-center justify-content-between">
                            <p className="mb-0">
                              {resultat.etudiant.nom} {resultat.etudiant.prenom}{" "}
                              (ID : etu-{resultat.etudiant.id})
                              <span className="text-capitalize">
                                [{resultat.libelle}]
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted h-100 d-flex align-items-center justify-content-center">
                      Aucun résultat non retiré.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LastSection;
