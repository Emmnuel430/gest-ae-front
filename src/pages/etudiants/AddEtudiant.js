import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage"; // adapte le chemin si besoin

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
  const calculateScolarite = (categories, hasReduction, motif) => {
    if (motif === "recyclage") {
      return 60000; // Si motif = recyclage, la scolarité est fixée à 60 000
    }

    const categorySet = new Set(categories);

    if (hasReduction) {
      return 25000; // Toutes les catégories coûtent 25k avec réduction
    }

    // Utilisation de switch pour les combinaisons
    switch (true) {
      case categorySet.has("A") && categorySet.size === 1:
        return 30000; // A
      case categorySet.has("A") &&
        categorySet.has("B") &&
        categorySet.size === 2:
        return 100000; // AB
      case categorySet.has("B") &&
        categorySet.has("C") &&
        categorySet.has("D") &&
        categorySet.has("E") &&
        categorySet.size === 4:
        return 120000; // BCDE
      case categorySet.has("A") &&
        categorySet.has("B") &&
        categorySet.has("C") &&
        categorySet.has("D") &&
        categorySet.has("E") &&
        categorySet.size === 5:
        return 150000; // ABCDE
      default:
        return categories.length * 25000; // Chaque catégorie coûte 20k si non définie
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

  useEffect(() => {
    if (error) {
      handleCloseModal(); // Ferme le modal dès qu'une erreur apparaît
    }
  }, [error]);

  // Gestion des changements dans les catégories sélectionnées
  const handleCategoryChange = (category, checked) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category)
      );
    }
  };

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
      // Récupération de l'utilisateur connecté depuis localStorage
      const userInfo = JSON.parse(localStorage.getItem("user-info"));
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
        categorie: [selectedCategories], // Convertir les catégories
        idUser: userId,
      };

      console.log(JSON.stringify(etudiant));

      // Envoi des données à l'API
      let result = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/add_etudiant`,
        {
          method: "POST",
          body: JSON.stringify(etudiant),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      result = await result.json();

      if (result.error) {
        setError(result.error, result.details); // Affiche les erreurs retournées par l'API
        setLoading(false);
        return;
      }

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
      <div className="col-sm-6 offset-sm-3 mt-5 px-4">
        <h1>Création d'un nouvel étudiant</h1>

        {/* Affichage des messages d'erreur globaux */}
        {error && (
          <ToastMessage
            message={error}
            onClose={() => {
              setError(null);
            }}
          />
        )}

        {/* Description */}
        <p className="text-muted">
          Les champs marqués d'une étoile (*) sont obligatoires.
        </p>
        <br />

        {/* Champ Nom */}
        <div className="form-group mb-3">
          <label htmlFor="nom" className="form-label">
            Nom*
          </label>
          <input
            type="text"
            id="nom"
            className={`form-control ${!nom && "is-invalid"}`}
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          {!nom && (
            <div className="invalid-feedback">Veuillez entrer le nom.</div>
          )}
        </div>

        {/* Champ Prénom */}
        <div className="form-group mb-3">
          <label htmlFor="prenom" className="form-label">
            Prénom*
          </label>
          <input
            type="text"
            id="prenom"
            className={`form-control ${!prenom && "is-invalid"}`}
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
          {!prenom && (
            <div className="invalid-feedback">Veuillez entrer le prénom.</div>
          )}
        </div>

        {/* Champ Date de naissance */}
        <div className="form-group mb-3">
          <label htmlFor="dateNaissance" className="form-label">
            Date de naissance*
          </label>
          <input
            type="date"
            id="dateNaissance"
            className={`form-control ${!dateNaissance && "is-invalid"}`}
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            max={minDate} // Empêche la sélection de dates inférieures à 16 ans
          />
          {!dateNaissance && (
            <div className="invalid-feedback">
              Veuillez entrer la date de naissance.
            </div>
          )}
        </div>

        {/* Champ Lieu de naissance */}
        <div className="form-group mb-3">
          <label htmlFor="lieuNaissance" className="form-label">
            Lieu de naissance
          </label>
          <input
            type="text"
            id="lieuNaissance"
            className="form-control"
            placeholder="Lieu de naissance"
            value={lieuNaissance}
            onChange={(e) => setLieuNaissance(e.target.value)}
          />
        </div>

        {/* Champ Type de pièce */}
        <div className="form-group mb-3">
          <label htmlFor="typePiece" className="form-label">
            Type de pièce d'identité*
          </label>
          <select
            id="typePiece"
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
            <div className="invalid-feedback">
              Veuillez sélectionner le type de pièce.
            </div>
          )}
        </div>

        {/* Champ Numéro de pièce */}
        <div className="form-group mb-3">
          <label htmlFor="numPiece" className="form-label">
            Numéro de pièce d'identité*
          </label>
          <input
            type="text"
            id="numPiece"
            className={`form-control ${!numPiece && "is-invalid"}`}
            placeholder="Numéro de pièce d'identité"
            value={numPiece}
            onChange={(e) => setNumPiece(e.target.value)}
          />
          {!numPiece && (
            <div className="invalid-feedback">
              Veuillez entrer le numéro de pièce.
            </div>
          )}
        </div>

        {/* Champ Commune */}
        <div className="form-group mb-3">
          <label htmlFor="commune" className="form-label">
            Commune*
          </label>
          <input
            type="text"
            id="commune"
            className={`form-control ${!commune && "is-invalid"}`}
            placeholder="Commune"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
          />
          {!commune && (
            <div className="invalid-feedback">Veuillez entrer la commune.</div>
          )}
        </div>

        {/* Champ Numéro de téléphone principal */}
        <div className="form-group mb-3">
          <label htmlFor="numTelephone" className="form-label">
            Numéro de téléphone*
          </label>
          <input
            type="number"
            id="numTelephone"
            className={`form-control ${!numTelephone && "is-invalid"}`}
            placeholder="Numéro de téléphone"
            value={numTelephone}
            onChange={(e) => setNumTelephone(e.target.value)}
          />
          {!numTelephone && (
            <div className="invalid-feedback">
              Veuillez entrer un numéro de téléphone.
            </div>
          )}
        </div>

        {/* Champ Numéro de téléphone secondaire */}
        <div className="form-group mb-3">
          <label htmlFor="numTelephone2" className="form-label">
            Numéro de téléphone secondaire
          </label>
          <input
            type="number"
            id="numTelephone2"
            className="form-control"
            placeholder="Numéro de téléphone secondaire"
            value={numTelephone2}
            onChange={(e) => setNumTelephone2(e.target.value)}
          />
        </div>
        <span>------------------------------------------------------</span>

        {/* Champ Nom de l'auto-école */}
        <div className="form-group mb-3">
          <label htmlFor="nomAutoEc" className="form-label">
            Nom de l'auto-école*
          </label>
          <select
            id="nomAutoEc"
            className={`form-control ${!nomAutoEc && "is-invalid"}`}
            value={nomAutoEc}
            onChange={(e) => setNomAutoEc(e.target.value)}
          >
            <option value="">Sélectionnez une auto-école</option>
            <option value="Patrimoine">Patrimoine</option>
            <option value="Autre">Autre</option>
          </select>
          {nomAutoEc === "Autre" && (
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Nom de l'auto-école"
              value={lieuNaissance} // Utiliser une nouvelle variable si nécessaire
              onChange={(e) => setLieuNaissance(e.target.value)}
            />
          )}
          {!nomAutoEc && (
            <div className="invalid-feedback">
              Veuillez sélectionner ou entrer le nom de l'auto-école.
            </div>
          )}
        </div>

        {/* Champ Motif d'inscription */}
        <div className="form-group mb-3">
          <label htmlFor="motifInscription" className="form-label">
            Motif d'inscription*
          </label>
          <select
            id="motifInscription"
            className="form-control"
            value={motifInscription}
            onChange={(e) => setMotifInscription(e.target.value)}
          >
            <option value="">Sélectionnez un motif</option>
            <option value="permis">Candidat au permis</option>
            <option value="recyclage">Recyclage</option>
          </select>
        </div>

        {/* Champ Réduction */}
        <div className="d-flex align-items-center mb-3">
          <label className="form-label me-3">Réduction*</label>
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

        {/* Champ Catégories */}
        <div className="form-group mb-3">
          <label>Catégories de permis*</label>
          {["A", "B", "AB", "BCDE", "ABCDE", "CDE"].map((category) => (
            <div className="form-check" key={category}>
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

        {/* Montant */}
        <div className="form-group mb-3">
          {/* Scolarité */}
          <label htmlFor="scolarite" className="form-label">
            Montant à payer*
          </label>
          <input
            type="text"
            id="scolarite"
            className="form-control"
            value={scolarite}
            readOnly
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="montant_paye" className="form-">
            Montant payé*
          </label>
          <input
            type="number"
            id="montant_paye"
            className="form-control"
            placeholder="Montant payé"
            value={montantPaye}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (value <= parseInt(scolarite, 10)) {
                setMontantPaye(e.target.value);
              }
            }}
            max={scolarite}
          />
        </div>

        {/* Alerte de paiement en retard */}
        {montantPaye &&
          scolarite &&
          Number(scolarite) > Number(montantPaye) && (
            <div className="alert alert-warning">
              Attention : L'étudiant n'a pas soldé le montant total dû. Reste à
              payer : {Number(scolarite) - Number(montantPaye)} FCFA
            </div>
          )}

        {/* Bouton Ajouter */}
        <button
          onClick={() => setShowModal(true)} // Affiche le modal à l'appui du bouton
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
        {/* Utilisation du ConfirmPopup */}
        <ConfirmPopup
          show={showModal}
          onClose={handleCloseModal}
          onConfirm={addEtudiant}
          title="Confirmer l'ajout"
          body={
            <p>
              Êtes-vous sûr de vouloir ajouter l'etudiant suivant ?
              <br />
              <strong>Nom :</strong> {nom} <br />
              <strong>Prénom :</strong> {prenom} <br />
              <strong>Motif :</strong>{" "}
              {motifInscription == "permis"
                ? "Candidat(e) au permis"
                : "Recyclage de conduite"}
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
