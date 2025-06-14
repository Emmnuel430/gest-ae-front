import React, { useEffect, useState } from "react";
import Loader from "../../components/Layout/Loader"; // Assurez-vous que le chemin est correct
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrement des composants nécessaires pour les graphiques
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Graph = () => {
  const [evolutionData, setEvolutionData] = useState({});
  const [etapesData, setEtapesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Indique que les données sont en cours de chargement
      setError(null); // Réinitialise l'erreur

      try {
        // Récupération des données depuis plusieurs endpoints
        const [evolutionResponse, etapesResponse] = await Promise.all([
          fetch(
            `${process.env.REACT_APP_API_BASE_URL}/global/evolution-inscriptions`
          ),
          fetch(
            `${process.env.REACT_APP_API_BASE_URL}/global/etudiants-par-etape`
          ),
        ]);

        // Vérifie si toutes les réponses sont valides
        if (!evolutionResponse.ok || !etapesResponse.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        // Conversion des réponses en JSON
        const [evolutionJson, etapesJson] = await Promise.all([
          evolutionResponse.json(),
          etapesResponse.json(),
        ]);

        // Mise à jour des états avec les données formatées
        setEvolutionData(formatEvolutionData(evolutionJson.data));
        setEtapesData(formatEtapesData(etapesJson.data));
      } catch (err) {
        // Gestion des erreurs
        setError("Impossible de charger les données : " + err.message);
      } finally {
        // Indique que le chargement est terminé
        setLoading(false);
      }
    };

    fetchData(); // Appel de la fonction pour récupérer les données
  }, []);

  const isDatasetEmpty = (chartData) => {
    return (
      !chartData.datasets ||
      chartData.datasets.length === 0 ||
      chartData.datasets.every((dataset) => dataset.data.length === 0)
    );
  };

  // Formate les données pour le graphique d'évolution des inscriptions
  const formatEvolutionData = (data) => ({
    labels: data.map((item) => {
      const dateObj = new Date(item.date);
      return `${dateObj.getDate().toString().padStart(2, "0")}-${(
        dateObj.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${dateObj.getFullYear().toString().slice(-2)}`;
    }),
    datasets: [
      {
        label: "Nombre d'inscrits",
        data: data.map((item) => item.count),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  });

  // Formate les données pour le graphique des étudiants par étape
  const formatEtapesData = (data) => ({
    labels: data.map((item) => {
      return item.etape
        .replace(/_/g, " ") // Remplace les underscores par des espaces
        .toLowerCase() // Passe tout en minuscule
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Met la première lettre en majuscule
    }),
    datasets: [
      {
        label: "", // Un seul label fixe
        data: data.map((item) => item.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  });

  return (
    <div>
      {/* Affiche un message d'erreur si une erreur est survenue */}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
        >
          <Loader />
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-sm-12 col-xl-6">
              <div className="bg-body text-center rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="mb-0">Evolution des inscriptions</h6>
                  {/* <Link to="/global">Voir</Link> */}
                </div>
                {isDatasetEmpty(evolutionData) ? (
                  <p className="text-muted">
                    Aucune donnée disponible pour le moment.
                  </p>
                ) : (
                  <Line data={evolutionData} />
                )}{" "}
              </div>
            </div>
            <div className="col-sm-12 col-xl-6">
              <div className="bg-body text-center rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="mb-0">Etudiant par étapes</h6>
                  {/* <Link to="/etudiants">Voir</Link> */}
                </div>
                {isDatasetEmpty(etapesData) ? (
                  <p className="text-muted">Aucune donnée à afficher.</p>
                ) : (
                  <Bar data={etapesData} />
                )}{" "}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Graph;
