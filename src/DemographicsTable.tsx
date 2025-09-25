import React from "react";
import {
  type StudyTable,
  type GroupData,
  DataType,
} from "./types/study_table.d";

interface DemographicsTableProps {
  studyTable: StudyTable;
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

const DemographicsTable: React.FC<DemographicsTableProps> = ({
  studyTable,
}) => {
  const groupCount = studyTable.groups.length;

  return (
    <div className="mt-8 max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">{studyTable.table_title}</h2>

      <div
        className={`grid grid-cols-${groupCount + 1} gap-x-4 items-center border-b pb-2 mb-2 rounded-md shadow-xl/30 shadow-gemini-blue ring ring-gemini-blue`}
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
            className={`pl-4 hover:bg-medium-azure-alpha col-span-${groupCount + 1} ${characteristic.group_data[0]?.data_type === DataType.Header ? "bg-medium-azure-alpha" : ""}`}
          >
            <div className={`grid grid-cols-${groupCount + 1} gap-x-4 items-center`}>
              <div
                className={`${characteristic.is_sub_characteristic ? "pl-4" : ""} ${characteristic.group_data[0]?.data_type === DataType.Header ? "font-semibold col-span-" + (groupCount+1) : ""}`}
              >
                {characteristic.original_label}{" "}
                {characteristic.unit ? `(${characteristic.unit})` : ""}
              </div>
              {characteristic.group_data.map((data, dataIndex) => (
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
