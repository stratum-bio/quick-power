import "./App.css";
import SchoenfeldClosedForm from "./SchoenfeldClosedForm";
import TrialList from "./TrialList";

function App() {
  return (
    <div className="App">
      <div className="mx-auto p-6 bg-white rounded-lg shadow-md w-full md:w-3/4">
        <h2 className="text-3xl mb-8 text-black">
          Survival Analysis: Sample Size Estimation
        </h2>
        <SchoenfeldClosedForm />
      </div>
      <div className="mx-auto p-6 bg-white rounded-lg shadow-md w-full md:w-3/4 mt-8">
        <TrialList />
      </div>
    </div>
  );
}

export default App;
