import "./App.css";
import SchoenfeldClosedForm from "./SchoenfeldClosedForm";
import TrialList from "./TrialList";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="flex rounded-lg ml-4 mt-4 mb-32">
      {/* Left Navigation Bar */}
      <nav className="w-64 text-dark-azure p-4 space-y-4 rounded-lg bg-theme-light">
        <h2 className="text-2xl font-bold mb-6">Navigation</h2>
        <ul className="space-y-2">
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
      <main className="p-6 w-full md:w-3/4 lg:w-1/2">
        <Routes>
          <Route
            path="/schoenfeld"
            element={
              <>
                <h2 className="text-3xl mb-8 text-black">
                  Survival Analysis: Sample Size Estimation
                </h2>
                <SchoenfeldClosedForm />
              </>
            }
          />
          <Route
            path="/trials"
            element={
                <TrialList />
            }
          />
          {/* Default route or redirect */}
          <Route
            path="*"
            element={
              <>
                <h2 className="text-3xl mb-8 text-black">
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
