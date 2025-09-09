import React from "react";

const CitationFooter: React.FC = () => {
  return (
    <div className="lg:w-196 mt-32 text-sm text-gray-600 text-left">
      <p>All data is from the following source:</p>
      <p>
        "Cancer patient survival can be parametrized to improve trial precision
        and reveal time-dependent therapeutic effects” by Deborah Plana,
        Geoffrey Fell, Brian M. Alexander, Adam C. Palmer, Peter K. Sorger. Nat
        Commun 13, 873 (2022).{" "}
        <a
          href="https://doi.org/10.1038/s41467-022-28410-9"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          https://doi.org/10.1038/s41467-022-28410-9
        </a>
      </p>
    </div>
  );
};

export default CitationFooter;
