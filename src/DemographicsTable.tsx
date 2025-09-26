import React, { useState, useEffect } from "react";
import {
  type StudyTable,
  type GroupData,
  DataType,
} from "./types/study_table.d";

interface DemographicsTableProps {
  pubmed: string | number;
  showTitle?: boolean;
}

function renderGroupData(data: GroupData) {
  switch (data.data_type) {
    case DataType.NumericSingle:
      return data.value !== undefined ? data.value.toString() : "";
    case DataType.NumericMeanRange:
      return data.range_min !== undefined && data.range_max !== undefined
        ? `${data.range_min}-${data.range_max}`
        : "";
    case DataType.CategoricalCountPercentage:
      return data.count !== undefined && data.percentage !== undefined
        ? `${data.count} (${data.percentage}%)`
        : data.raw_string;
    case DataType.Header:
      return ""; // Headers are handled by the characteristic label
    case DataType.Text:
      return data.text_value || data.raw_string;
    default:
      return data.raw_string;
  }
}

const DemographicsTable: React.FC<DemographicsTableProps> = ({ pubmed, showTitle = false}) => {
  const [studyTable, setStudyTable] = useState<StudyTable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudyTable = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/demographics/${pubmed}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StudyTable = await response.json();
        setStudyTable(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudyTable();
  }, [pubmed]);

  if (loading) {
    return <div>Loading demographics data...</div>;
  }

  if (!studyTable) {
    return <div></div>;
  }

  const groupCount = studyTable.groups.length;

  return (
    <div className="mt-8 max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">
        {showTitle ?  studyTable.study_title : "Patient Characteristics" }
      </h2>

      <p className="italic mb-4 ">
        Disclaimer: data is in the process of being cleaned and verified.
        Reference the original publication for accurate and most legible
        information. This data was extracted from the publication.
      </p>

      <div
        className={`grid gap-x-4 items-center border-b pb-2 mb-2 rounded-md shadow-xl/30 shadow-gemini-blue ring ring-gemini-blue`}
        style={{
          gridTemplateColumns: `repeat(${groupCount + 1}, minmax(0, 1fr))`,
        }}
      >
        {/* Header Row */}
        <div className="font-bold p-4">Characteristic</div>
        {studyTable.groups.map((group, index) => (
          <div key={index} className="font-bold text-center">
            {group.name} (N={group.n})
          </div>
        ))}

        {/* Characteristics */}
        {studyTable.characteristics.map((characteristic, charIndex) => (
          <div
            key={charIndex}
            className={`pl-4 hover:bg-medium-azure-alpha col-span-full ${characteristic.group_data[0]?.data_type === DataType.Header ? "bg-medium-azure-alpha" : ""}`}
          >
            <div
              className={`grid gap-x-4 items-center`}
              style={{
                gridTemplateColumns: `repeat(${groupCount + 1}, minmax(0, 1fr))`,
              }}
            >
              <div
                className={`${characteristic.is_sub_characteristic ? "pl-4" : ""} ${characteristic.group_data[0]?.data_type === DataType.Header ? "pt-1 pb-1 font-semibold col-span-3" : "col-span-1"}`}
              >
                {characteristic.original_label}{" "}
                {characteristic.unit ? `(${characteristic.unit})` : ""}
              </div>
              {characteristic.group_data[0]?.data_type != DataType.Header &&
                characteristic.group_data.map((data, dataIndex) => (
                  <div key={dataIndex} className="col-span-1 text-center">
                    {renderGroupData(data)}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {studyTable.footnotes.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <h3 className="font-semibold">Footnotes:</h3>
          <ul className="list-disc list-inside">
            {studyTable.footnotes.map((footnote, index) => (
              <li key={index}>{footnote}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DemographicsTable;
