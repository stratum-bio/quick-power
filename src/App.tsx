import './App.css'
import SchoenfeldClosedForm from './SchoenfeldClosedForm';

function App() {
  return (
    <div className="App">
      <div className="mx-auto p-6 bg-white rounded-lg shadow-md w-full md:w-3/4">
        <h2 className="text-3xl mb-8">Estimate Survival Sample Size</h2>
          <SchoenfeldClosedForm />
      </div>
    </div>
  )
}

export default App
