
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import '../firebase.js';
// Updated import path
import AuthComponent from './Components/AuthCard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthComponent />} />
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