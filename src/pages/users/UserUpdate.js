import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Importation du popup de confirmation
import { fetchWithToken } from "../../utils/fetchWithToken";
import Loader from "../../components/Layout/Loader";

const UserUpdate = () => {
  // Récupération de l'ID de l'utilisateur à partir des paramètres d'URL
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(""); // État pour les erreurs
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    nom: "",
    prenom: "",
    pseudo: "",
    newPassword: "",
  }); // État pour stocker les données de l'utilisateur
  const [loading, setLoading] = useState(false); // État pour gérer l'état de chargement
  const [load, setLoad] = useState(false);
  const [showModal, setShowModal] = useState(false); // État pour afficher ou non le modal de confirmation
  const [showPasswordInput, setShowPasswordInput] = useState(false); // État pour afficher ou masquer le champ de mot de passe

  const userInfo = JSON.parse(sessionStorage.getItem("user-info")); // Récupérer les informations de l'utilisateur connecté
  const userId = userInfo ? userInfo.id : null; // Récupérer l'ID de l'utilisateur connecté

  // Hook useEffect qui se déclenche une fois au montage du composant
  useEffect(() => {
    fetchUser(); // Appel de la fonction pour récupérer les données de l'utilisateur
  }, []);

  // Fonction pour récupérer les données d'un utilisateur via l'API
  const fetchUser = async () => {
    setError(""); // Réinitialisation de l'erreur avant chaque appel
    try {
      setLoad(true);
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/user/${id}`
      ); // Requête pour récupérer l'utilisateur
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des données utilisateur."
        );
      }
      const data = await response.json(); // Parse de la réponse JSON
      setUser({ ...data.user, newPassword: "" }); // Mise à jour des données utilisateur
    } catch (error) {
      setError("Erreur lors de la récupération des données utilisateur.");
    } finally {
      setLoad(false);
    }
  };

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value }); // Mise à jour du champ modifié
  };

  // Fonction pour confirmer la modification de l'utilisateur
  const handleConfirm = () => {
    setShowModal(false); // Ferme le modal
    updateUser(); // Appel de la fonction de mise à jour
  };

  // Fonction pour annuler la modification et fermer le modal
  const handleCancel = () => {
    setShowModal(false); // Ferme le modal
  };

  // Fonction pour mettre à jour les données de l'utilisateur via l'API
  const updateUser = async () => {
    setError(""); // Réinitialisation de l'erreur avant la mise à jour
    setLoading(true); // Indique que l'on est en cours de traitement
    try {
      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/"); // Si l'utilisateur n'est pas authentifié, redirige vers la page de connexion
        return;
      }

      const { nom, prenom, pseudo, newPassword } = user;
      const body = { nom, prenom, pseudo }; // Création du corps de la requête

      if (newPassword) {
        body.password = newPassword; // Si un nouveau mot de passe est fourni, l'ajouter au corps
      }

      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/update_user/${id}`,
        {
          method: "POST",
          body: JSON.stringify({
            ...body,
            user_id: userId,
          }),
        }
      );

      const data = await response.json(); // Parse de la réponse JSON

      if (response.ok) {
        alert("Données mises à jour !");
        if (parseInt(userId) === parseInt(id)) {
          sessionStorage.setItem("user-info", JSON.stringify(data.user));
          // window.location.reload();
        }
        navigate("/utilisateurs"); // Redirige vers la liste des utilisateurs après la mise à jour
      } else {
        const errorResponse = await response.json();
        alert(errorResponse.message || "Échec de la mise à jour.");
      }
    } catch (error) {
      setError("Erreur lors de la mise à jour de l'utilisateur."); // Gère l'erreur éventuelle
    } finally {
      setLoading(false); // Fin du traitement
    }
  };

  return (
    <Layout>
      <Back>utilisateurs</Back>
      {error && <div className="alert alert-danger">{error}</div>}{" "}
      {load === true ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
        >
          <Loader />
        </div>
      ) : (
        <div className="col-sm-6 offset-sm-3">
          {/* Affiche les erreurs, s'il y en a */}
          <h1>Modifier les données de l'utilisateur</h1>
          <br />
          {/* Champs de formulaire pour modifier les données de l'utilisateur */}
          <label htmlFor="nom" className="form-label">
            Nom
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            className="form-control"
            placeholder="Nom"
            value={user.nom}
            onChange={handleChange} // Appel de la fonction de gestion des changements
          />
          <br />
          <label htmlFor="prenom" className="form-label">
            Prénom
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            className="form-control"
            placeholder="Prénom"
            value={user.prenom}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="pseudo" className="form-label">
            Pseudo
          </label>
          <input
            type="text"
            id="pseudo"
            name="pseudo"
            className="form-control"
            placeholder="Pseudo"
            value={user.pseudo}
            onChange={handleChange}
          />
          <br />
          <br />
          {/* Bouton pour afficher ou masquer le champ de mot de passe */}
          <button
            onClick={() => setShowPasswordInput(!showPasswordInput)}
            className="btn btn-secondary w-100"
          >
            {showPasswordInput
              ? "Masquer le champ de mot de passe"
              : "Modifier le mot de passe"}
          </button>
          <br />
          <br />
          {showPasswordInput && (
            <>
              {/* Champ pour modifier le mot de passe */}
              <label htmlFor="newPassword" className="form-label">
                Nouveau mot de passe
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  className="form-control"
                  placeholder="Nouveau mot de passe *"
                  value={user.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-outline-secondary"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              <small className="text-muted">
                * Laissez vide si vous ne souhaitez pas modifier le mot de
                passe.
              </small>
              <br />
            </>
          )}
          <br />
          {/* Bouton pour valider la modification */}
          <button
            onClick={() => setShowModal(true)} // Ouvre le modal de confirmation
            className="btn btn-primary w-100"
            disabled={loading} // Désactive le bouton pendant le chargement
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>{" "}
                Modification...
              </>
            ) : (
              "Modifier"
            )}
          </button>
        </div>
      )}
      {/* Modal de confirmation */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmer la modification"
        body={<p>Voulez-vous vraiment modifier cet utilisateur ?</p>}
      />
    </Layout>
  );
};

export default UserUpdate;
