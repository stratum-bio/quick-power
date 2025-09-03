import './App.css'
import SchoenfeldClosedForm from './SchoenfeldClosedForm';

function App() {
  return (
    <div className="App">
      <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl mb-8">Survival Sample Size</h2>
          <SchoenfeldClosedForm />
      </div>
    </div>
  )
}

export default App
