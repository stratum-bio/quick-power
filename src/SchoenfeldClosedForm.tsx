
import React, { useState } from 'react';

const SchoenfeldClosedForm: React.FC = () => {
  const [alpha, setAlpha] = useState<string>('');
  const [beta, setBeta] = useState<string>('');
  const [group1Proportion, setGroup1Proportion] = useState<string>('');
  const [group2Proportion, setGroup2Proportion] = useState<string>('');
  const [relativeHazard, setRelativeHazard] = useState<string>('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log({
      alpha,
      beta,
      group1Proportion,
      group2Proportion,
      relativeHazard,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center mb-4 justify-end">
        <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="alpha">Alpha:</label>
        <input
          className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          id="alpha"
          value={alpha}
          onChange={(e) => setAlpha(e.target.value)}
          step={0.5}
        />
      </div>
      <div className="flex items-center mb-4 justify-end">
        <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="beta">Beta:</label>
        <input
          className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          id="beta"
          value={beta}
          onChange={(e) => setBeta(e.target.value)}
          step="any"
        />
      </div>
      <div className="flex items-center mb-4 justify-end">
        <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="group1Proportion">Group 1 Proportion:</label>
        <input
          className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          id="group1Proportion"
          value={group1Proportion}
          onChange={(e) => setGroup1Proportion(e.target.value)}
          step="any"
        />
      </div>
      <div className="flex items-center mb-4 justify-end">
        <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="group2Proportion">Group 2 Proportion:</label>
        <input
          className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          id="group2Proportion"
          value={group2Proportion}
          onChange={(e) => setGroup2Proportion(e.target.value)}
          step="any"
        />
      </div>
      <div className="flex items-center mb-4 justify-end">
        <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="relativeHazard">Relative Hazard:</label>
        <input
          className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          id="relativeHazard"
          value={relativeHazard}
          onChange={(e) => setRelativeHazard(e.target.value)}
          step="any"
        />
      </div>
      <div className="text-center pl-30">
        <button className="bg-blue-200 hover:bg-blue-400 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Submit</button>
      </div>
    </form>
  );
};

export default SchoenfeldClosedForm;
