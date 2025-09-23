import "./App.css";
import SchoenfeldClosedForm from "./SchoenfeldClosedForm";
import TrialList from "./TrialList";
import TrialDetail from "./TrialDetail";
import SimulateFromTrial from "./SimulateFromTrial";
import LandingPage from "./LandingPage"; // Import the new LandingPage component
import PrognosticFactorsGrid from "./PrognosticFactorsGrid";
import { Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      {/* Hamburger menu for mobile */}
      <div
        className={`md:hidden p-4 text-white focus:outline-none z-50 fixed top-0 w-full px-4 bg-gemini-blue ${isNavOpen ? "hidden" : ""}`}
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <svg
          className="w-6 h-6 cursor-pointer"
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
      </div>

      {/* Overlay for mobile nav */}
      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsNavOpen(false)}
        ></div>
      )}
      <div className="flex rounded-r-md min-h-screen w-full">
        {/* Left Navigation Bar */}
        <nav
          className={`transform ${isNavOpen ? "translate-x-0" : "-translate-x-full"} z-40 transition-transform duration-300 ease-in-out w-64 text-white p-4 space-y-4 rounded-r-md bg-gemini-blue md:relative md:translate-x-0 md:block md:h-auto md:min-h-full fixed inset-y-0 left-0`}
        >
          <img
            src="/stratum-logo-dark.svg"
            alt="Stratum Logo"
            className="p-4 md:pt-4 mb-8 drop-shadow-md drop-shadow-gemini-blue-hover"
          />
          <ul className="space-y-3">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block py-2 px-4 rounded-md ${isActive ? "bg-gemini-blue-hover" : "hover:bg-gemini-blue-hover"}`
                }
                onClick={() => setIsNavOpen(false)} // Close nav on link click
              >
                Home
              </NavLink>
            </li>
            <li className="pt-4">
              <h3 className="text-xs uppercase mb-2">Simulation</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/trials"
                    className={({ isActive }) =>
                      `block py-2 pl-4 rounded-md ${isActive ? "bg-gemini-blue-hover" : "hover:bg-gemini-blue-hover"}`
                    }
                    onClick={() => setIsNavOpen(false)} // Close nav on link click
                  >
                    Start from a Trial
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/schoenfeld"
                    className={({ isActive }) =>
                      `block py-2 pl-4 rounded-md ${isActive ? "bg-gemini-blue-hover" : "hover:bg-gemini-blue-hover"}`
                    }
                    onClick={() => setIsNavOpen(false)} // Close nav on link click
                  >
                    Free-form
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className="pt-4">
              <h3 className="text-xs uppercase mb-2">Parameters</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/prognostic-factors"
                    className={({ isActive }) =>
                      `block py-2 pl-4 rounded-md ${isActive ? "bg-gemini-blue-hover" : "hover:bg-gemini-blue-hover"}`
                    }
                    onClick={() => setIsNavOpen(false)} // Close nav on link click
                  >
                    Prognostic Factors
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>{" "}
          <div className="absolute bottom-4 left-0 w-full px-4 text-center text-md">
            <p>
              Requests? Bugs?
              <br />
              <a
                href="mailto:feedback@stratum.bio"
                className="text-white hover:text-gemini-blue-hover"
              >
                feedback@stratum.bio
              </a>
            </p>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="md:p-6 w-full pt-16 md:pt-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/schoenfeld" element={<SchoenfeldClosedForm />} />
            <Route path="/trials" element={<TrialList />} />
            <Route path="/trial-detail/:trialName" element={<TrialDetail />} />
            <Route
              path="/simulate-from-trial/:trialName"
              element={<SimulateFromTrial />}
            />
            <Route
              path="/prognostic-factors"
              element={<PrognosticFactorsGrid />}
            />
            {/* Fallback route for any unmatched paths, redirects to LandingPage */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
