import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout/Layout";
import ToastMessage from "../components/Layout/ToastMessage";
import { fetchWithToken } from "../utils/fetchWithToken";
import Loader from "../components/Layout/Loader";

const Parametres = () => {
  const [settings, setSettings] = useState("");
  const [initialSettings, setInitialSettings] = useState({});
  const [activeFields, setActiveFields] = useState({});
  const timersRef = useRef({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);

  // ✅ Récupérer le tarif horaire depuis l'API
  useEffect(() => {
    const fetchTarifs = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/scolarite/tarifs`
        );
        const data = await response.json();
        setSettings(data);
        setInitialSettings(data);
      } catch (error) {
        console.error("Erreur lors du chargement des tarifs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTarifs();
  }, []);

  const handleInputClick = (field) => {
    clearTimeout(timersRef.current[field]);

    setActiveFields((prev) => ({ ...prev, [field]: true }));

    timersRef.current[field] = setTimeout(() => {
      setActiveFields((prev) => ({ ...prev, [field]: false }));
    }, 15000); // Cache après 15s
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return Object.keys(settings).some(
      (key) => settings[key] !== initialSettings[key]
    );
  };

  // ✅ Modifier le tarif
  const handleSubmit = async () => {
    if (!hasChanges()) return;
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/settings/tarifs`,
        {
          method: "POST",
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) throw new Error("Échec de la mise à jour");

      setInitialSettings(settings);
      setSuccess(true);
    } catch (err) {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h1 className="mb-4">Paramètres</h1>

        {error && (
          <ToastMessage message={error} onClose={() => setError(null)} />
        )}

        {success && (
          <ToastMessage
            message="Tarif mis à jour avec succès !"
            onClose={() => setSuccess(false)}
            success={true}
          />
        )}

        <div className="row">
          {isloading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "60vh" }} // Centrer Loader au milieu de l'écran
            >
              <Loader />
            </div>
          ) : (
            Object.entries(settings).map(([key, value]) => (
              <div className="col-md-6 mb-3" key={key}>
                <label className="form-label text-capitalize">
                  {`Scolarité ${key
                    .replace("scolarite_", "")
                    .replace("_", " ")
                    .toUpperCase()}`}
                </label>
                {!activeFields[key] ? (
                  <div
                    className="form-control bg-body text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleInputClick(key)}
                  >
                    Cliquez pour voir ou modifier
                  </div>
                ) : (
                  <input
                    type="number"
                    className="form-control"
                    value={value || ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    onFocus={() => handleInputClick(key)}
                  />
                )}
              </div>
            ))
          )}
        </div>

        <div className="text-end mt-4">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!hasChanges() || loading}
          >
            {loading ? (
              <span>
                <i className="fas fa-spinner fa-spin"></i> Enregistrement...
              </span>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Parametres;
