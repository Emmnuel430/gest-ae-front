import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Protected = ({ Cmp, adminOnly = false }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const excludedPaths = ["/", "/logout"];
    if (excludedPaths.includes(window.location.pathname)) return;

    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("user-info");
    const user = userInfo ? JSON.parse(userInfo) : null;

    if (!token || !user) {
      localStorage.clear();
      navigate("/");
      return;
    }

    const checkUserInDB = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/user`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unauthorized");
          // Interdit
        }

        const data = await response.json();
        const currentUser = data.user;

        if (
          !currentUser ||
          currentUser.id !== user.id ||
          currentUser.pseudo !== user.pseudo
        ) {
          throw new Error("Invalid user data");
        }

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
