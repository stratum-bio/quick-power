import React from "react";

interface ErrorProps {
  errorMessage: string;
}

const AppError: React.FC<ErrorProps> = ({ errorMessage }) => {
  return (
    <div className="text-red-500 w-full text-center pt-16">
      <p>Error: {errorMessage}</p>
    </div>
  );
};

export default AppError;
