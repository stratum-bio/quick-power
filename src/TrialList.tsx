import React, { useEffect, useState } from 'react';
import type { TrialIndex } from './types/trialdata';

const TrialList: React.FC = () => {
  const [trialIndex, setTrialIndex] = useState<TrialIndex | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        const response = await fetch('/ct1.v1/index.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TrialIndex = await response.json();
        setTrialIndex(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrials();
  }, []);

  if (loading) {
    return <div>Loading trials...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Clinical Trials Index</h1>
      {trialIndex && trialIndex.trials.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 font-bold border-b pb-2 mb-2">
          <div>Identifier</div>
          <div>PubMed</div>
          <div>Publication Date</div>
        </div>
      ) : null}
      {trialIndex && trialIndex.trials.length > 0 ? (
        <div className="space-y-2">
          {trialIndex.trials.map((trial) => (
            <div key={trial.identifier} className="grid grid-cols-3 gap-4 border-b pb-2">
              <div>{trial.identifier}</div>
              <div>{trial.pubmed}</div>
              <div>{trial.publication_date}</div>
            </div>
          ))}
        </div>
      ) : (
        <div>No trials found.</div>
      )}
    </div>
  );
};

export default TrialList;
