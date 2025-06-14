import React, { useEffect, useState } from "react";
import { Table, Modal, Button } from "react-bootstrap"; // Importation pour le modal
import Layout from "../components/Layout/Layout";
import Loader from "../components/Layout/Loader";
import HeaderWithFilter from "../components/Layout/HeaderWithFilter";

import { format, set } from "date-fns";

const Logs = () => {
  // États pour gérer les données
  const [allLogs, setAllLogs] = useState([]); // Tous les logs
  const [filteredLogs, setFilteredLogs] = useState([]); // Logs filtrés
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(""); // Filtre par action
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10; // Nombre de logs par page

  const [sortOption, setSortOption] = useState(""); // Option de tri
  const [sortedLogs, setSortedLogs] = useState([]); // Logs triés

  const [showDetailsModal, setShowDetailsModal] = useState(false); // Contrôle du modal
  const [selectedLog, setSelectedLog] = useState(null); // Log sélectionné

  // Fonction pour récupérer tous les logs au chargement initial
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/logs`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des logs");
        }
        const data = await response.json();
        setAllLogs(data.logs.data || []);
        setFilteredLogs(data.logs.data || []); // Initialement, tous les logs
      } catch (err) {
        setError("Impossible de charger les données : " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Appliquer le filtre à chaque changement
  useEffect(() => {
    const filtered = allLogs.filter((log) =>
      filter ? log.action === filter : true
    );
    setFilteredLogs(filtered);
    setSortedLogs(filtered); // Mettre à jour les logs triés
    setCurrentPage(1); // Réinitialiser à la première page lors d'un nouveau filtre
  }, [filter, allLogs]);

  // Pagination : calcul des logs à afficher sur la page actuelle
  const startIndex = (currentPage - 1) * logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);
  // console.log("currentLogs", currentLogs);
  // console.log(filteredLogs);

  // Gestion des pages
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  // Fonction pour ouvrir le modal avec les détails d'un log
  const handleShowDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  // Fonction pour fermer le modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLog(null);
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
            <HeaderWithFilter
              title2="Logs"
              main={sortedLogs.length || null}
              filter={filter}
              setFilter={setFilter}
              filterOptions={[
                { value: "", label: "Tous les logs" },
                { value: "add", label: "Add" },
                { value: "delete", label: "Delete" },
                { value: "update", label: "Update" },
                { value: "maj", label: "Maj" },
                { value: "create", label: "Create" },
              ]}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={sortedLogs}
              setSortedList={setFilteredLogs}
              dateField="created_at"
            />
            <Table className="centered-table" hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Table</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length > 0 ? (
                  currentLogs.map((log, key) => (
                    <tr key={log.id || key}>
                      <td>{startIndex + key + 1}</td>
                      <td>
                        {log.user_nom || "Inconnu"}{" "}
                        {log.user_prenom || "Inconnu"} (ID:{" "}
                        {log.user?.id || "Inconnu"})
                      </td>
                      <td>
                        {log.created_at
                          ? format(
                              new Date(log.created_at),
                              "dd/MM/yyyy HH:mm:ss"
                            )
                          : "Date non disponible"}
                      </td>
                      <td
                        className={`${getActionColor(
                          log.action
                        )} text-white text-center text-uppercase`}
                      >
                        {log.action}
                      </td>
                      <td>
                        <span className="text-uppercase">
                          [{log.table_concernee || "Non disponible"}]
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleShowDetails(log)}
                          className="btn btn-info btn-sm"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Aucun log trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Modal pour afficher les détails d'un log */}
            <Modal
              show={showDetailsModal}
              onHide={handleCloseDetailsModal}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Détails du Log</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedLog && (
                  <div className="container">
                    <h5 className="fw-bold">• Infos Utilisateur :</h5>
                    <div className="row mb-2">
                      <div className="col-6 fw-bold">Nom :</div>
                      <div className="col-6">
                        {selectedLog.user_nom || "Inconnu"} (ID:{" "}
                        {selectedLog.user?.id || "Inconnu"})
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6 fw-bold">Prenom :</div>
                      <div className="col-6">
                        {selectedLog.user_prenom || "Inconnu"}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6 fw-bold">Créé le :</div>
                      <div className="col-6">
                        {selectedLog.user_doc || "Inconnu"}
                      </div>
                    </div>

                    <div className="row mb-2 mx-auto">
                      -----------------------
                    </div>
                    <div className="row mb-2">
                      <h5 className="fw-bold">• Infos Log :</h5>
                      <div className="col-6 fw-bold">Date :</div>
                      <div className="col-6">
                        {selectedLog.created_at
                          ? format(
                              new Date(selectedLog.created_at),
                              "dd/MM/yyyy HH:mm:ss"
                            )
                          : "Non disponible"}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6 fw-bold">Action :</div>
                      <div className="col-6 text-uppercase">
                        {selectedLog.action || "Non disponible"}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6 fw-bold">Table concernée :</div>
                      <div className="col-6 text-uppercase">
                        {selectedLog.table_concernee || "Non disponible"}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6 fw-bold">Détails :</div>
                      <div className="col-6">
                        {selectedLog.details || "Aucun détail disponible"}
                      </div>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseDetailsModal}>
                  Fermer
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Pagination */}
            <nav>
              <ul className="pagination justify-content-center">
                {/* Bouton Précédent */}
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Précédent
                  </button>
                </li>

                {/* Affichage dynamique des pages */}
                {[...Array(totalPages).keys()]
                  .map((_, index) => index + 1)
                  .filter((page) => {
                    // Afficher les 3 premières pages, la dernière, ou les pages autour de la page actuelle
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, filteredPages) => (
                    <React.Fragment key={page}>
                      {/* Ajoute "..." si une différence entre deux pages dépasse 1 */}
                      {index > 0 && page !== filteredPages[index - 1] + 1 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      {/* Bouton de la page */}
                      <li
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    </React.Fragment>
                  ))}

                {/* Bouton Suivant */}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Suivant
                  </button>
                </li>
              </ul>
            </nav>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Logs;
