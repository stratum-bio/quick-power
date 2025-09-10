import "./App.css";
import SchoenfeldClosedForm from "./SchoenfeldClosedForm";
import TrialList from "./TrialList";
import TrialDetail from "./TrialDetail";
import { Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const overlayZVal = isNavOpen ? "z-30" : "-z-10";

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className={`md:hidden p-4 text-black focus:outline-none z-50 fixed top-4 left-4 bg-theme-light ${isNavOpen ? "hidden" : ""}`}
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isNavOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          )}
        </svg>
      </button>

      {/* Overlay for mobile nav */}
      {isNavOpen && (
        <div
          className={`fixed inset-0 bg-black opacity-50 ${overlayZVal} md:hidden`}
          onClick={() => setIsNavOpen(false)}
        ></div>
      )}
      <div className="flex rounded-lg md:m-4 min-h-screen">
        {/* Left Navigation Bar */}
        <nav
          className={`transform ${isNavOpen ? "translate-x-0" : "-translate-x-full"} z-40 transition-transform duration-300 ease-in-out w-64 text-dark-azure p-4 space-y-4 rounded-lg bg-theme-light md:relative md:translate-x-0 md:block md:h-auto md:min-h-full fixed inset-y-0 left-0`}
        >
          <img
            src="/stratum-logo-light.svg"
            alt="Stratum Logo"
            className="p-4 md:pt-4 mb-8"
          />
          <ul className="space-y-3">
            <li>
              <Link
                to="/schoenfeld"
                className="block py-2 px-4 rounded hover:bg-medium-azure-alpha"
                onClick={() => setIsNavOpen(false)} // Close nav on link click
              >
                Simulation
              </Link>
            </li>
            <li>
              <Link
                to="/trials"
                className="block py-2 px-4 rounded hover:bg-medium-azure-alpha"
                onClick={() => setIsNavOpen(false)} // Close nav on link click
              >
                Oncology Trials
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="md:p-6 w-full pt-16 md:pt-6">
          <Routes>
            <Route path="/schoenfeld" element={<SchoenfeldClosedForm />} />
            <Route path="/trials" element={<TrialList />} />
            <Route path="/trial-detail/:trialName" element={<TrialDetail />} />
            {/* Default route or redirect */}
            <Route path="*" element={<SchoenfeldClosedForm />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
