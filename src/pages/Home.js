import React from "react";
import Layout from "../components/Layout/Layout";
import Statistiques from "./main/Statistiques";
import Recents from "./main/Recents";
import Graph from "./main/Graph";
import LastSection from "./main/LastSection";

const Home = () => {
  return (
    <div>
      <Layout>
        <div className="container mt-2 px-4">
          <h1>Dashboard</h1>
          <h2>Bienvenue sur votre tableau de bord !</h2>
          <Statistiques />
          <Graph />
          <Recents />
          <LastSection />
        </div>
      </Layout>
    </div>
  );
};

export default Home;
