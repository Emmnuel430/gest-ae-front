import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Loader from "../../components/Layout/Loader";
import { fetchWithToken } from "../../utils/fetchWithToken";

const RappelImportant = () => {
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtrePriorite, setFiltrePriorite] = useState("tous"); // "toutes", "élevée", "moyenne", "basse"

  const navigate = useNavigate(); // Navigation entre les pages

  useEffect(() => {
    const fetchRappels = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/generate_rappels`
        );
        const data = await response.json();

        setRappels(data.rappels);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors de la récupération des rappels.");
        setLoading(false);
      }
    };

    fetchRappels();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }} // Centrer Loader au milieu de l'écran
      >
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const formatDateRelative = (date) => {
    const formatted = formatDistanceToNow(new Date(date), {
      addSuffix: false,
      locale: fr,
    });

    if (/moins d.?une minute/i.test(formatted)) {
      return "À l'instant";
    }

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
      shortened = shortened.replace(regex, replacement);
    });

    return shortened;
  };

  // Variables pour compter les rappels par priorité
  const rappelsPrioriteElevee = rappels.filter(
    (rappel) => rappel.priorite === "élevée"
  ).length;
  const rappelsPrioriteMoyenne = rappels.filter(
    (rappel) => rappel.priorite === "moyenne"
  ).length;
  const rappelsPrioriteFaible = rappels.filter(
    (rappel) => rappel.priorite === "basse"
  ).length;

  const totalRappels = rappels.length;

  const rappelsFiltres = rappels.filter((rappel) => {
    if (filtrePriorite === "tous") return true;
    return rappel.priorite === filtrePriorite;
  });

  return (
    <div className="bg-body rounded p-4">
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-2">
        <div className="mb-0 d-flex  align-items-center">
          <h4 className="mb-0 me-2">Rappels Importants ({totalRappels})</h4>
          <span className="rounded rounded-circle border border-danger bg-danger-subtle text-danger p-2 me-2">
            {rappelsPrioriteElevee}
          </span>
          <span className="rounded rounded-circle border border-warning bg-warning-subtle text-warning p-2 me-2">
            {rappelsPrioriteMoyenne}
          </span>
          <span className="rounded rounded-circle border border-secondary bg-secondary-subtle text-secondary p-2">
            {rappelsPrioriteFaible}
          </span>
        </div>
        <div className="my-3 d-flex gap-2">
          <button
            className={`btn btn-sm ${
              filtrePriorite === "tous" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFiltrePriorite("tous")}
          >
            Tous
          </button>
          <button
            className={`btn btn-sm ${
              filtrePriorite === "élevée" ? "btn-danger" : "btn-outline-danger"
            }`}
            onClick={() => setFiltrePriorite("élevée")}
          >
            Élevée
          </button>
          <button
            className={`btn btn-sm ${
              filtrePriorite === "moyenne"
                ? "btn-warning text-white"
                : "btn-outline-warning"
            }`}
            onClick={() => setFiltrePriorite("moyenne")}
          >
            Moyenne
          </button>
          <button
            className={`btn btn-sm ${
              filtrePriorite === "basse"
                ? "btn-secondary"
                : "btn-outline-secondary"
            }`}
            onClick={() => setFiltrePriorite("basse")}
          >
            Basse
          </button>
        </div>
      </div>
      {rappelsFiltres.length === 0 ? (
        <div>Aucun rappel important.</div>
      ) : (
        rappelsFiltres
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
                cursor: rappel.type !== "examen" ? "pointer" : "default",
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
                <span className="text-muted">
                  {rappel.description || "Pas de description."}
                </span>
                <br />
                <span className="text-muted italic text-capitalize">
                  Type : {rappel.type || "Pas de type."}
                </span>
                <br />
                {rappel.date_rappel && (
                  <span className="text-muted italic">
                    Date de l'examen :{" "}
                    {format(new Date(rappel.date_rappel), "dd/MM/yyyy")}
                  </span>
                )}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default RappelImportant;
