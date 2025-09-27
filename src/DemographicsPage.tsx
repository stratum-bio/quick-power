import React from "react";
import { useParams } from "react-router-dom";
import DemographicsTable from "./DemographicsTable";

const DemographicsPage: React.FC = () => {
  const { pubmedId } = useParams<{ pubmedId: string }>();

  if (!pubmedId) {
    return <div>Error: PubMed ID not found in URL.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <DemographicsTable pubmed={pubmedId} showTitle={true} />
    </div>
  );
};

export default DemographicsPage;
