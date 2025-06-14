import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Loader from "../../components/Layout/Loader";

const RappelImportant = () => {
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Navigation entre les pages

  useEffect(() => {
    const fetchRappels = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/generate_rappels`
        );
        const data = await response.json();

        setRappels(data.rappelActifs);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors de la récupération des rappels.");
        setLoading(false);
      }
    };

    fetchRappels();
  }, []);

  if (loading) {
    return <Loader />;
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

  return (
    <div className="bg-body rounded p-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="mb-0 d-flex align-items-center">
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
        {/* <a href="/rappels-complets">Voir tout</a> */}
      </div>
      {rappels.length === 0 ? (
        <div>Aucun rappel important.</div>
      ) : (
        rappels
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
