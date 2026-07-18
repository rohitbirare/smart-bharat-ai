import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import CivicTwin from './pages/CivicTwin.jsx'
import LifeEvent from './pages/LifeEvent.jsx'
import Complaint from './pages/Complaint.jsx'
import History from './pages/History.jsx'
import HowItWorks from './pages/HowItWorks.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* Protected routes — require Google sign-in */}
          <Route path="/twin" element={<ProtectedRoute><CivicTwin /></ProtectedRoute>} />
          <Route path="/life-event" element={<ProtectedRoute><LifeEvent /></ProtectedRoute>} />
          <Route path="/complaint" element={<ProtectedRoute><Complaint /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
