import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import { fetchWithToken } from "../../utils/fetchWithToken";
import Loader from "../../components/Layout/Loader";

const MoniteurUpdate = () => {
  const { id } = useParams(); // Récupère l'ID du moniteur depuis l'URL
  const navigate = useNavigate(); // Utilisé pour rediriger après la mise à jour

  // État pour stocker les informations du moniteur
  const [moniteur, setMoniteur] = useState({
    nom: "",
    prenom: "",
    specialite: "",
    num_telephone: "",
    num_telephone_2: "",
    email: "",
    commune: "",
  });

  const [error, setError] = useState(""); // Stocke les erreurs
  const [loading, setLoading] = useState(false); // Indique si une requête est en cours
  const [load, setLoad] = useState(false);
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
      setLoad(true);
      const response = await fetchWithToken(
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
        num_telephone: data.moniteur.num_telephone || "",
        num_telephone_2: data.moniteur.num_telephone_2 || "",
        email: data.moniteur.email || "",
        commune: data.moniteur.commune || "",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du moniteur:", error);
      setError(error.message || error);
    } finally {
      setLoad(false);
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
      // Récupération de l'utilisateur connecté depuis sessionStorage
      const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
      const userId = userInfo ? userInfo.id : null;

      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/");
        return;
      }

      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/update_moniteur/${id}`,
        {
          method: "POST",
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
        {/* Affichage des erreurs */}
        {error && <div className="alert alert-danger">{error}</div>}
        {load === true ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
          >
            <Loader />
          </div>
        ) : (
          <div className="col-sm-6 offset-sm-3">
            <h1>Modifier les données du moniteur</h1>
            <br />

            {/* Champ pour le nom */}
            <label htmlFor="nom" className="form-label">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              className="form-control"
              placeholder="Ex : Koffi"
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
              placeholder="Ex : Paul"
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

            <label htmlFor="num_telephone" className="form-label">
              N° Telephone
            </label>
            <input
              type="number"
              id="num_telephone"
              name="num_telephone"
              className="form-control"
              placeholder="Ex : 0011223344"
              value={moniteur.num_telephone}
              onChange={handleChange}
            />
            <br />

            <label htmlFor="num_telephone_2" className="form-label">
              N° Telephone (sécondaire)
            </label>
            <input
              type="number"
              id="num_telephone_2"
              name="num_telephone_2"
              className="form-control"
              placeholder="Ex : 0011223344"
              value={moniteur.num_telephone_2}
              onChange={handleChange}
            />
            <br />

            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Ex : koffi.paul@gmail.com"
              value={moniteur.email}
              onChange={handleChange}
            />
            <br />

            <label htmlFor="commune" className="form-label">
              Commune
            </label>
            <input
              type="text"
              id="commune"
              name="commune"
              className="form-control"
              placeholder="Ex : Plateau"
              value={moniteur.commune}
              onChange={handleChange}
            />
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
        )}

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
