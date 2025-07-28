import React, { useState, useEffect } from "react";
import Loader from "../../components/Layout/Loader";
import { fetchWithToken } from "../../utils/fetchWithToken";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const RappelImpHistorique = () => {
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRappels = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/liste_rappels_imp`
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
  return (
    <div className="mt-5">
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? ( // Afficher la page de chargement si les données ne sont pas prêtes
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "40vh" }} // Centrer Loader au milieu de l'écran
        >
          <Loader />
        </div>
      ) : (
        <div>
          <h3 className="text-center italic">
            ---Historique des rappels importants---
          </h3>

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
                  style={{ opacity: 0.5 }}
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
                        {formatDateRelative(rappel.updated_at)}
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
      )}
    </div>
  );
};

export default RappelImpHistorique;
