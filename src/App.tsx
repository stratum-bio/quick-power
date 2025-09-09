import "./App.css";
import SchoenfeldClosedForm from "./SchoenfeldClosedForm";
import TrialList from "./TrialList";
import TrialDetail from "./TrialDetail";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="flex rounded-lg m-4 h-full">
      {/* Left Navigation Bar */}
      <nav className="w-64 text-dark-azure p-4 space-y-4 rounded-lg bg-theme-light h-full mb-4">
        <img src="/stratum-logo-light.svg" alt="Stratum Logo" className="p-4 mb-8" />
        <ul className="space-y-3">
          <li>
            <Link
              to="/schoenfeld"
              className="block py-2 px-4 rounded hover:bg-medium-azure-alpha"
            >
              Simulation
            </Link>
          </li>
          <li>
            <Link
              to="/trials"
              className="block py-2 px-4 rounded hover:bg-medium-azure-alpha"
            >
              Clinical Trials
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="p-6 w-full">
        <Routes>
          <Route
            path="/schoenfeld"
            element={
                <SchoenfeldClosedForm />
            }
          />
          <Route
            path="/trials"
            element={
                <TrialList />
            }
          />
          <Route
            path="/trial-detail/:trial_name"
            element={
                <TrialDetail />
            }
          />
          {/* Default route or redirect */}
          <Route
            path="*"
            element={
              <>
                <h2 className="text-3xl mb-8 text-black text-left">
                  Survival Analysis: Sample Size Estimation
                </h2>
                <SchoenfeldClosedForm />
              </>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
