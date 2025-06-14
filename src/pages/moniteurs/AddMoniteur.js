import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";

const AddMoniteur = () => {
  // États pour gérer les champs du formulaire et les interactions
  const [nom, setNom] = useState(""); // Nom du moniteur
  const [prenom, setPrenom] = useState(""); // Prénom du moniteur
  const [specialite, setSpecialite] = useState(""); // Spécialité du moniteur
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [error, setError] = useState(""); // Message d'erreur
  const [showModal, setShowModal] = useState(false); // État pour afficher ou cacher le modal
  const navigate = useNavigate(); // Hook pour naviguer entre les pages

  // Fonction pour afficher le modal après validation des champs
  const handleShowModal = () => {
    if (!nom || !prenom || !specialite) {
      setError("Tous les champs sont requis."); // Affiche une erreur si un champ est vide
      return;
    }
    setError(""); // Réinitialise l'erreur
    setShowModal(true); // Affiche le modal
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => setShowModal(false);

  // Fonction pour ajouter un moniteur
  const addMoniteur = async () => {
    setLoading(true); // Active l'indicateur de chargement

    try {
      // Récupération des informations de l'utilisateur connecté
      const userInfo = JSON.parse(localStorage.getItem("user-info"));
      const userId = userInfo ? userInfo.id : null;

      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter."); // Alerte si l'utilisateur n'est pas connecté
        navigate("/"); // Redirection vers la page d'accueil
        return;
      }

      // Création de l'objet moniteur
      const moniteur = {
        nom,
        prenom,
        specialite,
        user_id: userId,
      };

      // Envoi de la requête POST pour ajouter le moniteur
      let result = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/add_moniteur`,
        {
          method: "POST",
          body: JSON.stringify(moniteur),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      result = await result.json();

      if (result.error) {
        setError(result.error); // Affiche une erreur si la requête échoue
        setLoading(false);
        return;
      }

      // Succès : réinitialisation des champs et redirection
      alert("Moniteur ajouté avec succès");
      setNom("");
      setPrenom("");
      setSpecialite("");
      navigate("/moniteurs");
    } catch (e) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer."); // Gestion des erreurs inattendues
    } finally {
      setLoading(false); // Désactive l'indicateur de chargement
      setShowModal(false); // Ferme le modal
    }
  };

  return (
    <Layout>
      {/* Bouton pour revenir à la liste des moniteurs */}
      <Back>moniteurs</Back>
      <div className="col-sm-6 offset-sm-3 mt-5">
        <h1>Création d'un nouveau moniteur</h1>

        {/* Affichage des messages d'erreur */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Formulaire pour ajouter un moniteur */}
        <label htmlFor="nom" className="form-label">
          Nom
        </label>
        <input
          type="text"
          id="nom"
          className="form-control"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <br />

        <label htmlFor="prenom" className="form-label">
          Prénom
        </label>
        <input
          type="text"
          id="prenom"
          className="form-control"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />
        <br />

        <label htmlFor="specialite" className="form-label">
          Spécialité
        </label>
        <select
          id="specialite"
          className="form-control"
          value={specialite}
          onChange={(e) => setSpecialite(e.target.value)}
        >
          <option value="">Sélectionnez une spécialité</option>
          <option value="code">Code</option>
          <option value="conduite">Conduite</option>
        </select>
        <br />

        {/* Bouton pour soumettre le formulaire */}
        <button
          onClick={handleShowModal}
          disabled={!nom || !prenom || !specialite || loading}
          className="btn btn-primary w-100"
        >
          Ajouter
        </button>
      </div>

      {/* Composant ConfirmPopup pour confirmer l'ajout */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={addMoniteur}
        title="Confirmer l'ajout"
        body={
          <p>
            Êtes-vous sûr de vouloir ajouter le moniteur suivant ?
            <br />
            <strong>Nom :</strong> {nom} <br />
            <strong>Prénom :</strong> {prenom} <br />
            <strong>Spécialité :</strong> {specialite}
          </p>
        }
      />
      <br />
      <br />
    </Layout>
  );
};

export default AddMoniteur;
