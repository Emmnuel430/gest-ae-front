import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";
import eventBus from "../../utils/eventBus";

const AddEtudiant = () => {
  // Déclaration des états pour gérer les champs du formulaire
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [commune, setCommune] = useState("");
  const [numTelephone, setNumTelephone] = useState("");
  const [numTelephone2, setNumTelephone2] = useState(""); // Téléphone secondaire
  const [nomAutoEc, setNomAutoEc] = useState(""); // Nom de l'auto-école
  const [reduction, setReduction] = useState(false); // Réduction appliquée
  const [typePiece, setTypePiece] = useState(""); // Type de pièce d'identité
  const [numPiece, setNumPiece] = useState(""); // Numéro de pièce d'identité
  const [scolarite, setScolarite] = useState(""); // Montant total à payer
  const [montantPaye, setMontantPaye] = useState(""); // Montant payé
  const [motifInscription, setMotifInscription] = useState(""); // Motif d'inscription
  const [selectedCategories, setSelectedCategories] = useState([]); // Catégories sélectionnées
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [error, setError] = useState(""); // Gestion des erreurs
  const [showModal, setShowModal] = useState(false); // Affichage du modal de confirmation
  const navigate = useNavigate();
  const [tarifs, setTarifs] = useState(null);

  // Chargement des tarifs à l'ouverture du composant
  useEffect(() => {
    const fetchTarifs = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/scolarite/tarifs`
        );
        const data = await response.json();
        setTarifs(data);
      } catch (error) {
        console.error("Erreur lors du chargement des tarifs", error);
      }
    };

    fetchTarifs();
  }, []);

  // Calculer la date minimale autorisée (16 ans avant aujourd'hui)
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  // Fonction pour calculer la scolarité en fonction des catégories et des options
  const calculateScolarite = (categories = [], hasReduction, motif) => {
    if (!tarifs) return 0;

    if (motif === "recyclage") {
      return parseInt(tarifs["scolarite_recyclage"] || 60000);
    }

    const categorySet = new Set(categories);

    if (hasReduction) {
      return parseInt(tarifs["scolarite_reduction"] || 25000);
    }

    switch (true) {
      case categorySet.has("A") && categorySet.size === 1:
        return parseInt(tarifs["scolarite_A"] || 30000);
      case categorySet.has("B") && categorySet.size === 1:
        return parseInt(tarifs["scolarite_B"] || 50000);
      case categorySet.has("A") &&
        categorySet.has("B") &&
        categorySet.size === 2:
        return parseInt(tarifs["scolarite_AB"] || 100000);
      case categorySet.has("B") &&
        categorySet.has("C") &&
        categorySet.has("D") &&
        categorySet.has("E") &&
        categorySet.size === 4:
        return parseInt(tarifs["scolarite_BCDE"] || 120000);
      case categorySet.has("A") &&
        categorySet.has("B") &&
        categorySet.has("C") &&
        categorySet.has("D") &&
        categorySet.has("E") &&
        categorySet.size === 5:
        return parseInt(tarifs["scolarite_ABCDE"] || 150000);
      default:
        return (
          categories.length *
          parseInt(tarifs["scolarite_par_categorie"] || 25000)
        );
    }
  };

  // Mettre à jour la scolarité dynamiquement lorsque les catégories ou la réduction changent
  useEffect(() => {
    const calculatedScolarite = calculateScolarite(
      selectedCategories,
      reduction,
      motifInscription
    );
    setScolarite(calculatedScolarite);
  }, [selectedCategories, reduction, motifInscription]);

  // Réinitialiser les catégories sélectionnées si le motif d'inscription est "recyclage"
  useEffect(() => {
    if (motifInscription === "recyclage") {
      setSelectedCategories([]);
    }
  }, [motifInscription]);

  useEffect(() => {
    if (error) {
      handleCloseModal(); // Ferme le modal dès qu'une erreur apparaît
    }
  }, [error]);

  // Fonction pour fermer le modal
  const handleCloseModal = () => setShowModal(false);

  // Fonction pour ajouter un étudiant
  const addEtudiant = async () => {
    // Validation des champs
    if (
      !nom ||
      !prenom ||
      !dateNaissance ||
      !commune ||
      !numTelephone ||
      !nomAutoEc ||
      !typePiece ||
      !numPiece ||
      !scolarite ||
      !montantPaye ||
      !motifInscription
    ) {
      setError("Tous les champs étoilés sont requis.");
      return;
    }

    setError("");
    setShowModal(true);
    setLoading(true); // Active l'indicateur de chargement

    try {
      // Récupération de l'utilisateur connecté depuis sessionStorage
      const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
      const userId = userInfo ? userInfo.id : null;

      if (!userId) {
        alert("Utilisateur non authentifié. Veuillez vous connecter.");
        navigate("/");
        return;
      }

      if (motifInscription === "permis") {
        if (selectedCategories.length === 0) {
          setError("Veuillez sélectionner au moins une catégorie.");
          return;
        }
      }

      // Calcul automatique de la scolarité
      const calculatedScolarite = calculateScolarite(
        selectedCategories,
        reduction,
        motifInscription
      );

      // Préparation des données à envoyer
      const etudiant = {
        nom,
        prenom,
        dateNaissance,
        lieuNaissance: lieuNaissance || null,
        commune,
        numTelephone,
        numTelephone2: numTelephone2 || null,
        nomAutoEc,
        reduction,
        typePiece,
        numPiece,
        scolarite: calculatedScolarite, // Ajout de la scolarité calculée
        montant_paye: montantPaye,
        motifInscription,
        idUser: userId,
      };

      // N’ajoute `categorie` que si c’est un permis
      if (motifInscription === "permis" && selectedCategories) {
        etudiant.categorie = [selectedCategories]; // en array, car le backend attend un tableau
      }
      // Envoi des données à l'API
      let result = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/add_etudiant`,
        {
          method: "POST",
          body: JSON.stringify(etudiant),
        }
      );

      result = await result.json();

      if (result.error) {
        setError(result.error, result.details); // Affiche les erreurs retournées par l'API
        setLoading(false);
        return;
      }

      eventBus.emit("rappel_updated");
      setLoading(false);
      alert("Étudiant ajouté avec succès");
      // Réinitialisation des champs
      setNom("");
      setPrenom("");
      setDateNaissance("");
      setLieuNaissance("");
      setCommune("");
      setNumTelephone("");
      setNumTelephone2("");
      setNomAutoEc("");
      setReduction(false);
      setTypePiece("");
      setNumPiece("");
      setScolarite("");
      setMontantPaye("");
      setMotifInscription("");
      setSelectedCategories([]); // Réinitialiser les catégories
      navigate("/etudiants");
    } catch (e) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Back>etudiants</Back>

      <div className="container col-lg-8 offset-lg-2 col-12 mt-5 px-md-0 px-sm-4">
        <h1>Création d'un nouvel étudiant</h1>
        {error && (
          <ToastMessage message={error} onClose={() => setError(null)} />
        )}
        <p className="text-muted">
          Les champs marqués d'une étoile (*) sont obligatoires.
        </p>
        <br />

        {/* Identité */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Nom*</label>
            <input
              type="text"
              className={`form-control ${!nom && "is-invalid"}`}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
            {!nom && (
              <div className="invalid-feedback">Veuillez entrer le nom.</div>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label>Prénom*</label>
            <input
              type="text"
              className={`form-control ${!prenom && "is-invalid"}`}
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
            {!prenom && (
              <div className="invalid-feedback">Veuillez entrer le prénom.</div>
            )}
          </div>
        </div>

        {/* Naissance */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Date de naissance*</label>
            <input
              type="date"
              className={`form-control ${!dateNaissance && "is-invalid"}`}
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
              max={minDate}
            />
            {!dateNaissance && (
              <div className="invalid-feedback">Veuillez entrer la date.</div>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label>Lieu de naissance</label>
            <input
              type="text"
              className="form-control"
              value={lieuNaissance}
              onChange={(e) => setLieuNaissance(e.target.value)}
            />
          </div>
        </div>

        {/* Pièce d'identité */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Type de pièce*</label>
            <select
              className={`form-control ${!typePiece && "is-invalid"}`}
              value={typePiece}
              onChange={(e) => setTypePiece(e.target.value)}
            >
              <option value="">Sélectionnez un type</option>
              <option value="CNI">CNI</option>
              <option value="Passeport">Passeport</option>
              <option value="Carte Consulaire">Carte Consulaire</option>
              <option value="Attestation">Attestation</option>
              <option value="Permis">Permis</option>
              <option value="Autre">Autre</option>
            </select>
            {!typePiece && (
              <div className="invalid-feedback">Champ requis.</div>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label>Numéro de pièce*</label>
            <input
              type="text"
              className={`form-control ${!numPiece && "is-invalid"}`}
              value={numPiece}
              onChange={(e) => setNumPiece(e.target.value)}
            />
            {!numPiece && <div className="invalid-feedback">Champ requis.</div>}
          </div>
        </div>

        {/* Coordonnées */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Commune*</label>
            <input
              type="text"
              className={`form-control ${!commune && "is-invalid"}`}
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
            />
            {!commune && <div className="invalid-feedback">Champ requis.</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label>Téléphone*</label>
            <input
              type="number"
              className={`form-control ${!numTelephone && "is-invalid"}`}
              value={numTelephone}
              onChange={(e) => setNumTelephone(e.target.value)}
            />
            {!numTelephone && (
              <div className="invalid-feedback">Champ requis.</div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Téléphone secondaire</label>
            <input
              type="number"
              className="form-control"
              value={numTelephone2}
              onChange={(e) => setNumTelephone2(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label>Auto-école*</label>
            <select
              className={`form-control ${!nomAutoEc && "is-invalid"}`}
              value={nomAutoEc}
              onChange={(e) => setNomAutoEc(e.target.value)}
            >
              <option value="">Sélectionnez</option>
              <option value="Patrimoine">Patrimoine</option>
              <option value="Autre">Autre</option>
            </select>
            {nomAutoEc === "Autre" && (
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Nom de l'auto-école"
                value={lieuNaissance}
                onChange={(e) => setLieuNaissance(e.target.value)}
              />
            )}
            {!nomAutoEc && (
              <div className="invalid-feedback">Champ requis.</div>
            )}
          </div>
        </div>

        {/* Motif et réduction */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Motif d'inscription*</label>
            <select
              className={`form-control ${!motifInscription && "is-invalid"}`}
              value={motifInscription}
              onChange={(e) => setMotifInscription(e.target.value)}
            >
              <option value="">Sélectionnez</option>
              <option value="permis">Permis</option>
              <option value="recyclage">Recyclage</option>
            </select>
            {!motifInscription && (
              <div className="invalid-feedback">
                Veuillez sélectionner le motif d'inscription.
              </div>
            )}
          </div>
          <div className="col-md-6 mb-3 d-flex align-items-center">
            <label className="me-3">Réduction*</label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="reductionSwitch"
                checked={reduction}
                onChange={(e) => setReduction(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="reductionSwitch">
                {reduction ? "Oui" : "Non"}
              </label>
            </div>
          </div>
        </div>

        {/* Catégories */}
        <div className="form-group mb-3">
          <label>Catégories de permis*</label>
          <div className="d-flex flex-wrap">
            {["A", "B", "AB", "BCDE", "ABCDE", "CDE"].map((category) => (
              <div className="form-check me-3" key={category}>
                <input
                  type="radio"
                  id={`category-${category}`}
                  name="permis-category"
                  className="form-check-input"
                  value={category}
                  onChange={(e) => setSelectedCategories(e.target.value)}
                  checked={selectedCategories === category}
                  disabled={motifInscription === "recyclage"}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="form-check-label"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Paiement */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Montant à payer*</label>
            <input
              type="text"
              className="form-control"
              value={scolarite}
              readOnly
            />
          </div>
          <div className="col-md-6 mb-3">
            <label>Montant payé*</label>
            <input
              type="number"
              className="form-control"
              value={montantPaye}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value <= parseInt(scolarite, 10))
                  setMontantPaye(e.target.value);
              }}
              max={scolarite}
            />
          </div>
        </div>

        {/* Alerte solde */}
        {montantPaye &&
          scolarite &&
          Number(scolarite) > Number(montantPaye) && (
            <div className="alert alert-warning">
              Reste à payer : {Number(scolarite) - Number(montantPaye)} FCFA
            </div>
          )}

        {/* Bouton */}
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary w-100"
          disabled={
            !nom ||
            !prenom ||
            !dateNaissance ||
            !commune ||
            !numTelephone ||
            !typePiece ||
            !numPiece ||
            loading
          }
        >
          Ajouter
        </button>

        <ConfirmPopup
          show={showModal}
          onClose={handleCloseModal}
          onConfirm={addEtudiant}
          title="Confirmer l'ajout"
          body={
            <p>
              Êtes-vous sûr de vouloir ajouter l'étudiant suivant ?<br />
              <strong>Nom :</strong> {nom} <br />
              <strong>Prénom :</strong> {prenom} <br />
              <strong>Motif :</strong>{" "}
              {motifInscription === "permis" ? "Permis" : "Recyclage"}
            </p>
          }
        />
      </div>

      <br />
      <br />
    </Layout>
  );
};

export default AddEtudiant;
