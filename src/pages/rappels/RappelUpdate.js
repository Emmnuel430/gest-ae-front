import React, { useState } from "react";

const RappelUpdate = ({ rappel, onClose, onUpdate }) => {
  const [updatedRappel, setUpdatedRappel] = useState({ ...rappel });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedRappel((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    onUpdate(updatedRappel);
  };

  const handlePrioriteChange = (action) => {
    const levels = ["basse", "moyenne", "élevée"];
    const index = levels.indexOf(updatedRappel.priorite);
    if (action === "increase" && index < levels.length - 1) {
      setUpdatedRappel((prev) => ({ ...prev, priorite: levels[index + 1] }));
    } else if (action === "decrease" && index > 0) {
      setUpdatedRappel((prev) => ({ ...prev, priorite: levels[index - 1] }));
    }
  };

  const getProgressValue = () => {
    switch (updatedRappel.priorite) {
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
    <div>
      <div className="mb-3">
        <label htmlFor="titre" className="form-label">
          Titre
        </label>
        <input
          type="text"
          className="form-control"
          id="titre"
          name="titre"
          value={updatedRappel.titre}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
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
                updatedRappel.priorite === "basse"
                  ? "secondary"
                  : updatedRappel.priorite === "moyenne"
                  ? "warning"
                  : "danger"
              }`}
              role="progressbar"
              style={{ width: `${getProgressValue()}%` }}
            >
              {updatedRappel.priorite}
            </div>
          </div>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => handlePrioriteChange("increase")}
          >
            +
          </button>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="date_rappel" className="form-label">
          Date de Rappel
        </label>
        <input
          type="date"
          className="form-control"
          id="date_rappel"
          name="date_rappel"
          value={updatedRappel.date_rappel}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          value={updatedRappel.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="type" className="form-label">
          Type
        </label>
        <input
          type="text"
          className="form-control"
          id="type"
          name="type"
          value={updatedRappel.type || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <h6>Statut du rappel :</h6>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="statutSwitch"
            checked={updatedRappel.statut}
            onChange={(e) =>
              setUpdatedRappel((prev) => ({
                ...prev,
                statut: e.target.checked,
              }))
            }
          />
          <label className="form-check-label" htmlFor="statutSwitch">
            {updatedRappel.statut ? "Terminé" : "En cours"}
          </label>
        </div>
      </div>
      <div className="text-end">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
        >
          Annuler
        </button>
        <button onClick={() => handleSubmit()} className="btn btn-primary">
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default RappelUpdate;
