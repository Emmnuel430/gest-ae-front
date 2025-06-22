import React, { useState, useEffect } from "react";
import { Table, Spinner, Modal } from "react-bootstrap";
import Layout from "../../components/Layout/Layout";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter";
import Loader from "../../components/Layout/Loader";
import { format } from "date-fns";
import AddRappel from "./AddRappel";
import { Link } from "react-router-dom"; // Importer Link pour la navigation
import RappelImportant from "./RappelImportant"; // Importer le nouveau composant
import { fetchWithToken } from "../../utils/fetchWithToken";

const Rappels = () => {
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRappel, setSelectedRappel] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  useEffect(() => {
    const fetchRappels = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/liste_rappels`
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

  const handleConfirmDelete = (rappel) => {
    setSelectedRappel(rappel);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRappel(null);
  };

  const handleDelete = async () => {
    if (!selectedRappel) return;

    const userInfo = JSON.parse(localStorage.getItem("user-info")); // Récupère les infos utilisateur
    const userId = userInfo ? userInfo.id : null; // Vérifie si l'utilisateur est connecté

    if (!userId) {
      alert("Utilisateur non authentifié. Veuillez vous connecter.");
      navigate("/");
      return;
    }

    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/delete_rappel/${selectedRappel.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idUser: userId }), // Remplacez 1 par l'ID utilisateur réel
        }
      );

      if (!response.ok) throw new Error("Échec de la suppression");

      setRappels((prevRappels) =>
        prevRappels.filter((rappel) => rappel.id !== selectedRappel.id)
      );

      setShowModal(false);
      alert("Rappel supprimé.");
      setSelectedRappel(null);
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <Layout>
      <div className="container mt-2">
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? ( // Afficher la page de chargement si les données ne sont pas prêtes
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "90vh" }} // Centrer Loader au milieu de l'écran
          >
            <Loader />
          </div>
        ) : (
          <>
            <HeaderWithFilter
              title2="Rappels"
              link="#"
              linkText2="Ajouter"
              onLinkClick={handleOpenAddModal}
            />
            <div>
              <h3 className="text-center">---Rappels en cours---</h3>
              <Table
                className="table table-striped table-hover text-center"
                responsive
              >
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Titre</th>
                    <th>Priorité</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rappels.filter((rappel) => !rappel.statut).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Aucun rappel en cours.
                      </td>
                    </tr>
                  ) : (
                    rappels
                      .filter((rappel) => !rappel.statut) // Afficher uniquement les rappels en cours
                      .slice(0, 5) // Limiter à 5 éléments
                      .sort((a, b) => {
                        const priorityOrder = {
                          élevée: 3,
                          moyenne: 2,
                          basse: 1,
                        };
                        return (
                          priorityOrder[b.priorite] - priorityOrder[a.priorite]
                        );
                      })
                      .map((rappel, index) => (
                        <tr key={index}>
                          <td>
                            <span
                              className={`badge ${
                                rappel.statut ? "bg-success" : "bg-secondary"
                              }`}
                            >
                              {rappel.statut ? "Terminé" : "En cours"}
                            </span>
                          </td>
                          <td>{rappel.titre}</td>
                          <td>
                            {rappel.priorite === "basse" ? (
                              <span className="badge bg-warning">Basse</span>
                            ) : rappel.priorite === "moyenne" ? (
                              <span
                                className="badge"
                                style={{ background: "#ff9800" }}
                              >
                                Moyenne
                              </span>
                            ) : (
                              <span className="badge bg-danger">Elevée</span>
                            )}
                          </td>
                          <td>
                            {rappel.date_rappel
                              ? format(
                                  new Date(rappel.date_rappel),
                                  "dd/MM/yyyy"
                                )
                              : "Date invalide"}
                          </td>
                          <td>
                            <button
                              onClick={() => handleConfirmDelete(rappel)}
                              className="btn btn-danger btn-sm"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </Table>
              <div className="text-end mt-3">
                <Link to="/rappels-complets" className="btn btn-secondary">
                  Historique des rappels
                </Link>
              </div>
              <br />
              <RappelImportant />
            </div>
            <ConfirmPopup
              show={showModal}
              onClose={handleCloseModal}
              onConfirm={handleDelete}
              title="Confirmer la suppression"
              body={<p>Confirmez-vous la suppression de ce rappel ?</p>}
            />
            <Modal
              show={showAddModal}
              onHide={handleCloseAddModal}
              size="lg"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Ajouter un Rappel</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <AddRappel onClose={handleCloseAddModal} />
              </Modal.Body>
            </Modal>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Rappels;
