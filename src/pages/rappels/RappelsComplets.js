import React, { useEffect, useState } from "react";
import { Table, Modal } from "react-bootstrap";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import Loader from "../../components/Layout/Loader";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import RappelUpdate from "./RappelUpdate"; // Import du nouveau composant

const RappelsComplets = () => {
  const [rappels, setRappels] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedRappel, setSelectedRappel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [rappelToUpdate, setRappelToUpdate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRappelDetails, setSelectedRappelDetails] = useState(null);
  const [sortOption, setSortOption] = useState("default"); // Option de tri
  const [sortedRappels, setSortedRappels] = useState([]); // Liste triée des rappels

  useEffect(() => {
    const fetchRappels = async () => {
      try {
        const response = await fetch(
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
      const response = await fetch(
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

  const handleOpenUpdateModal = (rappel) => {
    setRappelToUpdate(rappel);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setRappelToUpdate(null);
  };

  const handleUpdateRappel = async (updatedRappel) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/update_rappel/${updatedRappel.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedRappel),
        }
      );

      if (!response.ok) throw new Error("Échec de la mise à jour");

      setRappels((prevRappels) =>
        prevRappels.map((rappel) =>
          rappel.id === updatedRappel.id ? updatedRappel : rappel
        )
      );

      alert("Rappel mis à jour avec succès.");
      handleCloseUpdateModal();
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  const handleShowDetails = (rappel) => {
    setSelectedRappelDetails(rappel);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRappelDetails(null);
  };

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
    <Layout>
      <div className="container mt-2">
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
            <Back>rappels</Back>
            <HeaderWithFilter
              title="Rappels"
              main={rappels.length || null}
              filter={filter}
              setFilter={setFilter}
              filterOptions={[
                { value: "", label: "Tous les rappels" },
                { value: "basse", label: "Non-Urgent" },
                { value: "moyenne", label: "Urgent" },
                { value: "élevée", label: "Très Urgent" },
              ]}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={rappels}
              setSortedList={setSortedRappels}
              dateField="created_at"
            />

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
                  <th>Créé il y a</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedRappels.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Aucune donnée trouvée.
                    </td>
                  </tr>
                ) : (
                  sortedRappels
                    .filter((rappel) => !filter || rappel.priorite === filter)
                    .sort((a, b) => a.statut - b.statut)
                    .map((rappel, index) => (
                      <tr
                        key={index}
                        // className={rappel.statut ? "table-row-disabled" : ""}
                      >
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
                            <span className="badge bg-danger">Élevée</span>
                          )}
                        </td>
                        <td>
                          {rappel.date_rappel
                            ? format(new Date(rappel.date_rappel), "dd/MM/yyyy")
                            : "Date invalide"}
                        </td>
                        <td>{formatDateRelative(rappel.created_at)}</td>
                        <td>
                          {!rappel.statut && (
                            <>
                              <button
                                onClick={() => handleConfirmDelete(rappel)}
                                className="btn btn-danger btn-sm me-2"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                              <button
                                onClick={() => handleOpenUpdateModal(rappel)}
                                className="btn btn-warning btn-sm me-2"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleShowDetails(rappel)}
                            className="btn btn-info btn-sm opacity-100"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </Table>
          </>
        )}

        <ConfirmPopup
          show={showModal}
          onClose={handleCloseModal}
          onConfirm={handleDelete}
          title="Confirmer la suppression"
          body={
            selectedRappel ? (
              <p>
                Confirmez-vous la suppression de ce rappel :{" "}
                <strong>{selectedRappel.titre}</strong> ? <br /> Priorité :{" "}
                <strong className="text-capitalize">
                  {selectedRappel.priorite}
                </strong>
              </p>
            ) : (
              <p>Aucun rappel sélectionné.</p>
            )
          }
        />

        <Modal
          show={showUpdateModal}
          onHide={handleCloseUpdateModal}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Modifier un Rappel</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <RappelUpdate
              onClose={handleCloseUpdateModal}
              rappel={rappelToUpdate}
              onUpdate={handleUpdateRappel} // Ajout de la fonction de mise à jour
            />
          </Modal.Body>
        </Modal>

        <Modal
          show={showDetailsModal}
          onHide={handleCloseDetailsModal}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Détails du Rappel</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRappelDetails && (
              <div className="container">
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Titre :</div>
                  <div className="col-6">{selectedRappelDetails.titre}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Description :</div>
                  <div className="col-6">
                    {selectedRappelDetails.description || "--Non spécifié"}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Date de Rappel :</div>
                  <div className="col-6">
                    {selectedRappelDetails.date_rappel
                      ? format(
                          new Date(selectedRappelDetails.date_rappel),
                          "dd/MM/yyyy"
                        )
                      : "Date invalide"}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Type :</div>
                  <div className="col-6">{selectedRappelDetails.type}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Priorité :</div>
                  <div className="col-6 text-capitalize">
                    {selectedRappelDetails.priorite === "basse" ? (
                      <span className="badge bg-warning">Basse</span>
                    ) : selectedRappelDetails.priorite === "moyenne" ? (
                      <span className="badge" style={{ background: "#ff9800" }}>
                        Moyenne
                      </span>
                    ) : (
                      <span className="badge bg-danger">Élevée</span>
                    )}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Statut :</div>
                  <div className="col-6">
                    {selectedRappelDetails.statut ? (
                      <span className="badge bg-success">Terminé</span>
                    ) : (
                      <span className="badge bg-secondary">En cours</span>
                    )}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Créé le :</div>
                  <div className="col-6">
                    {format(
                      new Date(selectedRappelDetails.created_at),
                      "dd/MM/yyyy HH:mm:ss"
                    )}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Utilisateur associé :</div>
                  <div className="col-6">
                    {selectedRappelDetails.user?.nom || "Non spécifié"} (ID:{" "}
                    {selectedRappelDetails.user?.id || "N/A"})
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-secondary"
              onClick={handleCloseDetailsModal}
            >
              Fermer
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  );
};

export default RappelsComplets;
