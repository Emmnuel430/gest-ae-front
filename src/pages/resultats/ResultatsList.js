import React, { useState, useEffect } from "react"; // Importation des hooks React
import { Table, Modal, Button } from "react-bootstrap"; // Composants Bootstrap utilisés pour l'UI
import Layout from "../../components/Layout/Layout"; // Composant Layout, probablement utilisé pour la mise en page générale
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Composant popup pour confirmation d'actions
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter"; // Composant affichant un en-tête avec filtre de recherche
import Loader from "../../components/Layout/Loader"; // Composant pour afficher un spinner de chargement
import { format } from "date-fns"; // Utilisation de la librairie date-fns pour formater les dates
import SearchBar from "../../components/Layout/SearchBar"; // Composant pour la barre de recherche
import { fetchWithToken } from "../../utils/fetchWithToken";

const Resultats = () => {
  // Définition des états nécessaires à l'application
  const [resultats, setResultats] = useState([]); // Stockage des résultats des examens
  const [filter, setFilter] = useState(""); // Filtre appliqué aux résultats (par type)
  const [loading, setLoading] = useState(true); // Indicateur de chargement des données
  const [error, setError] = useState(null); // Erreur potentielle lors du chargement des résultats
  const [showModal, setShowModal] = useState(false); // Contrôle de l'affichage du modal de confirmation
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Contrôle de l'affichage du modal de détails
  const [selectedResultat, setSelectedResultat] = useState(null); // Résultat sélectionné pour voir les détails
  const [actionType, setActionType] = useState(""); // Type d'action (retirer ou supprimer)
  const [sortOption, setSortOption] = useState(""); // Option de tri
  const [sortedResultats, setSortedResultats] = useState([]); // Liste triée des résultats
  const [searchQuery, setSearchQuery] = useState(""); // Requête de recherche pour filtrer les users

  // Hook useEffect pour charger les résultats dès le premier rendu du composant
  useEffect(() => {
    const fetchResultats = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/resultats`
        ); // Appel à l'API pour récupérer les résultats
        const data = await response.json();
        setResultats(data.resultats); // Mise à jour des résultats
        setLoading(false); // Fin du chargement
      } catch (err) {
        setError("Erreur lors de la récupération des résultats."); // Gérer l'erreur si l'API échoue
        setLoading(false); // Fin du chargement
      }
    };

    fetchResultats(); // Appel de la fonction pour charger les données
  }, []);

  // Fonction pour ouvrir le modal de détails d'un résultat
  const handleShowDetails = (resultat) => {
    setSelectedResultat(resultat);

    setShowDetailsModal(true);
  };

  // Fonction pour fermer le modal de détails
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedResultat(null);
  };

  // Ouvre le modal de confirmation pour retirer un résultat
  const handleConfirmRetirer = (resultat) => {
    setSelectedResultat(resultat);
    setActionType("retirer"); // Définit l'action en cours
    setShowModal(true); // Affiche le modal de confirmation
  };

  // Ouvre le modal de confirmation pour supprimer un résultat
  const handleConfirmDelete = (resultat) => {
    setSelectedResultat(resultat);
    setActionType("supprimer");
    setShowModal(true);
  };

  // Ferme le modal de confirmation sans effectuer l'action
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResultat(null);
    setActionType("");
  };

  // Fonction pour retirer un résultat (mettre à jour le statut)
  const handleRetirer = async () => {
    if (!selectedResultat) return; // Si aucun résultat n'est sélectionné, on ne fait rien
    const userInfo = JSON.parse(localStorage.getItem("user-info")); // Récupérer l'utilisateur connecté
    const userId = userInfo ? userInfo.id : null;

    if (!userId) {
      alert("Utilisateur non authentifié. Veuillez vous connecter.");
      navigate("/"); // Redirige l'utilisateur si non authentifié
      return;
    }

    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/update_resultat/${selectedResultat.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUser: userId, // ID de l'utilisateur effectuant l'action
            statut: true, // Mark as retiré
          }),
        }
      );

      if (!response.ok) throw new Error("Échec de la mise à jour"); // Gestion des erreurs

      // Mise à jour locale du tableau des résultats
      setResultats((prevResultats) =>
        prevResultats.map((resultat) =>
          resultat.id === selectedResultat.id
            ? { ...resultat, statut: 1 } // Statut 1 signifie "Retiré"
            : resultat
        )
      );

      setShowModal(false); // Ferme le modal
      alert("Résultat marqué comme retiré."); // Affiche un message de confirmation
      setSelectedResultat(null); // Réinitialisation de la sélection
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut."); // Affichage des erreurs
    }
  };

  // Fonction pour supprimer un résultat
  const handleDelete = async () => {
    if (!selectedResultat) return; // Si aucun résultat n'est sélectionné, on ne fait rien

    const userInfo = JSON.parse(localStorage.getItem("user-info"));
    const userId = userInfo ? userInfo.id : null;

    if (!userId) {
      alert("Utilisateur non authentifié. Veuillez vous connecter.");
      return;
    }

    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/delete_resultat/${selectedResultat.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUser: userId, // ID de l'utilisateur effectuant l'action
          }),
        }
      );

      if (!response.ok) throw new Error("Échec de la suppression");

      // Mise à jour locale pour supprimer le résultat
      setResultats((prevResultats) =>
        prevResultats.filter((resultat) => resultat.id !== selectedResultat.id)
      );

      setShowModal(false); // Ferme le modal
      alert("Résultat supprimé."); // Affiche un message de confirmation
      setSelectedResultat(null); // Réinitialisation de la sélection
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  // Fonction pour formater un numéro de téléphone
  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, "$1 "); // Formate le numéro en groupes de 2 chiffres
  };

  const filteredResultats = sortedResultats.filter(
    (resultat) =>
      resultat.etudiant.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resultat.etudiant.prenom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mt-2">
        {/* Affichage des erreurs ou du loader */}
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
            {/* Barre de recherche */}
            <SearchBar
              placeholder="Rechercher un résultat..."
              onSearch={(query) => setSearchQuery(query)}
              delay={300}
            />
            {/* En-tête avec filtre et tri */}
            <HeaderWithFilter
              title="Résultats"
              link="/add/resultat"
              linkText="Ajouter"
              main={resultats.length || null}
              filter={filter}
              setFilter={setFilter}
              filterOptions={[
                { value: "", label: "Tous les résultats" },
                { value: "code", label: "Examen de Code" },
                { value: "conduite", label: "Examen de Conduite" },
              ]}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={resultats}
              setSortedList={setSortedResultats}
              dateField="created_at"
            />

            <Table
              className="table table-striped table-hover text-center"
              responsive
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Retiré</th>
                  <th>Statut</th>
                  <th>ID Étudiant</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Type</th>
                  <th>Date d'enregistrement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResultats.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Aucune donnée trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredResultats
                    .filter(
                      (resultat) => !filter || resultat.libelle === filter
                    ) // Applique le filtre
                    .sort((a, b) => a.statut - b.statut) // Trie les résultats par statut
                    .map((resultat, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={resultat.statut === 1}
                            onChange={() => handleConfirmRetirer(resultat)}
                            className="form-check-input"
                            disabled={resultat.statut === 1}
                          />
                        </td>
                        <td>
                          {resultat.statut === 1 ? (
                            <span className="badge bg-success">Retiré</span>
                          ) : (
                            <span className="badge bg-danger">Non Retiré</span>
                          )}
                        </td>
                        <td>etu-{resultat.idEtudiant}</td>
                        <td>{resultat.etudiant?.nom || "N/A"}</td>
                        <td>{resultat.etudiant?.prenom || "N/A"}</td>

                        <td
                          className={`text-uppercase ${
                            resultat.libelle === "code"
                              ? "bg-info text-white"
                              : "bg-warning text-white"
                          }`}
                        >
                          {resultat.libelle}
                        </td>
                        <td>
                          {format(
                            new Date(resultat.created_at),
                            "dd/MM/yyyy HH:mm:ss"
                          )}
                        </td>
                        {/* <td>
                      {resultat.updated_at === resultat.created_at
                        ? "-"
                        : format(
                            new Date(resultat.updated_at),
                            "dd/MM/yyyy HH:mm:ss"
                          )}
                    </td> */}
                        <td>
                          <button
                            onClick={() => handleShowDetails(resultat)}
                            className="btn btn-info btn-sm me-2"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(resultat)}
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
          </>
        )}

        {/* Modal de détails */}
        <Modal
          show={showDetailsModal}
          onHide={handleCloseDetailsModal}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Détails du Résultat</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedResultat && (
              <div className="container">
                <div className="row mb-2">
                  <div className="col-6 fw-bold">ID Étudiant :</div>
                  <div className="col-6">etu-{selectedResultat.idEtudiant}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Nom :</div>
                  <div className="col-6">
                    {selectedResultat.etudiant?.nom || "N/A"}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Prénom(s) :</div>
                  <div className="col-6">
                    {selectedResultat.etudiant?.prenom || "N/A"}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Identidiants :</div>
                  <div className="col-6">
                    {selectedResultat.etudiant?.type_piece || "N/A"} -{" "}
                    {selectedResultat.etudiant?.num_piece || "N/A"}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Numéro de téléphone :</div>
                  <div className="col-6">
                    {formatPhoneNumber(
                      selectedResultat.etudiant?.num_telephone
                    ) || "N/A"}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Type :</div>
                  <div className="col-6 text-capitalize">
                    {selectedResultat.libelle}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Statut :</div>
                  <div className="col-6">
                    {selectedResultat.statut === 1 ? (
                      <span className="badge bg-success">Retiré</span>
                    ) : (
                      <span className="badge bg-danger">Non Retiré</span>
                    )}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Date de réception :</div>
                  <div className="col-6">
                    {format(
                      new Date(selectedResultat.created_at),
                      "dd/MM/yyyy HH:mm:ss"
                    )}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Retiré le :</div>
                  <div className="col-6">
                    {selectedResultat.updated_at === selectedResultat.created_at
                      ? "-"
                      : format(
                          new Date(selectedResultat.updated_at),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
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

        {/* Modal de confirmation */}
        <ConfirmPopup
          show={showModal}
          onClose={handleCloseModal}
          onConfirm={actionType === "retirer" ? handleRetirer : handleDelete}
          title="Confirmer l'action"
          body={<p>Confirmez-vous cette action ?</p>}
        />
      </div>
    </Layout>
  );
};

export default Resultats;
