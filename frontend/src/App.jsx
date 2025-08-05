
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import '../firebase.js';
// Updated import path
import AuthComponent from './Components/AuthCard'
import LandingPage from './Pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/auth" element={<AuthComponent />} />
        {/* Add more routes here as needed */}
        {/* Example:
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        */}
      </Routes>
    </BrowserRouter>
  )
}

export default App