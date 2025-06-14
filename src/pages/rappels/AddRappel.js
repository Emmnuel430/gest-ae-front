import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";

const AddRappel = ({ onClose }) => {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateRappel, setDateRappel] = useState("");
  const [type, setType] = useState("");
  const [priorite, setPriorite] = useState("basse");
  const [statut, setStatut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("user-info"));
  const userId = userInfo ? userInfo.id : null;

  if (!userId) {
    alert("Utilisateur non authentifié. Veuillez vous connecter.");
    navigate("/");
    return;
  }

  const handleConfirm = () => {
    setShowModal(false);
    addRappel();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const addRappel = async () => {
    if (!titre || !dateRappel || !type) {
      setError("Les champs étoilés sont requis.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const item = {
        titre,
        description: description || null,
        date_rappel: dateRappel,
        type,
        priorite,
        statut,
        idUser: userId,
      };

      let result = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/add_rappel`,
        {
          method: "POST",
          body: JSON.stringify(item),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      result = await result.json();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setLoading(false);
      alert("Rappel ajouté");
      setTitre("");
      setDescription("");
      setDateRappel("");
      setType("");
      setPriorite("basse");
      setStatut(false);
      if (onClose) onClose(); // Fermer le modal après ajout
      navigate("/rappels-complets");
    } catch (e) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handlePrioriteChange = (action) => {
    const levels = ["basse", "moyenne", "élevée"];
    const index = levels.indexOf(priorite);
    if (action === "increase" && index < levels.length - 1) {
      setPriorite(levels[index + 1]);
    } else if (action === "decrease" && index > 0) {
      setPriorite(levels[index - 1]);
    }
  };

  const getProgressValue = () => {
    switch (priorite) {
      case "basse":
        return 33;
      case "moyenne":
        return 66;
      case "élevée":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <>
      <div className="">
        <h1>Création d'un nouveau rappel</h1>
        {error && <ToastMessage message={error} onClose={() => setError("")} />}

        <br />
        <label htmlFor="titre" className="form-label">
          Titre *
        </label>
        <input
          type="text"
          id="titre"
          className="form-control"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
        />
        <br />
        <label htmlFor="dateRappel" className="form-label">
          Date du rappel *
        </label>
        <input
          type="date"
          id="dateRappel"
          className="form-control"
          value={dateRappel}
          onChange={(e) => setDateRappel(e.target.value)}
          min={new Date().toISOString().split("T")[0]} // Date actuelle
        />
        <br />
        <label htmlFor="type" className="form-label">
          Type *
        </label>
        <input
          type="text"
          id="type"
          className="form-control"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <br />
        <label htmlFor="description" className="form-label">
          Description (optionnel)
        </label>
        <textarea
          id="description"
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />
        <label className="form-label">Priorité</label>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-secondary me-2"
            onClick={() => handlePrioriteChange("decrease")}
          >
            -
          </button>
          <div className="progress w-100" style={{ height: "30px" }}>
            <div
              className={`progress-bar text-uppercase bg-${
                priorite === "basse"
                  ? "secondary"
                  : priorite === "moyenne"
                  ? "warning"
                  : "danger"
              }`}
              role="progressbar"
              style={{ width: `${getProgressValue()}%` }}
            >
              {priorite}
            </div>
          </div>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => handlePrioriteChange("increase")}
          >
            +
          </button>
        </div>
        <br />

        <div className="mb-4">
          <h6>Statut du rappel :</h6>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="statutSwitch"
              checked={statut}
              onChange={(e) => setStatut(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="statutSwitch">
              {statut ? "Terminé" : "En cours"}
            </label>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={!titre || !dateRappel || !type || loading}
          className="btn btn-primary w-100 mt-3"
        >
          {loading ? "En cours..." : "Ajouter"}
        </button>
      </div>
      <ConfirmPopup
        show={showModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmer l'ajout"
        body={<p>Voulez-vous vraiment ajouter ce rappel ?</p>}
      />
    </>
  );
};

export default AddRappel;
