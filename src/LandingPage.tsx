import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col p-4 w-full">
      <h3 className="text-2xl text-gray-800 mb-12">
        Simulate my oncology clinical trial using:
      </h3>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full md:w-xl">
        <Link
          to="/schoenfeld"
          className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer w-80 h-30 text-center hover:bg-medium-azure-alpha"
        >
          <p className="text-xl text-gray-700">Custom Parameters</p>
        </Link>
        <Link
          to="/trials"
          className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer w-80 h-30 text-center hover:bg-medium-azure-alpha"
        >
          <p className="text-xl text-gray-700">An Existing Trial</p>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
