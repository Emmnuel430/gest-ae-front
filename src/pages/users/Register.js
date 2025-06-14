import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Importation du modal de confirmation
import ToastMessage from "../../components/Layout/ToastMessage";

const Register = () => {
  // États pour stocker les données du formulaire et d'autres informations d'état
  const [nom, setNom] = useState(""); // Nom de l'utilisateur
  const [prenom, setPrenom] = useState(""); // Prénom de l'utilisateur
  const [pseudo, setPseudo] = useState(""); // Pseudo de l'utilisateur
  const [password, setPassword] = useState(""); // Mot de passe de l'utilisateur
  const [role, setRole] = useState(false); // Rôle de l'utilisateur (false = Staff, true = Admin)
  const [loading, setLoading] = useState(false); // Indicateur de chargement lors de la soumission
  const [error, setError] = useState(""); // Message d'erreur en cas de problème
  const [showModal, setShowModal] = useState(false); // Contrôle l'affichage du modal de confirmation
  const navigate = useNavigate(); // Hook pour la navigation

  // Récupération de l'utilisateur actuellement connecté depuis le localStorage
  const userInfo = JSON.parse(localStorage.getItem("user-info"));
  const userId = userInfo ? userInfo.id : null;

  // Si aucun utilisateur n'est authentifié, on redirige vers la page de connexion
  if (!userId) {
    alert("Utilisateur non authentifié. Veuillez vous connecter.");
    navigate("/");
    return;
  }

  // Fonction pour confirmer l'inscription
  const handleConfirm = () => {
    setShowModal(false); // Ferme le modal
    signUp(); // Lance la fonction d'inscription
  };

  // Fonction pour annuler l'inscription et fermer le modal
  const handleCancel = () => {
    setShowModal(false);
  };

  // Fonction pour envoyer les données du formulaire au backend
  const signUp = async () => {
    // Vérification que tous les champs sont remplis
    if (!nom || !prenom || !pseudo || !password) {
      setError("Tous les champs sont requis.");
      return;
    }

    setError(""); // Réinitialise l'erreur
    setLoading(true); // Active le chargement

    try {
      // Données à envoyer au serveur
      const item = { nom, prenom, pseudo, password, role, admin_id: userId };

      // Envoi des données au backend avec une requête POST
      let result = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/add_user`,
        {
          method: "POST",
          body: JSON.stringify(item),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      result = await result.json();

      // Si une erreur est retournée par le serveur, on l'affiche et on désactive le chargement
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setLoading(false); // Désactive le chargement
      alert("Utilisateur enregistré"); // Message de confirmation
      setNom(""); // Réinitialise les champs du formulaire
      setPrenom("");
      setPseudo("");
      setPassword("");
      setRole(false);
      navigate("/utilisateurs"); // Redirige vers la liste des utilisateurs
    } catch (e) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer."); // En cas d'erreur serveur
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Back>utilisateurs</Back>
      <div className="col-sm-6 offset-sm-3 mt-5">
        <h1>Création d'un nouvel utilisateur</h1>

        {/* Affichage d'un message d'erreur si nécessaire */}
        {error && <ToastMessage message={error} onClose={() => setError("")} />}

        {/* Formulaire d'inscription */}
        <label htmlFor="nom" className="form-label">
          Nom
        </label>
        <input
          type="text"
          id="nom"
          className="form-control"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)} // Mise à jour de l'état pour le champ nom
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
          onChange={(e) => setPrenom(e.target.value)} // Mise à jour de l'état pour le champ prénom
        />
        <br />

        <label htmlFor="pseudo" className="form-label">
          Pseudo
        </label>
        <input
          type="text"
          id="pseudo"
          className="form-control"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)} // Mise à jour de l'état pour le champ pseudo
        />
        <br />

        <label htmlFor="password" className="form-label">
          Mot de passe
        </label>
        <input
          type="password"
          id="password"
          className="form-control"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Mise à jour de l'état pour le champ mot de passe
        />
        <br />

        {/* Sélecteur du rôle de l'utilisateur (Admin ou Staff) */}
        <div className="mb-4">
          <h6>Rôle de l'utilisateur :</h6>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="roleSwitch"
              checked={role}
              onChange={(e) => setRole(e.target.checked)} // Mise à jour de l'état pour le rôle
            />
            <label className="form-check-label" htmlFor="roleSwitch">
              {role ? "Administrateur" : "Staff"}
            </label>
          </div>
        </div>

        {/* Bouton pour soumettre le formulaire avec un modal de confirmation */}
        <button
          onClick={() => setShowModal(true)} // Ouvre le modal de confirmation
          className="btn btn-primary w-100"
          disabled={!nom || !prenom || !pseudo || !password || loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>{" "}
              En cours...
            </>
          ) : (
            "Ajouter"
          )}
        </button>
      </div>

      {/* Modal de confirmation avant de soumettre l'inscription */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCancel} // Annule et ferme le modal
        onConfirm={handleConfirm} // Confirme l'inscription et ferme le modal
        title="Confirmer l'inscription"
        body={<p>Voulez-vous vraiment ajouter cet utilisateur ?</p>}
      />
    </Layout>
  );
};

export default Register;
