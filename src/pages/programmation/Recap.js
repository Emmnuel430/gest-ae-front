import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap"; // Importation de Table depuis react-bootstrap
import { useState } from "react";

import Layout from "../../components/Layout/Layout"; // Composant pour la mise en page
import Back from "../../components/Layout/Back"; // Composant pour le bouton de retour
import ToastMessage from "../../components/Layout/ToastMessage"; // Composant pour le bouton de retour
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Importation du composant ConfirmPopup
import { set } from "date-fns";

const Recap = () => {
  const location = useLocation(); // Récupère l'état passé via la navigation
  const navigate = useNavigate(); // Permet de naviguer entre les pages
  const [programmation, setProgrammation] = useState(location.state || {}); // État pour stocker les données de programmation
  const [error, setError] = useState(""); // Pour afficher les erreurs
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // État pour afficher ou masquer le popup de confirmation

  // Vérification si les données de programmation sont présentes
  if (!programmation.type || !programmation.date_prog) {
    return <h3>Aucune programmation sélectionnée.</h3>; // Affiche un message si aucune programmation n'est disponible
  }

  // Fonction pour rediriger vers la page d'ajout de programmation avec les données actuelles
  const modifierProgrammation = () => {
    navigate("/add/programmation", { state: programmation }); // Redirection avec les données actuelles
  };

  // Fonction pour formater la date de programmation
  const formatProgDate = (dateString) => {
    const date = new Date(dateString);
    let formattedDate = date
      .toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(".", "")
      .toUpperCase(); // Enlever le point et mettre en majuscules

    return formattedDate.replace(
      /\b(\p{L}+)/u,
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase() // Mettre la première lettre en majuscule
    );
  };

  // Fonction pour générer un fichier PDF
  const validerProgrammation = async () => {
    const userInfo = JSON.parse(localStorage.getItem("user-info"));
    const userId = userInfo ? userInfo.id : null;

    if (!userId) {
      setError("Utilisateur non authentifié.");
      navigate("/");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("date_prog", programmation.date_prog);
    formData.append("type", programmation.type);
    formData.append("idUser", userId);

    programmation.etudiants.forEach((e, i) => {
      formData.append(`etudiants[${i}]`, e.value);
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/add_programmations`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setLoading(false);
        alert("Programmation enregistrée avec succès !");
        navigate("/programmations");
      } else {
        const errorText = await response.text(); // Ajout pour voir le message exact
        console.error("Erreur réponse serveur :", errorText);
        throw new Error("Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      setError("Échec de l'enregistrement :", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir le popup de confirmation
  const handleShowModal = () => {
    setShowModal(true);
  };

  // Fonction pour fermer le popup de confirmation
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Fonction pour confirmer la validation
  const handleConfirmValidation = () => {
    setShowModal(false);
    validerProgrammation(); // Appelle la fonction de validation
  };

  // Formatage du numéro de téléphone
  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, "$1 "); // Ajout d'espaces entre chaque groupe de 2 chiffres
  };

  return (
    <Layout>
      <Back>add/programmation</Back> {/* Bouton de retour */}
      {error && (
        <ToastMessage message={error} onClose={() => setError("")} />
      )}{" "}
      <h2 className="text-center">Récapitulatif de la Programmation</h2>
      {/* Affichage des erreurs */}
      <div className="print-container card p-3 mt-3  px-4">
        <h4 className="text-center">
          Programmation de {programmation.type || "N/A"}
        </h4>
        <h5>Date: {formatProgDate(programmation.date_prog)}</h5>
        <Table className="table-bordered mt-3 w-75 mx-auto" responsive>
          <thead className="bg-light">
            <tr>
              <th className="text-center">N°</th>
              <th className="text-center">Nom & Prénom(s)</th>
              <th className="text-center">Téléphone</th>
              <th className="text-center">Auto-école</th>
              <th className="text-center">Catégorie</th>
              <th className="text-center">Identifiants</th>
            </tr>
          </thead>
          <tbody>
            {programmation.etudiants.map((etudiant, index) => (
              <tr key={index}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{etudiant.label || "-"}</td>
                <td className="text-center">
                  {formatPhoneNumber(etudiant.num_telephone) || "-"}
                </td>
                <td className="text-center">{etudiant.nom_autoEc || "-"}</td>
                <td className="text-center">{etudiant.categorie || "-"}</td>
                <td className="text-center">{`${etudiant.typePiece} - ${etudiant.numPiece}`}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="d-flex justify-content-center mt-4 px-4">
        <button
          className="btn btn-warning me-3"
          onClick={modifierProgrammation} // Bouton pour modifier la programmation
        >
          Modifier
        </button>
        {/* <button className="btn btn-info me-3" onClick={generatePDF}>
          
          Générer PDF
        </button> */}

        <button
          className="btn btn-success"
          onClick={handleShowModal}
          disabled={loading}
        >
          {/* Bouton pour afficher le popup de confirmation */}
          {loading ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i> Chargement...
            </span>
          ) : (
            "Valider la Programmation"
          )}
        </button>
      </div>
      {/* Utilisation du ConfirmPopup */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmValidation}
        title="Confirmer la validation"
        body={
          <p>
            Êtes-vous sûr de vouloir valider la programmation suivante ?
            <br />
            <strong>Type :</strong>{" "}
            <span className="text-capitalize">{programmation.type}</span> <br />
            <strong>Date :</strong> {formatProgDate(programmation.date_prog)}
          </p>
        }
      />
    </Layout>
  );
};

export default Recap;
