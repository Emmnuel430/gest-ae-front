import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import { fetchWithToken } from "../../utils/fetchWithToken";
import ToastMessage from "../../components/Layout/ToastMessage";
import Loader from "../../components/Layout/Loader";
import eventBus from "../../utils/eventBus";

const EtudiantUpdate = () => {
  // Récupération des paramètres de l'URL et initialisation des états
  const { id } = useParams(); // ID de l'étudiant
  const navigate = useNavigate(); // Navigation après mise à jour
  const [error, setError] = useState(""); // Messages d'erreur
  const [etudiant, setEtudiant] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    num_telephone: "",
    num_telephone_2: "",
    motif_inscription: "",
    scolarite: "",
    montant_paye: "",
    progression: {
      id: null, // ID de la progression actuelle
      etape: "inscription", // Étape actuelle par défaut
    },
  });
  const [moniteurs, setMoniteurs] = useState([]); // Liste des moniteurs disponibles
  const [selectedMoniteur, setSelectedMoniteur] = useState(null); // Moniteur sélectionné
  const [montantPaye, setMontantPaye] = useState(0); // Montant additionnel à payer
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [load, setLoad] = useState(false);
  const [filter, setFilter] = useState(""); // Filtre pour les moniteurs
  const [showModal, setShowModal] = useState(false); // État pour afficher/masquer le modal

  // Charger les données de l'étudiant et des moniteurs au montage du composant
  useEffect(() => {
    fetchEtudiant(); // Récupérer les données de l'étudiant
    fetchMoniteurs(); // Récupérer la liste des moniteurs
  }, []);

  const handleCloseModal = () => setShowModal(false); // Fermer le modal

  // Calculer la date minimale autorisée (16 ans avant aujourd'hui)
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  // Met à jour le filtre en fonction de l'étape de progression
  useEffect(() => {
    setFilter(
      etudiant.progression.etape === "cours_de_code" ? "code" : "conduite"
    );
  }, [etudiant.progression.etape]);

  // Étapes possibles pour un étudiant
  const defaultSteps = [
    { value: "inscription", label: "Inscription" },
    { value: "visite_médicale", label: "Visite Médicale" },
    { value: "cours_de_code", label: "Cours de Code" },
    { value: "prêt_pour_examen_code", label: "Prêt pour Examen de Code" },
    { value: "programmé_pour_le_code", label: "Programmé pour le code" },
    { value: "cours_de_conduite", label: "Cours de Conduite" },
    {
      value: "prêt_pour_examen_conduite",
      label: "Prêt pour Examen de Conduite",
    },
    {
      value: "programmé_pour_la_conduite",
      label: "Programmé pour la conduite",
    },
    { value: "terminé", label: "Terminé" },
  ];

  // Étapes spécifiques pour le recyclage
  const recyclingSteps = [
    { value: "inscription", label: "Inscription" },
    { value: "cours_de_conduite", label: "Cours de Conduite" },
    {
      value: "prêt_pour_examen_conduite",
      label: "Prêt pour Examen de Conduite",
    },
    {
      value: "programmé_pour_la_conduite",
      label: "Programmé pour la conduite",
    },
    { value: "terminé", label: "Terminé" },
  ];

  // Fonction pour récupérer les moniteurs disponibles
  const fetchMoniteurs = async () => {
    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/liste_moniteur`
      );
      if (!response.ok)
        throw new Error("Erreur lors du chargement des moniteurs.");
      const data = await response.json();
      setMoniteurs(data.moniteurs); // Mettre à jour la liste des moniteurs
    } catch (error) {
      console.error("Erreur :", error.message);
      setError("Erreur :" + error.message);
    }
  };

  // Récupération des données de l'étudiant
  const fetchEtudiant = async () => {
    setError(""); // Réinitialiser les erreurs
    try {
      setLoad(true);
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/etudiant/${id}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }
      const data = await response.json();

      // Met à jour l'état avec les données récupérées
      setEtudiant({
        nom: data.etudiant.nom || "",
        prenom: data.etudiant.prenom || "",
        dateNaissance: data.etudiant.dateNaissance || "",
        num_telephone: data.etudiant.num_telephone || "",
        num_telephone_2: data.etudiant.num_telephone_2 || "",
        motif_inscription: data.etudiant.motif_inscription || "",
        scolarite: data.etudiant.scolarite || "",
        montant_paye: data.etudiant.montant_paye || "",
        progression: {
          id: data.progression?.id || null,
          etape: data.progression?.etape || "inscription",
        },
        idMoniteur: data.etudiant.idMoniteur || null,
      });
    } catch (error) {
      setError("Erreur lors de la récupération des données : " + error.message);
    } finally {
      setLoad(false);
    }
  };

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "progression") {
      setEtudiant((prev) => ({
        ...prev,
        progression: { ...prev.progression, etape: value },
      }));
    } else {
      setEtudiant((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Mise à jour des données de l'étudiant
  const updateEtudiant = async () => {
    setError(""); // Réinitialiser les erreurs
    setLoading(true); // Activer l'indicateur de chargement

    try {
      // Récupérer les informations de l'utilisateur connecté depuis le sessionStorage
      const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
      const userId = userInfo ? userInfo.id : null;

      // Vérifier si l'utilisateur est authentifié
      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/"); // Rediriger vers la page de connexion
        return;
      }

      // Extraire les données nécessaires de l'état de l'étudiant
      const {
        nom,
        prenom,
        dateNaissance,
        num_telephone,
        num_telephone_2,
        progression,
      } = etudiant;

      // Vérifier que le montant ajouté n'est pas négatif
      if (isNaN(montantPaye) || montantPaye < 0) {
        alert("Veuillez entrer un montant valide.");
        return;
      }

      // Préparer le corps de la requête avec les données mises à jour
      const body = {
        nom, // Nom de l'étudiant
        prenom, // Prénom de l'étudiant
        dateNaissance, // Date de naissance de l'étudiant
        num_telephone: num_telephone, // Numéro de téléphone principal
        num_telephone_2: num_telephone_2, // Numéro de téléphone secondaire
        progression: progression.id, // ID de la progression actuelle
        montant_paye: montantPaye, // Montant additionnel à payer
        etape: progression.etape, // Étape actuelle de progression
        user_id: userId, // ID de l'utilisateur connecté
        moniteur_id: selectedMoniteur || etudiant.idMoniteur, // ID du moniteur sélectionné ou existant
      };

      // Envoyer une requête POST pour mettre à jour les données de l'étudiant
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/update_etudiant/${id}`,
        {
          method: "POST",
          body: JSON.stringify(body), // Convertir le corps en JSON
        }
      );

      // Vérifier si la mise à jour a réussi
      if (response.ok) {
        eventBus.emit("rappel_updated");
        alert("Données mises à jour avec succès !");
        navigate("/etudiant/" + id); // Rediriger vers la liste des étudiants
      } else {
        // Gérer les erreurs de la réponse
        const errorResponse = await response.json();
        alert(errorResponse.message || "Échec de la mise à jour.");
      }
    } catch (error) {
      // Gérer les erreurs lors de la requête
      setError(
        "Erreur lors de la mise à jour de l'étudiant : " + error.message
      );
    } finally {
      setLoading(false); // Désactiver l'indicateur de chargement
    }
  };

  // console.log(etudiant);

  return (
    <Layout>
      {/* Bouton pour revenir à la liste des étudiants */}
      <Back>etudiants</Back>
      {error && <ToastMessage message={error} onClose={() => setError("")} />}
      {load === true ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
        >
          <Loader />
        </div>
      ) : (
        <div className="col-sm-6 offset-sm-3 mt-5">
          {/* Affichage des erreurs */}
          <h1>Modifier l'étudiant</h1>
          <br />
          {/* Formulaire de modification */}
          <label>Nom</label>
          <input
            type="text"
            name="nom"
            className="form-control"
            value={etudiant.nom}
            onChange={handleChange}
          />
          <br />
          <label>Prénom</label>
          <input
            type="text"
            name="prenom"
            className="form-control"
            value={etudiant.prenom}
            onChange={handleChange}
          />
          <br />
          <label>Date de naissance</label>
          <input
            type="date"
            name="dateNaissance"
            className="form-control"
            value={etudiant.dateNaissance}
            onChange={handleChange}
            max={minDate}
          />
          <br />

          <label>Numéro de téléphone</label>
          <input
            type="text"
            name="num_telephone"
            className="form-control"
            value={etudiant.num_telephone}
            onChange={handleChange}
          />
          <br />

          <label>Numéro de téléphone sécondaire</label>
          <input
            type="text"
            name="num_telephone_2"
            className="form-control"
            value={etudiant.num_telephone_2}
            onChange={handleChange}
          />
          <br />

          {/* Gestion du paiement */}
          {etudiant.scolarite - etudiant.montant_paye > 0 ? (
            <>
              <div className="form-group">
                <label>Reste de la scolarité à payer</label>
                <input
                  type="text"
                  className="form-control"
                  value={etudiant.scolarite - etudiant.montant_paye}
                  readOnly
                />
              </div>
              <br />
              <div className="form-group">
                <label>Ajouter au montant payé</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="montant_paye"
                    className="form-control"
                    placeholder="Ajouter un montant au paiement"
                    value={montantPaye || ""}
                    onChange={(e) =>
                      setMontantPaye(parseFloat(e.target.value) || 0)
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() =>
                      setMontantPaye(etudiant.scolarite - etudiant.montant_paye)
                    }
                  >
                    Soldé
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-success text-center">
              <strong>Soldé</strong>
            </div>
          )}
          <br />
          {/* Sélection de l'étape de progression */}
          <label>Étape de progression</label>
          <select
            name="progression"
            className="form-control"
            value={etudiant.progression.etape}
            onChange={handleChange}
          >
            {etudiant.motif_inscription === "recyclage"
              ? recyclingSteps.map((step) => (
                  <option key={step.value} value={step.value}>
                    {step.label}
                  </option>
                ))
              : defaultSteps.map((step) => (
                  <option key={step.value} value={step.value}>
                    {step.label}
                  </option>
                ))}
          </select>
          <br />
          {/* Sélection d'un moniteur */}
          {["cours_de_code", "cours_de_conduite"].includes(
            etudiant.progression.etape
          ) && (
            <div>
              <label>Rattacher un moniteur</label>
              <select
                className="form-control"
                value={selectedMoniteur || etudiant.idMoniteur || ""}
                onChange={(e) => setSelectedMoniteur(e.target.value)}
              >
                <option value="">-- Choisir un moniteur --</option>
                {moniteurs
                  .filter(
                    (moniteur) => !filter || moniteur.specialite === filter
                  )
                  .map((moniteur) => (
                    <option key={moniteur.id} value={moniteur.id}>
                      {moniteur.nom} {moniteur.prenom}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <br />
          {/* Bouton pour soumettre les modifications */}
          <button
            className="btn btn-primary w-100"
            onClick={() => setShowModal(true)}
            disabled={
              loading ||
              !etudiant.nom ||
              !etudiant.prenom ||
              (["cours_de_code", "cours_de_conduite"].includes(
                etudiant.progression.etape
              ) &&
                !selectedMoniteur &&
                !etudiant.idMoniteur)
            }
          >
            Modifier{" "}
          </button>
        </div>
      )}
      {/* Modal de confirmation */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={updateEtudiant}
        title="Confirmer la modification"
        body={
          <p>Êtes-vous sûr de vouloir modifier les données de cet étudiant ?</p>
        }
      />
      <br />
      <br />
    </Layout>
  );
};

export default EtudiantUpdate;
