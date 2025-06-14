import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Protected = ({ Cmp, adminOnly = false }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("user-info");

    if (!userInfo) {
      navigate("/"); // Redirection si non connecté
      return;
    }

    const user = JSON.parse(userInfo);

    const checkUserInDB = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/user/${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unauthorized");
          // Interdit
        }

        const data = await response.json();
        const currentUser = data.user;

        // Vérification adminOnly
        if (adminOnly && !currentUser.role) {
          navigate("/access-denied");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        // Token invalide, utilisateur supprimé, etc.
        localStorage.removeItem("user-info");
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    checkUserInDB();
  }, [adminOnly, navigate]);

  return <>{isAuthorized ? <Cmp /> : null}</>;
};

export default Protected;
