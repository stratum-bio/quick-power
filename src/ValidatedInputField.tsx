import React, { useState } from "react";

interface ValidatedInputFieldProps {
  min: number;
  max: number;
  keyValue: string;
  label: React.ReactNode;
  value: number;
  onValueChange?: (value: number) => void;
  description?: string;
}

export const ValidatedInputField: React.FC<ValidatedInputFieldProps> = ({
  min,
  max,
  keyValue,
  label,
  value,
  onValueChange = () => {},
  description,
}) => {
  const [showDescription, setShowDescription] = useState<boolean>(false);

  let inputClassName = "mt-1 block w-48 pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md text-right";
  if (value >= max || value <= min) {
    inputClassName += " border-red-500";
  }

  return (
    <div className="mb-4 flex flex-col items-center lg:items-end">
      <div className="block text-left w-48">
      <label
        className="block font-medium text-gray-700 mb-1"
        htmlFor={keyValue}
      >
        {label}{" "}
        {description && (
          <span
            className="text-blue-800 cursor-help relative"
            onMouseEnter={() => setShowDescription(true)}
            onMouseLeave={() => setShowDescription(false)}
            onClick={() => setShowDescription(!showDescription)}
          >
            [?]
            {showDescription && (
              <div className="absolute z-10 bg-gray-700 text-white text-s rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 max-w-xl">
                {description}
              </div>
            )}
          </span>
        )}
      </label>
      </div>
      <input
        className={inputClassName}
        type="number"
        id={keyValue}
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          const num = parseFloat(value);
          onValueChange(num);
        }}
        step={0.05}
      />
    </div>
  );
};

export default ValidatedInputField;
