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

  let className =
    "shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";
  if (value >= max || value <= min) {
    className += " border-red-500";
  }

  return (
    <div className="flex items-center mb-4 justify-end">
      <label
        className="block text-gray-700 text-sm font-bold mr-2"
        htmlFor={keyValue}
      >
        {label}
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
      <input
        className={className}
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
