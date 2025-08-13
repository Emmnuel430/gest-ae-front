import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";
import eventBus from "../../utils/eventBus";

const AddResultat = () => {
  const navigate = useNavigate();

  // État pour stocker les données du formulaire de résultat
  const [resultat, setResultat] = useState({
    idEtudiant: "", // ID de l'étudiant sélectionné
    libelle: "", // Type de résultat (code ou conduite)
    statut: false, // Statut du résultat (Retiré ou non)
  });

  // État pour stocker la liste des étudiants récupérée depuis l'API
  const [etudiants, setEtudiants] = useState([]);
  // État pour stocker les étudiants filtrés selon le type de résultat choisi
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  // État pour indiquer le chargement
  const [loading, setLoading] = useState(false);
  // État pour gérer les erreurs
  const [error, setError] = useState("");
  // État pour afficher ou masquer la fenêtre de confirmation
  const [showModal, setShowModal] = useState(false);

  // Charger la liste des étudiants au montage du composant
  useEffect(() => {
    fetchEtudiants();
  }, []);

  // Filtrer les étudiants en fonction du type de résultat choisi
  useEffect(() => {
    if (resultat.libelle) {
      const filtered = etudiants.filter((e) => {
        if (resultat.libelle === "code") {
          // Sélectionner uniquement les étudiants en examen de code
          return (
            e.progression?.etape === "programmé_pour_le_code"
            // e.progression?.etape === "examen_de_code"
          );
        } else if (resultat.libelle === "conduite") {
          // Sélectionner uniquement les étudiants en examen de conduite
          return (
            e.progression?.etape === "programmé_pour_la_conduite"
            // e.progression?.etape === "examen_de_conduite"
          );
        }
        return true;
      });

      // Mettre en forme la liste des étudiants filtrés pour le sélecteur
      setFilteredEtudiants(
        filtered.map((e) => ({
          value: e.id,
          label: `${e.nom} ${e.prenom} (ETU-${e.id})`,
        }))
      );
    } else {
      setFilteredEtudiants([]);
    }
  }, [resultat.libelle, etudiants]);

  // Fonction pour récupérer la liste des étudiants depuis l'API
  const fetchEtudiants = async () => {
    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/liste_etudiant`
      );
      if (!response.ok)
        throw new Error("Erreur lors du chargement des étudiants.");
      const data = await response.json();
      setEtudiants(data.etudiants);
    } catch {
      setError("Erreur lors du chargement des étudiants");
    }
  };

  // Vérifier que les champs sont remplis avant d'afficher la confirmation
  const handleShowModal = () => {
    if (!resultat.idEtudiant || !resultat.libelle) {
      setError("Tous les champs sont requis.");
      return;
    }
    setError("");
    setShowModal(true);
  };

  // Fonction pour fermer la fenêtre de confirmation
  const handleCloseModal = () => setShowModal(false);

  // Fonction pour ajouter un résultat
  const addResultat = async () => {
    setLoading(true);

    try {
      // Récupérer l'ID de l'utilisateur connecté
      const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
      const userId = userInfo ? userInfo.id : null;

      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/");
        return;
      }

      // Préparer les données à envoyer à l'API
      const payload = { ...resultat, idUser: userId };

      // Envoyer la requête d'ajout à l'API
      let response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/add_resultat`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      let result = await response.json();

      // Vérifier si l'ajout a réussi
      if (!response.ok) {
        setError(result.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      eventBus.emit("rappel_updated");
      alert("Résultat ajouté avec succès");
      // Réinitialiser le formulaire après l'ajout
      setResultat({ idEtudiant: "", libelle: "", statut: false });
      navigate("/resultats");
    } catch (e) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  // Fonction pour récupérer le thème Bootstrap depuis l'attribut HTML
  const getBootstrapTheme = () => {
    return document.body.getAttribute("data-bs-theme") === "dark";
  };
  const [isDarkMode, setIsDarkMode] = useState(getBootstrapTheme());

  // Détecte le changement de thème Bootstrap (si data-bs-theme change dynamiquement)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(getBootstrapTheme());
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-bs-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const customTheme = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      neutral0: isDarkMode ? "#212529" : "#fff", // fond du select
      neutral80: isDarkMode ? "#f8f9fa" : "#212529", // texte
      primary25: isDarkMode ? "#343a40" : "#e9ecef", // survol
      primary: "#0d6efd", // couleur principale Bootstrap
    },
  });
  return (
    <Layout>
      <Back>resultats</Back>
      <div className="col-sm-6 offset-sm-3 mt-5">
        <h1>Ajout d'un Résultat</h1>

        {error && <ToastMessage message={error} onClose={() => setError("")} />}

        {/* Sélection du type de résultat */}
        <label htmlFor="libelle" className="form-label">
          Type de résultat
        </label>
        <select
          id="libelle"
          className="form-control"
          value={resultat.libelle}
          onChange={(e) =>
            setResultat((prev) => ({
              ...prev,
              libelle: e.target.value,
              idEtudiant: "",
            }))
          }
        >
          <option value="">Choisissez le type</option>
          <option value="code">Code</option>
          <option value="conduite">Conduite</option>
        </select>
        <br />

        {/* Sélection de l'étudiant */}
        <label htmlFor="idEtudiant" className="form-label">
          Étudiant
        </label>
        <Select
          id="idEtudiant"
          className="bg-body"
          options={filteredEtudiants}
          value={filteredEtudiants.find((e) => e.value === resultat.idEtudiant)}
          onChange={(selectedOption) =>
            setResultat((prev) => ({
              ...prev,
              idEtudiant: selectedOption.value,
            }))
          }
          placeholder="Sélectionnez un étudiant"
          isSearchable
          theme={customTheme} // Appliquer le thème personnalisé
          isDisabled={!resultat.libelle} // Désactiver si aucun type de résultat n'est sélectionné
        />
        <br />

        {/* Sélection du statut */}
        <div className="mb-4">
          <h6>Statut du résultat :</h6>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="statutSwitch"
              checked={resultat.statut}
              onChange={(e) =>
                setResultat((prev) => ({ ...prev, statut: e.target.checked }))
              }
            />
            <label className="form-check-label" htmlFor="statutSwitch">
              {resultat.statut ? "Retiré" : "Non Retiré"}
            </label>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          onClick={handleShowModal}
          disabled={loading}
          className="btn btn-primary w-100"
        >
          Ajouter
        </button>
      </div>

      {/* Fenêtre de confirmation */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={addResultat}
        title="Confirmer l'ajout"
        body={
          <p>
            Êtes-vous sûr de vouloir ajouter ce résultat ?
            <br />
            <strong>Étudiant :</strong> ETU-{resultat.idEtudiant} <br />
            <strong>Libellé :</strong>{" "}
            <span className="text-capitalize">{resultat.libelle}</span> <br />
            <strong>Statut :</strong>{" "}
            {resultat.statut ? "Retiré" : "Non Retiré"}
          </p>
        }
      />
      <br />
      <br />
    </Layout>
  );
};

export default AddResultat;
