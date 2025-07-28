import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../../components/Layout/Loader";
import Layout from "../../components/Layout/Layout";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter";
import SearchBar from "../../components/Layout/SearchBar"; // Composant pour la barre de recherche
import { fetchWithToken } from "../../utils/fetchWithToken";
import eventBus from "../../utils/eventBus";

const MoniteurList = () => {
  // États pour stocker les moniteurs, le statut de chargement et les erreurs
  const [moniteurs, setMoniteurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeState, setTimeState] = useState(Date.now()); // Met à jour l'affichage du temps
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState(""); // Filtre pour les spécialités
  const [sortOption, setSortOption] = useState(""); // Option de tri
  const [sortedMoniteurs, setSortedMoniteurs] = useState([]); // Liste triée des moniteurs
  const [searchQuery, setSearchQuery] = useState(""); // Requête de recherche pour filtrer les users

  // États pour gérer la suppression des moniteurs
  const [showModal, setShowModal] = useState(false);
  const [selectedMoniteur, setSelectedMoniteur] = useState(null);

  // Chargement initial des moniteurs
  useEffect(() => {
    fetchMoniteurs();
    const interval = setInterval(() => {
      setTimeState(Date.now()); // Mise à jour de l'affichage du temps
    }, 59000);

    return () => clearInterval(interval);
  }, [location]);

  // Fonction pour ouvrir le modal de confirmation de suppression
  const handleOpenModal = (moniteur) => {
    setSelectedMoniteur(moniteur);
    setShowModal(true);
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMoniteur(null);
  };

  // Suppression d'un moniteur
  const handleDelete = async () => {
    if (!selectedMoniteur) return;

    setLoading(selectedMoniteur.id);
    try {
      await deleteOperation(selectedMoniteur.id);
    } catch (error) {
      console.error("Error deleting moniteur:", error);
    } finally {
      setLoading(null);
      handleCloseModal();
    }
  };

  // Récupération des moniteurs depuis l'API
  const fetchMoniteurs = async () => {
    setLoading(true);
    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/liste_moniteur`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des moniteurs.");
      }
      const data = await response.json();
      setMoniteurs(data.moniteurs);
    } catch (err) {
      setError("Impossible de charger les données : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un moniteur via l'API
  const deleteOperation = async (id) => {
    setLoading(id);
    try {
      const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
      const userId = userInfo ? userInfo.id : null;

      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/");
        return;
      }

      const result = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/delete_moniteur/${id}`,
        {
          method: "DELETE",
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const response = await result.json();

      if (response.status === "deleted") {
        eventBus.emit("rappel_updated");
        alert("Moniteur supprimé !");
        setMoniteurs(moniteurs.filter((moniteur) => moniteur.id !== id));
      } else {
        alert("Échec de la suppression.");
      }
    } catch (err) {
      alert("Une erreur est survenue lors de la suppression.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Formatage de la date en format relatif
  const formatDateRelative = (date) => {
    const formatted = formatDistanceToNow(new Date(date), {
      addSuffix: false, // Pas de suffixe (ex. "il y a")
      locale: fr, // Locale française
    });

    if (/moins d.?une minute/i.test(formatted)) {
      return "À l'instant"; // Cas particulier pour "moins d'une minute"
    }

    // Remplacements pour abréger les unités de temps
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
      shortened = shortened.replace(regex, replacement); // Applique les remplacements
    });

    return shortened; // Retourne la version abrégée
  };

  const filteredMoniteurs = sortedMoniteurs.filter(
    (moniteur) =>
      (!filter || moniteur.specialite === filter) &&
      (moniteur.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moniteur.prenom.toLowerCase().includes(searchQuery.toLowerCase())) // Filtre par nom ou prénom
  );

  return (
    <Layout>
      <div className="container mt-2">
        {/* Affichage des erreurs */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Table des moniteurs */}
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
              placeholder="Rechercher un moniteur..."
              onSearch={(query) => setSearchQuery(query)}
              delay={300}
            />
            {/* Barre de filtre et ajout de moniteur */}
            <HeaderWithFilter
              title="Moniteurs"
              link="/add/moniteur"
              linkText="Ajouter"
              main={
                sortedMoniteurs.filter(
                  (moniteur) => !filter || moniteur.specialite === filter
                ).length || null
              }
              filter={filter}
              setFilter={setFilter}
              filterOptions={[
                { value: "", label: "Toutes les spécialités" },
                { value: "code", label: "Code" },
                { value: "conduite", label: "Conduite" },
              ]}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={moniteurs}
              setSortedList={setSortedMoniteurs}
              alphaField="nom"
              dateField="created_at"
            />

            <Table className="centered-table" hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Nom & Prénom</th>
                  <th></th>
                  <th>Spécialité</th>
                  <th>M-A-J il y a</th>
                  <th>Opérations</th>
                </tr>
              </thead>

              <tbody>
                {filteredMoniteurs.length > 0 ? (
                  filteredMoniteurs.map((moniteur, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>moni-{moniteur.id}</td>
                      <td className="text-uppercase">
                        <strong>{moniteur.nom}</strong> {moniteur.prenom}
                      </td>
                      <td></td>
                      <td className={`text-uppercase`}>
                        <span
                          className={`badge ${
                            moniteur.specialite === "code"
                              ? "bg-info"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {moniteur.specialite}
                        </span>
                      </td>
                      <td>
                        {moniteur.created_at === moniteur.updated_at
                          ? "-"
                          : formatDateRelative(moniteur.updated_at)}
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/moniteur/${moniteur.id}`)}
                          className="btn btn-info btn-sm me-2"
                          title="Voir"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/update/moniteur/${moniteur.id}`)
                          }
                          className="btn btn-warning btn-sm me-2"
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleOpenModal(moniteur)}
                          className="btn btn-danger btn-sm"
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Aucune donnée trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </div>
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        body={
          <p>
            Voulez-vous vraiment supprimer{" "}
            <strong>
              {selectedMoniteur?.nom} {selectedMoniteur?.prenom}
            </strong>{" "}
            ?
          </p>
        } // Contenu du modal
      />
    </Layout>
  );
};

export default MoniteurList;
