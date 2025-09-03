import React from 'react';

interface ValidatedInputFieldProps {
  min: number;
  max: number;
  keyValue: string;
  label: React.ReactNode;
  value: number;
  onValueChange?: (value: number) => void;
}


export const ValidatedInputField: React.FC<ValidatedInputFieldProps> = ({ min, max, keyValue, label, value, onValueChange = () => {} }) => {
  let className = "shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";
  if (value >= max || value <= min) {
    className += " border-red-500";
  }

  return <div className="flex items-center mb-4 justify-end">
    <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor={keyValue}>{label}</label>
    <input className={className}
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
};


export default ValidatedInputField;
