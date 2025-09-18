import React, { useState } from 'react';
import { ProstateFactors } from './mock/prostate-prognostic';
import { RelationalOperator, type GroupType, type PrognosticFactorTable, type PrognosticFactor, Biomarker } from './types/prognostic-factors.d';

const formatGroup = (group: GroupType): string => {
  if (group.type === "numerical") {
    const operator = group.operator === RelationalOperator.EQUAL ? "=" :
                     group.operator === RelationalOperator.GREATER_THAN ? ">" :
                     group.operator === RelationalOperator.GREATER_THAN_OR_EQUAL ? ">=" :
                     group.operator === RelationalOperator.LESS_THAN ? "<" :
                     group.operator === RelationalOperator.LESS_THAN_OR_EQUAL ? "<=" : "";
    return `${operator} ${group.value} ${group.unit || ''}`.trim();
  } else if (group.type === "range") {
    return `${group.lower_bound}-${group.upper_bound} ${group.unit || ''}`.trim();
  } else { // categorical
    return group.category || '';
  }
};

interface SavedDifference {
  biomarkerKey: Biomarker;
  comparisonIndex: number;
  field: 'hazard_ratio' | 'ci_lower' | 'ci_upper';
  value: number | undefined;
}

const PrognosticFactorsGrid: React.FC = () => {
  const [editableFactors, setEditableFactors] = useState<PrognosticFactorTable>(() => {
    const initialFactors = JSON.parse(JSON.stringify(ProstateFactors)); // Deep copy of defaults
    const savedDifferences = localStorage.getItem('prostateFactorsDifferences');

    if (savedDifferences) {
      const differences: SavedDifference[] = JSON.parse(savedDifferences);
      differences.forEach(diff => {
        const factor = initialFactors[diff.biomarkerKey];
        if (factor && factor.comparison_group_list[diff.comparisonIndex]) {
          (factor.comparison_group_list[diff.comparisonIndex] as any)[diff.field] = diff.value;
        }
      });
    }
    return initialFactors;
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'neutral'} | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' | 'neutral') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000); // Message disappears after 3 seconds
  };

  const handleInputChange = (
    biomarkerKey: Biomarker,
    comparisonIndex: number,
    field: 'hazard_ratio' | 'ci_lower' | 'ci_upper',
    value: string
  ) => {
    setEditableFactors(prevFactors => {
      const newFactors = { ...prevFactors };
      const factor: PrognosticFactor = newFactors[biomarkerKey];
      if (factor) {
        const comparison = { ...factor.comparison_group_list[comparisonIndex] };
        (comparison as any)[field] = value === '' ? undefined : parseFloat(value);
        factor.comparison_group_list[comparisonIndex] = comparison;
      }
      return newFactors;
    });
  };

  const handleSave = () => {
    const differencesToSave: SavedDifference[] = [];
    Object.entries(editableFactors).forEach(([biomarkerKey, factor]) => {
      factor.comparison_group_list.forEach((comparison, index) => {
        const defaultFactor = ProstateFactors[biomarkerKey as Biomarker];
        const defaultComparison = defaultFactor?.comparison_group_list[index];

        if (defaultComparison) {
          // Check hazard_ratio
          if (comparison.hazard_ratio !== defaultComparison.hazard_ratio) {
            differencesToSave.push({
              biomarkerKey: biomarkerKey as Biomarker,
              comparisonIndex: index,
              field: 'hazard_ratio',
              value: comparison.hazard_ratio,
            });
          }
          // Check ci_lower
          if (comparison.ci_lower !== defaultComparison.ci_lower) {
            differencesToSave.push({
              biomarkerKey: biomarkerKey as Biomarker,
              comparisonIndex: index,
              field: 'ci_lower',
              value: comparison.ci_lower,
            });
          }
          // Check ci_upper
          if (comparison.ci_upper !== defaultComparison.ci_upper) {
            differencesToSave.push({
              biomarkerKey: biomarkerKey as Biomarker,
              comparisonIndex: index,
              field: 'ci_upper',
              value: comparison.ci_upper,
            });
          }
        }
      });
    });

    localStorage.setItem('prostateFactorsDifferences', JSON.stringify(differencesToSave));
    console.log('Differences saved to local storage:', differencesToSave);
    showMessage('Prognostic factor updates saved.', 'success');
  };

  const handleReset = () => {
    localStorage.removeItem('prostateFactorsDifferences');
    setEditableFactors(JSON.parse(JSON.stringify(ProstateFactors)));
    showMessage('Data reset to defaults.', 'neutral');
  };

  return (
    <div className="prognostic-factors-grid">
      <h1>Prognostic Factors for Prostate Cancer</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Biomarker</th>
            <th>Reference Group</th>
            <th>Comparison Group</th>
            <th>Hazard Ratio (HR)</th>
            <th>CI Lower</th>
            <th>CI Upper</th>
            <th>Patient Population</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(editableFactors).map(([biomarkerKeyStr, factor]) => (
            factor.comparison_group_list.map((comparison, index) => (
              <tr key={`${biomarkerKeyStr}-${index}`}>
                {index === 0 && (
                  <>
                    <td rowSpan={factor.comparison_group_list.length}>
                      {biomarkerKeyStr.replace(/_/g, ' ')}
                    </td>
                    <td rowSpan={factor.comparison_group_list.length}>
                      {formatGroup(factor.reference_group)}
                    </td>
                  </>
                )}
                <td>{formatGroup(comparison.group)}</td>
                <td>
                  <input
                    type="number"
                    value={comparison.hazard_ratio ?? ''}
                    onChange={(e) => handleInputChange(biomarkerKeyStr as Biomarker, index, 'hazard_ratio', e.target.value)}
                    className="w-24 p-1 border rounded"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={comparison.ci_lower ?? ''}
                    onChange={(e) => handleInputChange(biomarkerKeyStr as Biomarker, index, 'ci_lower', e.target.value)}
                    className="w-24 p-1 border rounded"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={comparison.ci_upper ?? ''}
                    onChange={(e) => handleInputChange(biomarkerKeyStr as Biomarker, index, 'ci_upper', e.target.value)}
                    className="w-24 p-1 border rounded"
                  />
                </td>
                <td>{comparison.patient_population}</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
      {message && (
        <div
          className={`p-3 mb-4 rounded ${message.type === 'success' ? 'text-success bg-success-2' : 'text-error bg-error-2'}`}
        >
          {message.text}
        </div>
      )}
      <div className="flex space-x-2 mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          onClick={handleReset}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default PrognosticFactorsGrid;
