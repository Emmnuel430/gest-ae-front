import React, { useEffect, useState } from "react";
import Loader from "../components/Layout/Loader";
import Layout from "../components/Layout/Layout";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
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
import { useMediaQuery } from "react-responsive";
import { fetchWithToken } from "../utils/fetchWithToken";
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

const Global = () => {
  // Déclaration des états pour stocker les données et gérer l'état de chargement/erreur
  const [evolutionData, setEvolutionData] = useState({});
  const [etapesData, setEtapesData] = useState({});
  const [categorieData, setCategorieData] = useState({});
  const [moniteurData, setMoniteurData] = useState({});
  const [totaux, setTotaux] = useState({});
  const [reductionData, setReductionData] = useState({}); // Ajout d'un état pour les données de réduction
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Détection de la taille de l'écran
  const isMobile = useMediaQuery({ maxWidth: 767 });
  // Utilisation de useEffect pour récupérer les données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Indique que les données sont en cours de chargement
      setError(null); // Réinitialise l'erreur

      try {
        // Récupération des données depuis plusieurs endpoints
        const [
          evolutionResponse,
          categorieResponse,
          moniteurResponse,
          etapesResponse,
          totauxResponse,
          reductionResponse, // Ajout de la récupération des données de réduction
        ] = await Promise.all([
          await fetchWithToken(
            `${process.env.REACT_APP_API_BASE_URL}/global/evolution-inscriptions`
          ),
          await fetchWithToken(
            `${process.env.REACT_APP_API_BASE_URL}/global/repartition-categorie`
          ),
          await fetchWithToken(
            `${process.env.REACT_APP_API_BASE_URL}/global/repartition-moniteur`
          ),
          await fetchWithToken(
            `${process.env.REACT_APP_API_BASE_URL}/global/etudiants-par-etape`
          ),
          await fetchWithToken(
            `${process.env.REACT_APP_API_BASE_URL}/global/totaux`
          ),
          await fetchWithToken(
            `${process.env.REACT_APP_API_BASE_URL}/global/repartition-reduction`
          ), // Endpoint pour la réduction
        ]);

        // Vérifie si toutes les réponses sont valides
        if (
          !evolutionResponse.ok ||
          !categorieResponse.ok ||
          !moniteurResponse.ok ||
          !etapesResponse.ok ||
          !totauxResponse.ok ||
          !reductionResponse.ok // Vérification pour la réduction
        ) {
          throw new Error("Erreur lors de la récupération des données");
        }

        // Conversion des réponses en JSON
        const [
          evolutionJson,
          categorieJson,
          moniteurJson,
          etapesJson,
          totauxJson,
          reductionJson, // Conversion des données de réduction
        ] = await Promise.all([
          evolutionResponse.json(),
          categorieResponse.json(),
          moniteurResponse.json(),
          etapesResponse.json(),
          totauxResponse.json(),
          reductionResponse.json(), // Conversion des données de réduction
        ]);

        // Mise à jour des états avec les données formatées
        setEvolutionData(formatEvolutionData(evolutionJson.data));
        setCategorieData(formatCategorieData(categorieJson.data));
        setMoniteurData(formatMoniteurData(moniteurJson.data));
        setEtapesData(formatEtapesData(etapesJson.data));
        setTotaux(totauxJson);
        setReductionData(formatReductionData(reductionJson.data)); // Mise à jour des données de réduction
      } catch (err) {
        // Gestion des erreurs
        setError("Impossible de charger les données : " + err.message);
      } finally {
        // Indique que le chargement est terminé
        setLoading(false);
      }
    };

    fetchData(); // Appelle la fonction pour récupérer les données
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
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF9F40, #9966FF",
        ],
      },
    ],
  });

  // Formate les données pour le graphique de répartition par catégorie
  const formatCategorieData = (data) => ({
    labels: data.map((item) =>
      item.categorie.trim() ? item.categorie : "Non spécifié"
    ),
    datasets: [
      {
        label: "Nombre d'étudiants",
        data: data.map((item) => item.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF9F40",
          "#9966FF",
          "#999999",
        ],
      },
    ],
  });

  // Formate les données pour le graphique de répartition par moniteur
  const generateDistinctColor = (index, total) => {
    const hue = Math.floor((360 / total) * index); // répartit sur le cercle colorimétrique
    return `hsl(${hue}, 70%, 50%)`; // saturation et luminosité fixes pour garder du contraste
  };

  const formatMoniteurData = (data) => {
    const filteredData = data.filter(
      (item) => item.moniteur && item.moniteur.nom
    );

    // Tri alphabétique pour stabilité des index
    const sortedData = [...filteredData].sort((a, b) =>
      a.moniteur.nom.localeCompare(b.moniteur.nom)
    );

    return {
      labels: sortedData.map((item) => item.moniteur.nom),
      datasets: [
        {
          label: "Nombre d'étudiants",
          data: sortedData.map((item) => item.count),
          backgroundColor: sortedData.map((_, index) =>
            generateDistinctColor(index, sortedData.length)
          ),
        },
      ],
    };
  };

  // Formate les données pour le graphique de répartition par réduction
  const formatReductionData = (data) => ({
    labels: data.map((item) =>
      item.reduction ? "Avec réduction" : "Sans réduction"
    ),
    datasets: [
      {
        label: "Nombre d'étudiants",
        data: data.map((item) => item.count),
        backgroundColor: ["#6c757d", "#0dcaf0"],
      },
    ],
  });

  const renderCard = ({ icon, color, title, title2, value, subtitle }) => (
    // Card pour afficher les totaux
    <div className="col-sm-6 col-xl-3" key={title}>
      <div className="bg-body rounded d-flex align-items-center justify-content-between p-4 border shadow-sm h-100">
        <i className={`fa ${icon} fa-3x text-${color}`}></i>
        <div className="ms-3">
          <div className="mb-2">{title}</div>
          <h6 className="mb-0 h2 text-center" title={title2}>
            {value}
            {subtitle && (
              <>
                <br />
                <small className="text-muted fs-6">{subtitle}</small>
              </>
            )}
          </h6>
        </div>
      </div>
    </div>
  );

  const total = totaux?.totalEtudiants || 0;
  const soldé = totaux?.etudiantsSoldes || 0;
  const nonSoldé = total - soldé;

  // Fonction pour formater le montant
  function formatMontant(montant) {
    if (montant >= 1_000_000_000) {
      return (
        (montant / 1_000_000_000)
          .toFixed(montant % 1_000_000_000 === 0 ? 0 : 1)
          .replace(".", ",") + " Md"
      );
    } else if (montant >= 1_000_000) {
      return (
        (montant / 1_000_000)
          .toFixed(montant % 1_000_000 === 0 ? 0 : 1)
          .replace(".", ",") + " M"
      );
    } else if (montant >= 1_000) {
      return (
        (montant / 1_000)
          .toFixed(montant % 1_000 === 0 ? 0 : 1)
          .replace(".", ",") + " K"
      );
    } else {
      return new Intl.NumberFormat("fr-FR", { useGrouping: true }).format(
        Math.trunc(montant)
      );
    }
  }

  const cards = [
    {
      icon: "fa-coins",
      color: "primary",
      title: "Revenu total (FCFA)",

      title2: new Intl.NumberFormat("fr-FR", {
        useGrouping: true,
      }).format(totaux.totalMontantPaye),

      value: totaux?.totalMontantPaye ? (
        formatMontant(totaux.totalMontantPaye)
      ) : (
        <span className="text-muted">00</span>
      ),
    },
    {
      icon: "fa-users",
      color: "primary",
      title: "Nombre d'Étudiants",
      value: total || <span className="text-muted">00</span>,
    },
    {
      icon: "fa-user-times",
      color: "danger",
      title: "Non soldé",
      value: `${nonSoldé}`,
      subtitle: `${Math.round((nonSoldé / total) * 100 || 0)}%`,
    },
    {
      icon: "fa-user-cog",
      color: "primary",
      title: "Nombre d'Utilisateurs",
      value: totaux?.totalUsers ?? <span className="text-muted">00</span>,
    },
  ];

  return (
    <Layout>
      <div className="container mt-2">
        <h1 className="mb-4">Données Global</h1>

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
            {/* Section Totaux */}
            <div className="row g-4 mb-4">{cards.map(renderCard)}</div>

            {/* Section Graphiques */}
            <div className="row g-4">
              {/* Graphique d'évolution des inscriptions */}
              <div className="col-md-6">
                <div className="card bg-body border-0 shadow p-3">
                  <h5>Évolution des inscriptions</h5>
                  {isDatasetEmpty(evolutionData) ? (
                    <p className="text-muted">
                      Aucune donnée disponible pour le moment.
                    </p>
                  ) : (
                    <Line data={evolutionData} />
                  )}{" "}
                </div>
              </div>

              {/* Graphique des étudiants par étape */}
              <div className="col-md-6">
                <div className="card bg-body border-0 shadow p-3">
                  <h5>Étudiants par étape</h5>
                  {isDatasetEmpty(etapesData) ? (
                    <p className="text-muted">
                      Aucune donnée disponible pour le moment.
                    </p>
                  ) : (
                    <Bar data={etapesData} />
                  )}{" "}
                </div>
              </div>
            </div>

            <div className="row g-4 mt-4">
              {/* Graphique de répartition par moniteur */}
              <div className="col-md-6">
                <div className="card bg-body border-0 shadow p-3">
                  <h5>Répartition par moniteur</h5>
                  {isDatasetEmpty(moniteurData) ? (
                    <p className="text-muted">
                      Aucune donnée disponible pour le moment.
                    </p>
                  ) : (
                    <Pie data={moniteurData} />
                  )}{" "}
                </div>
              </div>
              {/* Graphique de répartition par catégorie */}
              <div className="col-md-6">
                <div className="card bg-body border-0 shadow p-3">
                  <h5>Répartition par catégorie</h5>
                  {isDatasetEmpty(categorieData) ? (
                    <p className="text-muted">
                      Aucune donnée disponible pour le moment.
                    </p>
                  ) : (
                    <Pie data={categorieData} />
                  )}{" "}
                </div>
              </div>
            </div>

            <div className="row mt-4 px-auto">
              {/* Graphique de répartition par réduction */}
              <div className="col-12">
                <div className="card bg-body border-0 shadow p-3">
                  {/* Container principal avec flex-direction responsive */}
                  <div className="d-flex flex-column flex-lg-row align-items-center">
                    {/* Section gauche : titre, légende et totaux */}
                    {/* Section gauche : titre, légende et totaux */}
                    <div className="col-md-6 mb-3 mb-md-0">
                      <h5>Répartition par réduction</h5>
                      <ul className="list-unstyled d-none d-lg-flex gap-4">
                        <li
                          className="d-flex flex-column align-items-center"
                          style={{ fontSize: "1.4rem" }} // Taille plus grande pour tablette & PC
                        >
                          <span className="badge bg-info me-2">
                            Avec réduction
                          </span>
                          <p className="display-6">
                            {reductionData.datasets?.[0]?.data?.[1] || null}
                          </p>
                        </li>
                        <li
                          className="d-flex flex-column align-items-center"
                          style={{ fontSize: "1.4rem" }} // Taille plus grande pour tablette & PC
                        >
                          <span className="badge bg-secondary me-2">
                            Sans réduction
                          </span>
                          <p className="display-6">
                            {reductionData.datasets?.[0]?.data?.[0] || null}
                          </p>
                        </li>
                        {/* ---------------- */}
                        {/* <li className="d-md-none" style={{ fontSize: "1rem" }}>
                          <span className="badge bg-info me-2">
                            Avec réduction
                          </span>
                          {reductionData.datasets?.[0]?.data?.[0] || 0}
                        </li>
                        <li className="d-md-none" style={{ fontSize: "1rem" }}>
                          <span className="badge bg-secondary me-2">
                            Sans réduction
                          </span>
                          {reductionData.datasets?.[0]?.data?.[1] || 0}
                        </li> */}
                      </ul>
                    </div>

                    {/* Section droite : graphique */}
                    <div className="col-lg-6 d-flex justify-content-center">
                      {isDatasetEmpty(reductionData) ? (
                        <p className="text-muted">
                          Aucune donnée disponible pour le moment.
                        </p>
                      ) : isMobile ? (
                        <Pie data={reductionData} />
                      ) : (
                        <Doughnut data={reductionData} />
                      )}{" "}
                      {}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Global;
