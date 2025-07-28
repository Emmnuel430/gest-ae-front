import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Layout/Loader";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Layout from "../../components/Layout/Layout";
import ProgressBar from "../../components/others/ProgressBar";
import Back from "../../components/Layout/Back";
import { fetchWithToken } from "../../utils/fetchWithToken";

const Etudiant = () => {
  const { id } = useParams(); // Récupération de l'ID depuis l'URL
  const [etudiant, setEtudiant] = useState(null); // Données de l'étudiant
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [error, setError] = useState(null); // Gestion des erreurs

  // Calcul de l'âge à partir de la date de naissance
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Formatage du numéro de téléphone
  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, "$1 ");
  };

  useEffect(() => {
    // Fonction pour récupérer les données de l'étudiant
    const fetchEtudiant = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/etudiant/${id}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        const data = await response.json();
        setEtudiant(data);
      } catch (err) {
        setError("Impossible de charger les données : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEtudiant();
  }, [id]);

  // Fonction pour formater une date en texte relatif
  const formatDateRelative = (date) => {
    const formatted = formatDistanceToNow(new Date(date), {
      addSuffix: true, // false = Pas de suffixe (ex. "il y a")
      locale: fr, // Locale française
    });

    if (/moins d.?une minute/i.test(formatted)) {
      return "À l'instant"; // Cas particulier pour "moins d'une minute"
    }

    // Remplacements pour abréger les unités de temps
    const abbreviations = [
      { regex: / heures?/i, replacement: "h" },
      { regex: / minutes?/i, replacement: "min" },
      // { regex: / secondes?/i, replacement: "s" },
      // { regex: / jours?/i, replacement: "j" },
      { regex: / semaines?/i, replacement: "sem" },
      // { regex: / mois?/i, replacement: "mois" },
      { regex: / ans?/i, replacement: "an" },
    ];

    let shortened = formatted;
    abbreviations.forEach(({ regex, replacement }) => {
      shortened = shortened.replace(regex, replacement); // Applique les remplacements
    });

    return shortened; // Retourne la version abrégée
  };

  // Affichage d'un spinner de chargement pendant le chargement des données
  if (loading) {
    return (
      <Layout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
        >
          <Loader />
        </div>
      </Layout>
    );
  }

  // Gestion des erreurs si les données ne sont pas disponibles
  if (error) {
    return (
      <Layout>
        <Back>etudiants</Back>
        <div className="alert alert-danger">{error}</div>
      </Layout>
    );
  }

  // Gestion de l'erreur si l'étudiant n'existe pas
  if (!etudiant || !etudiant.etudiant) {
    return (
      <Layout>
        <Back>etudiants</Back>
        <div className="alert alert-danger">Étudiant introuvable</div>
      </Layout>
    );
  }

  // Extraction des données de l'étudiant
  const { etudiant: details, progression } = etudiant;

  const montantPaye = parseFloat(details.montant_paye);
  const scolarite = parseFloat(details.scolarite);

  return (
    <Layout>
      <Back>etudiants</Back>
      <section className="bg-body">
        <div className="container">
          <div
            className="row"
            style={{
              backgroundColor:
                montantPaye < scolarite ? "#d51c0ddd" : "#4caf50c4",
            }}
          >
            <div className="col-lg-12">
              <div className="card card-style1 border-0">
                <div className="card-body p-4 p-md-5">
                  {/* En-tête principal */}
                  <div className="text-center mb-4">
                    <h2 className="text-primary mb-1">
                      {details.nom} {details.prenom}
                    </h2>
                    <h6 className="text-muted mb-2">ID ETU-{details.id}</h6>
                    <span className="badge bg-primary-subtle text-primary fs-6">
                      {details.motif_inscription === "permis"
                        ? "🎓 Candidat(e) au permis"
                        : "♻ Recyclage de conduite"}
                    </span>
                  </div>

                  {/* Section progression */}
                  <div className="mb-4">
                    <h5 className="text-center mb-3">📊 Progression</h5>
                    <ProgressBar
                      currentStep={progression.etape}
                      motifInscription={details.motif_inscription}
                    />
                    {(progression.etape === "cours_de_code" ||
                      progression.etape === "cours_de_conduite") && (
                      <p className="text-center mt-3 mb-0">
                        <strong>Moniteur(trice) :</strong>{" "}
                        {etudiant.moniteur?.nom ? (
                          <>
                            {etudiant.moniteur.nom} {etudiant.moniteur.prenom}
                          </>
                        ) : (
                          <span className="text-muted">Non affecté</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Informations personnelles */}
                  <div className="bg-body rounded shadow-sm p-3 mb-3">
                    <h5 className="mb-3">👤 Informations personnelles</h5>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Âge :</strong>{" "}
                        {calculateAge(details.dateNaissance)} ans
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Lieu de naissance :</strong>{" "}
                        {details.lieuNaissance || "Non renseigné"}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Pièce d'identité :</strong>{" "}
                        {details.type_piece || "Non renseigné"}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>N° :</strong>{" "}
                        {details.num_piece || "Non renseigné"}
                      </div>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="bg-body rounded shadow-sm p-3 mb-3">
                    <h5 className="mb-3">📞 Contact</h5>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Téléphone :</strong>{" "}
                        {details.num_telephone
                          ? formatPhoneNumber(details.num_telephone)
                          : "Non disponible"}
                      </div>
                      {details.num_telephone_2 && (
                        <div className="col-md-6 mb-2">
                          <strong>Secondaire :</strong>{" "}
                          {formatPhoneNumber(details.num_telephone_2)}
                        </div>
                      )}
                      <div className="col-md-6 mb-2">
                        <strong>Auto-école :</strong> {details.nom_autoEc}
                      </div>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="bg-body rounded shadow-sm p-3">
                    <h5 className="mb-3">➕ Informations supplémentaires</h5>
                    <div className="row">
                      {details.motif_inscription === "permis" && (
                        <div className="col-md-6 mb-2">
                          <strong>Catégories :</strong> {details.categorie}
                        </div>
                      )}
                      <div className="col-md-6 mb-2">
                        <strong>Réduction :</strong>{" "}
                        {details.reduction ? "Oui" : "Non"}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Scolarité :</strong>{" "}
                        {parseFloat(details.scolarite).toLocaleString()} FCFA
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Montant payé :</strong>{" "}
                        {parseFloat(details.montant_paye).toLocaleString()} FCFA
                      </div>
                      <div className="col-12 mt-2">
                        <strong>État de paiement :</strong>{" "}
                        {montantPaye >= scolarite ? (
                          <span className="text-success">Soldé</span>
                        ) : (
                          <>
                            <span className="text-danger">Reste à payer :</span>{" "}
                            <span className="text-danger">
                              {(scolarite - montantPaye).toLocaleString()} FCFA
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-body rounded shadow-sm p-3">
                    <div className="col-md-6 mb-2 d-flex align-items-center gap-2 text-muted">
                      <i className="bi bi-clock"></i>
                      <span>
                        <strong>Ajouté</strong>{" "}
                        {formatDateRelative(details.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Etudiant;
