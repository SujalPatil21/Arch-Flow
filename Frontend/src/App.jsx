import { Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import AnalysisPage from './AnalysisPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
    </Routes>
  )
}

export default App
