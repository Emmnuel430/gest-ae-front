import React from "react";
import { Table } from "react-bootstrap";
import { format } from "date-fns";

const RappelHistorique = ({ rappels }) => (
  <div>
    <h3 className="text-center italic">---Historique des rappels---</h3>
    <Table className="table table-striped table-hover text-center" responsive>
      <thead>
        <tr>
          <th>Statut</th>
          <th>Titre</th>
          <th>Priorité</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {rappels.filter((rappel) => rappel.statut).length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center">
              Aucun rappel terminé.
            </td>
          </tr>
        ) : (
          rappels
            .filter((rappel) => rappel.statut) // Afficher uniquement les rappels terminés
            .map((rappel, index) => (
              <tr key={index} className="table-row-disabled">
                <td>
                  <span className="badge bg-success">Terminé</span>
                </td>
                <td>{rappel.titre}</td>
                <td>
                  {rappel.priorite === "basse" ? (
                    <span className="badge bg-warning">Basse</span>
                  ) : rappel.priorite === "moyenne" ? (
                    <span className="badge" style={{ background: "#ff9800" }}>
                      Moyenne
                    </span>
                  ) : (
                    <span className="badge bg-danger">Elevée</span>
                  )}
                </td>
                <td>
                  {rappel.date_rappel
                    ? format(new Date(rappel.date_rappel), "dd/MM/yyyy")
                    : "Date invalide"}
                </td>
              </tr>
            ))
        )}
      </tbody>
    </Table>
  </div>
);

export default RappelHistorique;
