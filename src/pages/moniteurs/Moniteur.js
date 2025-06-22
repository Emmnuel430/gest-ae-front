import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table } from "react-bootstrap"; // Importation de Table depuis react-bootstrap
import Layout from "../../components/Layout/Layout";
import Loader from "../../components/Layout/Loader";
import Back from "../../components/Layout/Back";
import { fetchWithToken } from "../../utils/fetchWithToken";

const Moniteur = () => {
  const { id } = useParams(); // Récupérer l'ID du moniteur depuis l'URL
  const [moniteur, setMoniteur] = useState(null); // État pour stocker les données du moniteur
  const [loading, setLoading] = useState(true); // État pour gérer le chargement
  const [error, setError] = useState(""); // État pour gérer les erreurs

  useEffect(() => {
    // Fonction pour récupérer les données du moniteur
    const fetchMoniteur = async () => {
      setLoading(true);
      setError("");

      try {
        // Appel à l'API pour récupérer les données du moniteur
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/moniteur/${id}`
        );
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données du moniteur."
          );
        }

        const data = await response.json(); // Conversion des données en JSON
        setMoniteur(data); // Mise à jour de l'état avec les données du moniteur
        console.log(data); // Affichage des données dans la console pour le débogage
      } catch (err) {
        setError("Impossible de charger les données : " + err.message); // Gestion des erreurs
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchMoniteur(); // Appel de la fonction pour récupérer les données
  }, [id]); // Dépendance sur l'ID du moniteur

  // Affichage d'un spinner pendant le chargement
  if (loading) {
    return (
      <Layout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
        >
          <Loader />
        </div>
      </Layout>
    );
  }

  // Affichage d'un message d'erreur si une erreur survient
  if (error) {
    return (
      <Layout>
        <Back>etudiants</Back> {/* Bouton pour revenir à la page précédente */}
        <div className="alert alert-danger">{error}</div>
      </Layout>
    );
  }

  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, "$1 ");
  };
  // Affichage des données du moniteur
  return (
    <Layout>
      {/* Bouton pour revenir à la liste des moniteurs */}
      <div className="container py-2">
        <Back>moniteurs</Back>{" "}
        {moniteur ? (
          <>
            {/* Section des détails du moniteur */}
            <div className="card border-0 shadow-sm my-3">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  {/* Icône visuelle */}
                  <div className="col-md-4 text-center mb-4 mb-md-0">
                    <div
                      className="bg-light border rounded-circle d-flex justify-content-center align-items-center mx-auto"
                      style={{ width: 130, height: 130 }}
                    >
                      {moniteur.moniteur.specialite === "conduite" ? (
                        <i className="fas fa-car fa-3x text-primary"></i>
                      ) : (
                        <i className="fas fa-chalkboard-teacher fa-3x text-primary"></i>
                      )}
                    </div>
                    <div className="mt-3 text-uppercase small text-muted">
                      {moniteur.moniteur.specialite}
                    </div>
                  </div>

                  {/* Infos du moniteur */}
                  <div className="col-md-8">
                    <h3 className="text-primary fw-bold text-capitalize">
                      {moniteur.moniteur.nom} {moniteur.moniteur.prenom}
                    </h3>
                    <hr className="my-2" />
                    <ul className="list-unstyled small mt-3">
                      <li className="mb-2">
                        <i className="fas fa-phone-alt me-2 text-secondary"></i>
                        <strong>Téléphone :</strong>{" "}
                        {formatPhoneNumber(moniteur.moniteur.num_telephone) || (
                          <span className="text-muted">Non disponible</span>
                        )}
                      </li>

                      {moniteur.moniteur.num_telephone_2 && (
                        <li className="mb-2">
                          <i className="fas fa-phone me-2 text-secondary"></i>
                          <strong>Sécondaire :</strong>{" "}
                          {formatPhoneNumber(moniteur.moniteur.num_telephone_2)}
                        </li>
                      )}

                      <li className="mb-2">
                        <i className="fas fa-envelope me-2 text-secondary"></i>
                        <strong>Email :</strong>{" "}
                        {moniteur.moniteur.email || (
                          <span className="text-muted">Non renseigné</span>
                        )}
                      </li>

                      <li className="mb-2">
                        <i className="fas fa-map-marker-alt me-2 text-secondary"></i>
                        <strong>Commune :</strong>{" "}
                        {moniteur.moniteur.commune || (
                          <span className="text-muted">Non renseignée</span>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Étudiants */}
            {moniteur.etudiants.length > 0 ? (
              <div className="card shadow-sm mt-4">
                <div className="card-body p-4">
                  <h4 className="card-title mb-3 text-primary">
                    Étudiants affectés ({moniteur.etudiants.length})
                  </h4>
                  <div className="table-responsive">
                    <Table
                      hover
                      className="align-middle table-bordered table-striped"
                      responsive
                    >
                      <thead className="table-body">
                        <tr>
                          <th>#</th>
                          <th>Nom</th>
                          <th>Prénom</th>
                          <th>Téléphone</th>
                          <th className="text-center">Motif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moniteur.etudiants.map((etudiant, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td className="text-capitalize">{etudiant.nom}</td>
                            <td className="text-capitalize">
                              {etudiant.prenom}
                            </td>
                            <td>{formatPhoneNumber(etudiant.num_telephone)}</td>
                            <td className="text-center">
                              <span
                                className={`badge rounded-pill px-3 py-2 text-uppercase ${
                                  etudiant.motif_inscription === "permis"
                                    ? "bg-success"
                                    : "bg-secondary"
                                }`}
                              >
                                {etudiant.motif_inscription}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-info mt-4">
                <i className="fas fa-info-circle me-2"></i> Aucun étudiant
                affecté à ce(cette) moniteur(monitrice).
              </div>
            )}
          </>
        ) : (
          // Affichage d'un spinner si les données ne sont pas encore disponibles
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3">Chargement des données...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Moniteur;
