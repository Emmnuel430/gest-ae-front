import { useEffect, useState } from "react";
import { fetchWithToken } from "../../utils/fetchWithToken";
import eventBus from "../../utils/eventBus";

const useRappelCount = () => {
  const [rappelCount, setRappelCount] = useState(0);
  const [rappelImpCount, setRappelImpCount] = useState(0);

  const fetchRappels = async () => {
    try {
      const res = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/rappels_recents`
      );

      const response = await res.json(); // Convertir la réponse en JSON
      if (
        response &&
        response.recentImportantRappels !== undefined &&
        response.recentRappels !== undefined
      ) {
        setRappelImpCount(response.recentImportantRappels);
        setRappelCount(response.recentRappels);
      }
    } catch (error) {
      console.error("Erreur de récupération des rappels :", error);
    }
  };

  useEffect(() => {
    fetchRappels(); // appel initial

    // 🔔 Écoute des événements personnalisés
    eventBus.on("rappel_updated", fetchRappels);

    const interval = setInterval(() => {
      fetchRappels(); // appel toutes les 600 secondes par exemple
    }, 600000);

    return () => {
      eventBus.off("rappel_updated", fetchRappels);
      clearInterval(interval);
    };
  }, []);

  const totalRappels = rappelCount + rappelImpCount;

  return totalRappels; // retourne le nombre de rappels et le nombre de rappels importants
};

export default useRappelCount;
