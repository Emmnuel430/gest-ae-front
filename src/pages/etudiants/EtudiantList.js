// Importation des bibliothèques nécessaires
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table } from "react-bootstrap";
import Layout from "../../components/Layout/Layout";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter";
import Loader from "../../components/Layout/Loader";
import SearchBar from "../../components/Layout/SearchBar";
import { fetchWithToken } from "../../utils/fetchWithToken";

// Définition du composant principal
const EtudiantList = () => {
  // Déclaration des états locaux
  const [etudiants, setEtudiants] = useState([]); // Liste des étudiants
  const [selectedEtudiant, setSelectedEtudiant] = useState(null); // Étudiant sélectionné pour suppression
  const [sortOption, setSortOption] = useState(""); // Option de tri sélectionnée
  const [sortedEtudiants, setSortedEtudiants] = useState([]); // Liste triée des étudiants
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const etudiantsPerPage = 20; // Nombre d'étudiants par page

  // -----------
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [error, setError] = useState(""); // Message d'erreur
  const [timeState, setTimeState] = useState(Date.now()); // État pour forcer le re-rendu basé sur le temps
  const location = useLocation(); // Localisation actuelle (pour recharger les données)
  const [filter, setFilter] = useState(""); // Filtre pour les étudiants
  const [showModal, setShowModal] = useState(false); // Contrôle l'affichage du modal de confirmation
  const [searchQuery, setSearchQuery] = useState(""); // Requête de recherche pour filtrer les étudiants
  const [trierParSolde, setTrierParSolde] = useState(false);

  const navigate = useNavigate(); // Navigation entre les pages
  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userRole = userInfo ? userInfo.role : null;

  // Effet pour charger les étudiants et mettre à jour le temps périodiquement
  useEffect(() => {
    fetchEtudiants(); // Charge les étudiants au montage du composant
    const interval = setInterval(() => {
      setTimeState(Date.now()); // Met à jour l'état pour forcer un re-rendu
    }, 59000); // Intervalle de 59 secondes

    return () => clearInterval(interval); // Nettoie l'intervalle lors du démontage
  }, [location]); // Déclenche l'effet lors d'un changement de localisation

  useEffect(() => {
    if (!Array.isArray(etudiants)) return; // Sécurité : vérifie que etudiants est un tableau
    // Tri par défaut du plus récent au plus ancien
    setSortedEtudiants(
      [...etudiants].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    );
  }, [etudiants]); // Déclenche le tri lorsque la liste des étudiants change

  // Fonction pour ouvrir le modal de confirmation
  const handleOpenModal = (etudiant) => {
    setSelectedEtudiant(etudiant); // Définit l'étudiant à supprimer
    setShowModal(true); // Affiche le modal
  };

  // Fonction pour fermer le modal de confirmation
  const handleCloseModal = () => {
    setShowModal(false); // Cache le modal
    setSelectedEtudiant(null); // Réinitialise l'étudiant sélectionné
  };

  // Fonction pour gérer la suppression d'un étudiant
  const handleDelete = async () => {
    if (!selectedEtudiant) return; // Vérifie si un étudiant est sélectionné

    setLoading(selectedEtudiant.id); // Active le spinner pour l'étudiant sélectionné
    try {
      await deleteOperation(selectedEtudiant.id); // Exécute la suppression
    } catch (error) {
      setError("Erreur lors de la suppression :" + error); // Affiche les erreurs
    } finally {
      setLoading(null); // Désactive le spinner
      handleCloseModal(); // Ferme le modal
    }
  };

  // Fonction pour récupérer la liste des étudiants depuis l'API
  const fetchEtudiants = async () => {
    setLoading(true); // Active le spinner global
    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/liste_etudiant`
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

  // Fonction pour supprimer un étudiant
  const deleteOperation = async (id) => {
    setLoading(id); // Active le spinner pour l'étudiant en cours de suppression
    try {
      // Récupère les infos utilisateur
      const userId = userInfo ? userInfo.id : null; // Vérifie si l'utilisateur est connecté

      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/");
        return;
      }

      const result = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/delete_etudiant/${id}`,
        {
          method: "DELETE", // Méthode HTTP DELETE
          headers: {
            "Content-Type": "application/json", // En-tête JSON
          },
          body: JSON.stringify({ user_id: userId }), // Envoie l'ID utilisateur
        }
      );

      const response = await result.json(); // Parse la réponse JSON

      if (response.status === "deleted") {
        alert("Etudiant supprimé !"); // Alerte de succès
        setEtudiants(etudiants.filter((etudiant) => etudiant.id !== id)); // Met à jour la liste
      } else {
        alert("Échec de la suppression."); // Alerte d'échec
      }
    } catch (err) {
      alert("Une erreur est survenue lors de la suppression." + err); // Alerte d'erreur
      console.error(err); // Log de l'erreur
    } finally {
      setLoading(false); // Désactive le spinner
    }
  };

  // Fonction pour formater l'étape d'un étudiant
  function formatEtape(etape) {
    if (!etape) return "";

    const words = etape.split("_").map((word) => word.toLowerCase()); // Tout mettre en minuscule

    // Mettre la première lettre du premier mot en majuscule
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    // Regrouper les mots, avec un retour à la ligne tous les 2 mots
    const lines = [];
    for (let i = 0; i < words.length; i += 2) {
      lines.push(words.slice(i, i + 2).join(" "));
    }

    return lines.join("\n");
  }

  const filteredEtudiants = sortedEtudiants.filter((etudiant) => {
    const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, " ");
    const fullName = normalize(`${etudiant.nom} ${etudiant.prenom}`);
    const reversedFullName = normalize(`${etudiant.prenom} ${etudiant.nom}`);
    const query = normalize(searchQuery);

    return (
      (!filter || etudiant.motif_inscription === filter) &&
      (fullName.includes(query) || reversedFullName.includes(query))
    );
  });

  const totalPages = Math.ceil(filteredEtudiants.length / etudiantsPerPage);
  const startIndex = (currentPage - 1) * etudiantsPerPage;
  const currentEtudiants = filteredEtudiants.slice(
    startIndex,
    startIndex + etudiantsPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Rendu du composant
  return (
    <Layout>
      <div className="container mt-2">
        {/* Affichage des erreurs */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Affichage du spinner ou du tableau */}
        {loading === true ? (
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
              placeholder="Rechercher un étudiant..."
              onSearch={(query) => setSearchQuery(query)}
              delay={300}
            />
            {/* En-tête avec filtre */}
            <HeaderWithFilter
              title="Étudiants"
              link="/add/etudiant"
              linkText="Ajouter"
              main={
                sortedEtudiants.filter(
                  (etudiant) => !filter || etudiant.motif_inscription === filter
                ).length || null
              }
              filter={filter}
              setFilter={setFilter}
              filterOptions={[
                { value: "", label: "Tous les inscrits" },
                { value: "permis", label: "Permis" },
                { value: "recyclage", label: "Recyclage" },
              ]}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={etudiants} // Liste des étudiants ou autre
              setSortedList={setSortedEtudiants}
              alphaField="nom" // Peut être "prenom", "titre", etc.
              dateField="created_at" // Peut être "dateInscription", "dateAjout"
            />
            <div className="form-check form-switch mb-3">
              <label className="form-check-label" htmlFor="switchSolde">
                Afficher les non soldés en haut
              </label>

              <input
                className="form-check-input"
                type="checkbox"
                id="switchSolde"
                checked={trierParSolde}
                onChange={(e) => setTrierParSolde(e.target.checked)}
              />
            </div>

            <Table
              style={{ tableLayout: "auto" }}
              className="centered-table"
              hover
              responsive
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Nom & Prénom</th>
                  <th>Scolarité</th>
                  <th>Etape</th>
                  <th>Réduction</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Filtrage et affichage des étudiants */}
                {currentEtudiants.length > 0 ? (
                  currentEtudiants
                    .sort((a, b) => {
                      if (!trierParSolde) return 0;
                      const aSolde = a.montant_paye == a.scolarite;
                      const bSolde = b.montant_paye == b.scolarite;
                      if (aSolde === bSolde) return 0;
                      return aSolde ? 1 : -1; // Soldé en bas
                    })
                    .map((etudiant, index) => {
                      const isDisabled =
                        userRole === false &&
                        etudiant?.progression?.etape ===
                          "programmé_pour_la_conduite";

                      return (
                        <tr
                          key={index}
                          style={isDisabled ? { opacity: 0.5 } : {}}
                        >
                          <td>{index + 1}</td>
                          <td>ETU-{etudiant.id}</td>
                          <td className="text-uppercase">
                            <strong>{etudiant.nom}</strong>{" "}
                            {etudiant.prenom.split(" ")[0]}
                          </td>
                          <td>
                            {etudiant.montant_paye == etudiant.scolarite ? (
                              <span className="badge bg-success">Soldé</span>
                            ) : (
                              <span className="badge bg-danger">Pas soldé</span>
                            )}
                          </td>
                          <td>
                            {etudiant.progression?.etape ? (
                              <span
                                className={`badge text-white bg-primary`}
                                style={{ whiteSpace: "pre-line" }}
                              >
                                {formatEtape(etudiant.progression.etape)}
                              </span>
                            ) : (
                              <span className="badge bg-secondary text-white">
                                N/A
                              </span>
                            )}
                          </td>
                          <td>
                            {etudiant.reduction && (
                              <span className="badge bg-warning text-dark ms-1">
                                Oui
                              </span>
                            )}
                          </td>
                          <td className="table-operations">
                            <div className="d-flex align-items-stretch justify-content-center gap-2 h-100">
                              {/* Bouton pour voir les détails */}
                              <button
                                onClick={() =>
                                  navigate(`/etudiant/${etudiant.id}`)
                                }
                                className="btn btn-info btn-sm me-2"
                                title="Voir"
                                disabled={isDisabled}
                                style={
                                  isDisabled ? { cursor: "not-allowed" } : {}
                                }
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              {/* Bouton pour modifier */}
                              <button
                                onClick={() =>
                                  navigate(`/update/etudiant/${etudiant.id}`)
                                }
                                className="btn btn-warning btn-sm me-2"
                                title="Modifier"
                                disabled={isDisabled}
                                style={
                                  isDisabled ? { cursor: "not-allowed" } : {}
                                }
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              {/* Bouton pour supprimer */}
                              <button
                                onClick={() => handleOpenModal(etudiant)}
                                className="btn btn-danger btn-sm"
                                title="Supprimer"
                                disabled={loading === etudiant.id || isDisabled}
                                style={
                                  isDisabled ? { cursor: "not-allowed" } : {}
                                }
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Aucun etudiant trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            <nav>
              <ul className="pagination justify-content-center">
                {/* Précédent */}
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

                {/* Pages */}
                {[...Array(totalPages).keys()].map((_, index) => {
                  const page = index + 1;
                  return (
                    <li
                      key={page}
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
                  );
                })}

                {/* Suivant */}
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

        {/* Modal de confirmation */}
        <ConfirmPopup
          show={showModal} // Affichage du modal
          onClose={handleCloseModal} // Fonction pour fermer le modal
          onConfirm={handleDelete} // Fonction pour confirmer la suppression
          title="Confirmer la suppression" // Titre du modal
          body={
            <p>
              Voulez-vous vraiment supprimer{" "}
              <strong>
                {selectedEtudiant?.nom} {selectedEtudiant?.prenom}
              </strong>{" "}
              ?
            </p>
          } // Contenu du modal
        />
      </div>
    </Layout>
  );
};

// Exportation du composant
export default EtudiantList;
