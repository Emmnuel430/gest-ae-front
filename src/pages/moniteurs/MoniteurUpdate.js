import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";

const MoniteurUpdate = () => {
  const { id } = useParams(); // Récupère l'ID du moniteur depuis l'URL
  const navigate = useNavigate(); // Utilisé pour rediriger après la mise à jour

  // État pour stocker les informations du moniteur
  const [moniteur, setMoniteur] = useState({
    nom: "",
    prenom: "",
    specialite: "",
  });

  const [error, setError] = useState(""); // Stocke les erreurs
  const [loading, setLoading] = useState(false); // Indique si une requête est en cours
  const [showModal, setShowModal] = useState(false); // Gère l'affichage de la boîte de confirmation

  // Fonction pour fermer le modal de confirmation
  const handleCloseModal = () => setShowModal(false);

  // Charge les données du moniteur à l'affichage du composant
  useEffect(() => {
    fetchMoniteur();
  }, []);

  // Récupère les informations du moniteur depuis l'API
  const fetchMoniteur = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/moniteur/${id}`
      );
      if (!response.ok) {
        throw new Error("Échec de la récupération des détails du moniteur");
      }
      const data = await response.json();

      setMoniteur({
        nom: data.moniteur.nom || "",
        prenom: data.moniteur.prenom || "",
        specialite: data.moniteur.specialite || "",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du moniteur:", error);
      setError(error.message || error);
    }
  };

  // Met à jour les champs lors de la saisie utilisateur
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMoniteur({ ...moniteur, [name]: value });
  };

  // Envoie la mise à jour des informations du moniteur à l'API
  const updateMoniteur = async () => {
    setLoading(true);
    try {
      // Récupération de l'utilisateur connecté depuis localStorage
      const userInfo = JSON.parse(localStorage.getItem("user-info"));
      const userId = userInfo ? userInfo.id : null;

      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/update_moniteur/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...moniteur,
            user_id: userId, // Ajoute l'ID de l'utilisateur pour la traçabilité
          }),
        }
      );

      if (response.ok) {
        alert("Données mises à jour avec succès!");
        navigate("/moniteurs"); // Redirection vers la liste des moniteurs
      } else {
        const errorResponse = await response.json();
        alert(errorResponse.message || "Échec de la mise à jour du moniteur.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du moniteur:", error);
      setError(error.message || error);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div>
      <Layout>
        <Back>moniteurs</Back>
        <div className="col-sm-6 offset-sm-3">
          <h1>Modifier les données du moniteur</h1>
          <br />
          {/* Affichage des erreurs */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Champ pour le nom */}
          <label htmlFor="nom" className="form-label">
            Nom
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            className="form-control"
            placeholder="Nom"
            value={moniteur.nom}
            onChange={handleChange}
          />
          <br />

          {/* Champ pour le prénom */}
          <label htmlFor="prenom" className="form-label">
            Prénom
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            className="form-control"
            placeholder="Prénom"
            value={moniteur.prenom}
            onChange={handleChange}
          />
          <br />

          {/* Sélection de la spécialité */}
          <label htmlFor="specialite" className="form-label">
            Spécialité
          </label>
          <select
            id="specialite"
            name="specialite"
            className="form-control"
            value={moniteur.specialite}
            onChange={handleChange}
          >
            <option value="">Sélectionner une spécialité</option>
            <option value="code">Code</option>
            <option value="conduite">Conduite</option>
          </select>
          <br />

          {/* Bouton de modification */}
          <button
            onClick={() => setShowModal(true)} // Affiche la boîte de confirmation
            className="btn btn-primary w-100"
            disabled={loading} // Désactive le bouton pendant le chargement
          >
            Modifier
          </button>
        </div>

        {/* Utilisation du ConfirmPopup pour confirmer la mise à jour */}
        <ConfirmPopup
          show={showModal}
          onClose={handleCloseModal}
          onConfirm={updateMoniteur}
          title="Confirmer la modification"
          body={
            <p>
              Êtes-vous sûr de vouloir modifier les données de ce moniteur ?
            </p>
          }
        />
        <br />
        <br />
      </Layout>
    </div>
  );
};

export default MoniteurUpdate;
