import React from "react";

const ProgressBar = ({ currentStep, motifInscription, moniteur }) => {
  // Liste des étapes par défaut
  const defaultSteps = [
    {
      name: "Inscription",
      key: "inscription",
      color: "primary",
      bgColor: "primary",
      percentage: 5,
    },
    {
      name: "Visite Médicale",
      key: "visite_médicale",
      color: "warning",
      bgColor: "warning",
      percentage: 5,
    },
    {
      name: "Cours de Code",
      key: "cours_de_code",
      color: "info",
      bgColor: "info",
      percentage: 25,
    },
    {
      name: "Prêt pour Examen de Code",
      key: "prêt_pour_examen_code",
      color: "secondary",
      bgColor: "secondary",
      percentage: 10,
    },
    {
      name: "Programmé pour le Code",
      key: "programmé_pour_le_code",
      color: "success",
      bgColor: "success",
      percentage: 5,
    },
    {
      name: "Cours de Conduite",
      key: "cours_de_conduite",
      color: "info",
      bgColor: "info",
      percentage: 25,
    },
    {
      name: "Prêt pour Examen de Conduite",
      key: "prêt_pour_examen_conduite",
      color: "secondary",
      bgColor: "secondary",
      percentage: 10,
    },
    {
      name: "Programmé pour la conduite",
      key: "programmé_pour_la_conduite",
      color: "success",
      bgColor: "success",
      percentage: 5,
    },
    {
      name: "Terminé",
      key: "terminé",
      color: "muted",
      bgColor: "dark",
      percentage: 10,
    },
  ];

  // Étapes spécifiques pour "recyclage"
  const recyclingSteps = [
    {
      name: "Inscription",
      key: "inscription",
      color: "primary",
      bgColor: "primary",
      percentage: 30,
    },
    {
      name: "Cours de Conduite",
      key: "cours_de_conduite",
      color: "info",
      bgColor: "info",
      percentage: 30,
    },
    {
      name: "Prêt pour Examen de Conduite",
      key: "prêt_pour_examen_conduite",
      color: "secondary",
      bgColor: "secondary",
      percentage: 20,
    },
    {
      name: "Programmé pour la conduite",
      key: "programmé_pour_la_conduite",
      color: "success",
      bgColor: "success",
      percentage: 10,
    },
    {
      name: "Terminé",
      key: "terminé",
      color: "muted",
      bgColor: "dark",
      percentage: 10,
    },
  ];

  // Sélection des étapes en fonction du motif d'inscription
  const steps =
    motifInscription === "recyclage" ? recyclingSteps : defaultSteps;

  // Fonction pour calculer le pourcentage total atteint
  const calculateTotalPercentage = (steps, currentIndex) => {
    return steps
      .slice(0, currentIndex + 1)
      .reduce((total, step) => total + step.percentage, 0);
  };

  // Trouver l'étape actuelle
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  // Gestion des erreurs
  if (currentIndex === -1) {
    return (
      <div className="text-danger">
        Étape actuelle invalide : {currentStep || "Non définie"}
      </div>
    );
  }

  // Calcul du pourcentage total atteint
  const totalPercentage = calculateTotalPercentage(steps, currentIndex);

  return (
    <div className="progress-container">
      {/* Titre de l'étape actuelle */}
      <h5 className="text-center mb-3">
        Étape actuelle :{" "}
        <span className={`text-${steps[currentIndex].color} fw-bold`}>
          {steps[currentIndex].name}
        </span>
      </h5>

      {/* Affichage du moniteur */}
      {(currentStep === "cours_de_code" ||
        currentStep === "cours_de_conduite") && (
        <p className="text-center mb-3 mb-0">
          <strong>Moniteur(trice) :</strong>{" "}
          {moniteur?.nom ? (
            <>
              {moniteur.nom} {moniteur.prenom}
            </>
          ) : (
            <span className="text-muted">Non affecté</span>
          )}
        </p>
      )}

      {/* Barre de progression */}
      <div className="progress">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`progress-bar progress-bar-striped progress-bar-animated bg-${step.bgColor}`}
            role="progressbar"
            style={{
              width: index <= currentIndex ? `${step.percentage}%` : "0%",
            }}
            aria-valuenow={step.percentage}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {/* {index <= currentIndex ? `${step.percentage}%` : ""} */}
          </div>
        ))}
      </div>

      {/* Affichage du pourcentage total atteint */}
      <h6 className="text-center mt-3">
        Taux d'achevement : <span className="fw-bold">{totalPercentage}%</span>
      </h6>

      {/* Style supplémentaire */}
      <style jsx="true">{`
        .progress-container {
          width: 100%;
        }
        .progress {
          height: 25px;
        }
        .progress-bar {
          text-align: center;
          font-size: 12px;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
