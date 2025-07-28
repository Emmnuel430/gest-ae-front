import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Ajout de useNavigate pour la navigation
import Loader from "../../components/Layout/Loader"; // Assurez-vous que le chemin est correct
import { fetchWithToken } from "../../utils/fetchWithToken";

const Recents = () => {
  const [etudiants, setEtudiants] = useState([]); // Liste des étudiants
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook pour la navigation

  useEffect(() => {
    fetchEtudiants(); // Appel de la fonction pour récupérer les étudiants
  }, []); // Le tableau vide [] signifie que l'effet ne s'exécute qu'une seule fois après le premier rendu

  // Fonction pour récupérer la liste des étudiants depuis l'API
  const fetchEtudiants = async () => {
    setLoading(true); // Active le spinner global
    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/latest_etudiant`
      ); // Appel API
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des etudiants."); // Gère les erreurs HTTP
      }
      const data = await response.json(); // Parse les données JSON
      setEtudiants(data.etudiants); // Met à jour l'état avec les données
    } catch (err) {
      setError("Impossible de charger les données : " + err.message); // Stocke le message d'erreur
    } finally {
      setLoading(false); // Désactive le spinner global
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
          {/* Section pour les nouveaux étudiants */}
          <div className="bg-body text-center rounded p-4 mb-4 border">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h6 className="mb-0">Nouveaux étudiants (10 dern.)</h6>
              <Link to="/etudiants">Tout Voir</Link>
            </div>
            <div className="table-responsive">
              <table className="table centered-table text-start align-middle text-bordered table-hover mb-0">
                <thead>
                  <tr className="text-dark">
                    <th scope="col">Id</th>
                    <th scope="col">Nom & Prénom(s)</th>
                    <th scope="col">Motif</th>
                    <th scope="col">Scolarité</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {etudiants.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Aucune donnée disponible pour le moment.
                      </td>
                    </tr>
                  ) : (
                    etudiants
                      .sort((a, b) => b.id - a.id) // Trie par ID décroissant
                      // .sort((a, b) => new Date(b.date_inscription) - new Date(a.date_inscription)) // Trie par date d'inscription décroissante
                      .map((etudiant) => (
                        <tr key={etudiant.id}>
                          <td>etu-{etudiant.id}</td>
                          <td className="text-uppercase">
                            <strong>{etudiant.nom}</strong>{" "}
                            {etudiant.prenom.split(" ")[0]}
                          </td>
                          <td
                            className={`text-center text-capitalize text-white`}
                          >
                            <span
                              className={`badge ${
                                etudiant.motif_inscription === "permis"
                                  ? "bg-info"
                                  : "bg-secondary"
                              }`}
                            >
                              {etudiant.motif_inscription}
                            </span>
                          </td>
                          <td>
                            {etudiant.montant_paye >= etudiant.scolarite ? (
                              <span className="badge bg-success">Soldé</span>
                            ) : (
                              <span className="badge bg-danger">Pas soldé</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                navigate(`/etudiant/${etudiant.id}`)
                              }
                            >
                              Voir
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Recents;
