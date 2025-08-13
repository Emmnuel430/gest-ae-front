import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import Layout from "../../components/Layout/Layout";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter";
import Loader from "../../components/Layout/Loader";
import { format } from "date-fns";
import { fetchWithToken } from "../../utils/fetchWithToken";

const ProgrammationList = () => {
  // États pour gérer les programmations, le chargement, les erreurs et le modal de confirmation
  const [programmations, setProgrammations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState(""); // Filtre pour les spécialités
  const [selectedProgrammation, setSelectedProgrammation] = useState(null);
  const [sortOption, setSortOption] = useState(null);
  const [sortedProgrammations, setSortedProgrammations] = useState([]);

  // Récupération des programmations depuis l'API
  useEffect(() => {
    const fetchProgrammations = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/programmations`
        );
        const data = await response.json();
        // console.log(data);

        setProgrammations(data.programmations); // Mise à jour de la liste des programmations
        setLoading(false);
      } catch (err) {
        setError("Erreur lors de la récupération des programmations.");
        setLoading(false);
      }
    };

    fetchProgrammations();
  }, []); // Exécution une seule fois au montage du composant

  // Ouvrir le modal avant suppression
  const handleOpenModal = (programmation) => {
    setSelectedProgrammation(programmation);
    setShowModal(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProgrammation(null);
  };

  // Suppression d'une programmation après confirmation
  const handleDelete = async () => {
    if (!selectedProgrammation) return;
    const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
    const userId = userInfo ? userInfo.id : null;

    if (!userId) {
      setError("Utilisateur non authentifié.");
      navigate("/");
      return;
    }

    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/programmations/${selectedProgrammation.id}?idUser=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Programmation supprimée !");
        setProgrammations(
          programmations.filter((p) => p.id !== selectedProgrammation.id)
        );
        handleCloseModal();
      } else {
        console.error("Erreur lors de la suppression.");
        setError("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      setError("Erreur réseau." + error + " Veuillez réessayer.");
    }
  };

  // Fonction pour formater une date en format lisible
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    let formattedDate = date
      .toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();

    return formattedDate.replace(
      /\b(\p{L}+)/u,
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
    );
  };

  const filteredProgs = sortedProgrammations.filter(
    (prog) => !filter || prog.type === filter // Filtre par nom ou prénom
  );

  return (
    <Layout>
      <div className="container mt-2">
        {/* Affichage d'une erreur si nécessaire */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Affichage du spinner de chargement */}
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
          >
            <Loader />
          </div>
        ) : (
          <>
            {/* En-tête avec bouton d'ajout */}
            <HeaderWithFilter
              title="Programmations"
              link="/add/programmation"
              linkText="+ Ajouter"
              main={filteredProgs.length || null}
              filter={filter}
              setFilter={setFilter}
              filterOptions={[
                { value: "", label: "Toutes les spécialités" },
                { value: "code", label: "Code" },
                { value: "conduite", label: "Conduite" },
              ]}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={programmations}
              setSortedList={setSortedProgrammations}
              dateField="created_at"
            />

            <Table
              className="table table-striped table-hover text-center"
              responsive
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Créé par</th>
                  <th>Type</th>
                  <th>Date de Prog.</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Affichage des programmations si disponibles */}
                {filteredProgs.length > 0 ? (
                  filteredProgs.map((programmation, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{programmation.user?.nom || "Inconnu"}</td>
                      <td className={`text-uppercase`}>
                        {programmation.type === "code" ? (
                          <span className="badge bg-info">
                            {programmation.type}
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            {programmation.type}
                          </span>
                        )}
                      </td>
                      <td>
                        {programmation.date_prog
                          ? formatDate(programmation.date_prog)
                          : "N/A"}
                      </td>
                      <td>
                        {format(
                          new Date(programmation.created_at),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
                      </td>
                      <td className="d-flex justify-content-center gap-2">
                        {/* Lien pour voir le fichier PDF si disponible */}
                        {programmation.fichier_pdf && (
                          <a
                            href={`${process.env.REACT_APP_API_BASE_URL_STORAGE}/storage/${programmation.fichier_pdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-sm"
                          >
                            Voir la fiche
                          </a>
                        )}
                        {/* Bouton de suppression */}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenModal(programmation)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      Aucune programmation disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </div>

      {/* Modal de confirmation pour la suppression */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        body={
          <p>
            Voulez-vous vraiment supprimer la programmation créée par{" "}
            <strong>{selectedProgrammation?.user?.nom || "Inconnu"}</strong> ?
          </p>
        }
      />
    </Layout>
  );
};

export default ProgrammationList;
