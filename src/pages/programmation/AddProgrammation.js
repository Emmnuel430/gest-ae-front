import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";

const AddProgrammation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(""); // Pour afficher les erreurs

  // Initialisation de l'état pour la programmation
  const [programmation, setProgrammation] = useState({
    type: location.state?.type || "", // Type de programmation (code ou conduite)
    date_prog: location.state?.date_prog || "", // Date de programmation
    etudiants: location.state?.etudiants || [], // Liste des étudiants sélectionnés
  });

  const [etudiants, setEtudiants] = useState([]); // Liste des étudiants disponibles

  // Chargement de la liste des étudiants en fonction du type sélectionné
  useEffect(() => {
    fetchWithToken(`${process.env.REACT_APP_API_BASE_URL}/liste_etudiant`)
      .then((res) => res.json())
      .then((data) => {
        // Filtrage des étudiants en fonction du type de programmation
        const filteredEtudiants = data.etudiants.filter((e) => {
          if (programmation.type === "code") {
            return e.progression?.etape === "prêt_pour_examen_code";
          } else if (programmation.type === "conduite") {
            return e.progression?.etape === "prêt_pour_examen_conduite";
          }

          return true; // Si aucun type sélectionné, on affiche tous les étudiants
        });

        // Mise en forme des données pour le composant Select
        setEtudiants(
          filteredEtudiants.map((e) => ({
            value: e.id,
            label: `${e.nom} ${e.prenom}`,
            num_telephone: e.num_telephone,
            nom_autoEc: e.nom_autoEc,
            categorie: e.categorie,
            typePiece: e.type_piece,
            numPiece: e.num_piece,
          }))
        );
      })
      .catch((err) =>
        setError("Erreur lors du chargement des étudiants:", err)
      );
  }, [programmation.type]); // Dépendance : se recharge quand le type change

  // Gestion de la sélection d'un étudiant
  const handleSelectStudent = (selectedOption) => {
    if (
      !programmation.etudiants.some((e) => e.value === selectedOption.value)
    ) {
      setProgrammation((prev) => ({
        ...prev,
        etudiants: [...prev.etudiants, selectedOption],
      }));
    }
  };

  // Validation et redirection vers le récapitulatif
  const handleSubmit = () => {
    if (
      !programmation.type ||
      !programmation.date_prog ||
      programmation.etudiants.length === 0
    ) {
      alert("Veuillez remplir tous les champs avant de valider.");
      return;
    }
    navigate("/recap", { state: programmation });
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
      <Back>Programmations</Back>
      <br />
      {error && <ToastMessage message={error} onClose={() => setError("")} />}
      <div className="row recap-container mx-auto px-4">
        <div className="col-md-6 mb-3">
          <h2 className="mb-4">Nouvelle Programmation</h2>

          {/* Sélection du type de programmation */}
          <div className="mb-3">
            <label htmlFor="type" className="form-label fw-bold">
              1️⃣ Type de programmation
            </label>
            <select
              id="type"
              className="form-select"
              value={programmation.type}
              onChange={(e) =>
                setProgrammation((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">-- Sélectionnez un type --</option>
              <option value="code">📚 Code</option>
              <option value="conduite">🚗 Conduite</option>
            </select>
          </div>

          {/* Sélection de la date */}
          <div className="mb-3">
            <label htmlFor="date_prog" className="form-label fw-bold">
              2️⃣ Date de programmation
            </label>
            <input
              type="date"
              id="date_prog"
              className="form-control"
              value={programmation.date_prog}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setProgrammation((prev) => ({
                  ...prev,
                  date_prog: e.target.value,
                }))
              }
              disabled={!programmation.type}
            />
            {!programmation.type && (
              <small className="text-muted">
                ⚠️ Sélectionnez d’abord un type avant la date.
              </small>
            )}
          </div>

          {/* Sélection des étudiants */}
          <div className="mb-3">
            <label htmlFor="etudiant" className="form-label fw-bold">
              3️⃣ Étudiant(s) à programmer{" "}
            </label>
            <Select
              id="etudiant"
              options={etudiants}
              onChange={handleSelectStudent}
              placeholder={
                programmation.type
                  ? "Rechercher ou sélectionner un étudiant"
                  : "Sélectionnez un type pour activer"
              }
              isSearchable
              className="mt-2"
              theme={customTheme}
              isDisabled={!programmation.type}
            />
          </div>
        </div>

        {/* Liste des étudiants sélectionnés */}
        <div className="col-md-6">
          <div className="mb-3">
            <h2>Étudiant(s) sélectionné(s) </h2>
            {programmation.etudiants.length > 0 && (
              <span className="badge bg-success ms-2 fs-6">
                {programmation.etudiants.length} sélectionné(s)
              </span>
            )}
          </div>
          {programmation.etudiants.length > 0 ? (
            <ul className="list-group shadow-sm">
              {programmation.etudiants.map((etudiant, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    {index + 1} - {etudiant.label}
                  </span>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    title="Supprimer"
                    onClick={() =>
                      setProgrammation((prev) => ({
                        ...prev,
                        etudiants: prev.etudiants.filter(
                          (e) => e.value !== etudiant.value
                        ),
                      }))
                    }
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted fst-italic">
              Aucun étudiant sélectionné pour le moment.
            </p>
          )}
        </div>

        {/* Bouton de validation */}
        <div className="col-12 mt-4">
          <button
            className="btn btn-primary w-100 py-2"
            onClick={handleSubmit}
            disabled={!programmation.type || !programmation.date_prog}
          >
            📋 Voir Récapitulatif
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AddProgrammation;
