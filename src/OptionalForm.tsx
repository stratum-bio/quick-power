import React, { useState } from "react";

interface OptionalFormProps {
  heading: string;
  children: React.ReactNode;
  color?: string;
}

const OptionalForm: React.FC<OptionalFormProps> = ({
  heading,
  children,
  color,
}) => {
  const [showContent, setShowContent] = useState<boolean>(false);

  return (
    <div className={`mt-8 ${color ?? "bg-white"} optional-input-panel`}>
      <h2
        className="optional-input-panel-heading"
        onClick={() => setShowContent(!showContent)}
      >
        <span>{heading}</span>
        <span>{showContent ? "▲" : "▼"}</span>
      </h2>
      {showContent && children}
    </div>
  );
};

export default OptionalForm;
