import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importez Link pour les redirections
import Loader from "../../components/Layout/Loader"; // Assurez-vous que le chemin est correct
import { fetchWithToken } from "../../utils/fetchWithToken";

const Statistiques = () => {
  const [totaux, setTotaux] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Indique que les données sont en cours de chargement
      setError(null); // Réinitialise l'erreur

      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/global/totaux`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des logs");
        }

        const data = await response.json(); // Définition de data
        setTotaux(data);
      } catch (error) {
        // console.error("Erreur lors de la récupération des données :", error);
        setError("Impossible de charger les données : " + error.message); // Gestion des erreurs
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour formater le montant
  function formatMontant(montant) {
    if (montant >= 1_000_000_000) {
      return (
        (montant / 1_000_000_000)
          .toFixed(montant % 1_000_000_000 === 0 ? 0 : 1)
          .replace(".", ",") + " Md"
      );
    } else if (montant >= 1_000_000) {
      return (
        (montant / 1_000_000)
          .toFixed(montant % 1_000_000 === 0 ? 0 : 1)
          .replace(".", ",") + " M"
      );
    } else if (montant >= 1_000) {
      return (
        (montant / 1_000)
          .toFixed(montant % 1_000 === 0 ? 0 : 1)
          .replace(".", ",") + " K"
      );
    } else {
      return new Intl.NumberFormat("fr-FR", { useGrouping: true }).format(
        Math.trunc(montant)
      );
    }
  }

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
          {/* Section Totaux */}
          <div className="row g-4 mb-4">
            {/* Carte pour le revenu total */}
            <div className="col-sm-6 col-xl-3">
              <Link to="/global" className="text-decoration-none">
                <div className="bg-body h-100 rounded border text-dark d-flex align-items-center justify-content-between p-4 hover-shadow">
                  <i className="fa fa-coins fa-3x text-primary"></i>
                  <div className="ms-3">
                    <div className="mb-2 text-body">Revenu total (FCFA)</div>
                    <h6
                      className="text-body mb-0 h2 text-center"
                      title={new Intl.NumberFormat("fr-FR", {
                        useGrouping: true,
                      }).format(totaux.totalMontantPaye || 0)}
                    >
                      <strong>
                        <em>
                          {totaux?.totalMontantPaye
                            ? formatMontant(totaux.totalMontantPaye)
                            : "N/A"}{" "}
                        </em>
                      </strong>
                    </h6>
                  </div>
                </div>
              </Link>
            </div>
            {/* Carte pour le nombre total d'étudiants */}
            <div className="col-sm-6 col-xl-3">
              <Link to="/etudiants" className="text-decoration-none">
                <div className="bg-body h-100 rounded border text-dark d-flex align-items-center justify-content-between p-4 hover-shadow">
                  <i className="fa fa-users fa-3x text-primary"></i>
                  <div className="ms-3">
                    <div className="mb-2 text-body">Nombre d'Étudiants</div>
                    <h6 className="text-body mb-0 h2 text-center">
                      {totaux?.totalEtudiants || "N/A"}
                    </h6>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-sm-6 col-xl-3">
              <Link to="/etudiants" className="text-decoration-none">
                <div className="bg-body h-100 rounded border text-dark d-flex align-items-center justify-content-between p-4 hover-shadow">
                  <i className="fa fa-chalkboard fa-3x text-primary"></i>
                  <div className="ms-3">
                    <div className="mb-2 text-body">Etudiants au code</div>
                    <h6 className="text-body mb-0 h2 text-center">
                      {totaux?.etudiantsAuCode || "N/A"}
                    </h6>
                  </div>
                </div>
              </Link>
            </div>
            {/* Carte pour le nombre total d'utilisateurs */}
            <div className="col-sm-6 col-xl-3">
              <Link to="/etudiants" className="text-decoration-none">
                <div className="bg-body h-100 rounded border text-dark d-flex align-items-center justify-content-between p-4 hover-shadow">
                  <i className="fa fa-car fa-3x text-primary"></i>
                  <div className="ms-3">
                    <div className="mb-2 text-body">
                      Etudiants à la conduite
                    </div>
                    <h6 className="text-body mb-0 h2 text-center">
                      {totaux?.etudiantsALaConduite || "N/A"}
                    </h6>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statistiques;
