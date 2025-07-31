// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import AuthForm from "./components/Auth/AuthForm";
import LandingPage from "./pages/LandingPage";
import TutorDashboard from "./pages/TutorDashboard";
import './App.css';
import Uploadpage from "./pages/Uploadpage";
import StudentPage from "./pages/StudentPage";


function LearnerDashboard({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Learner Dashboard</h1>
          <button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, Learner!</h2>
          <p>Your learning content will appear here.</p>
        </div>
      </div>
    </div>
  );
}

// Main App component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check for authentication state on app load
    const storedUser = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('userType');
    if (storedUser && storedUserType) {
      setIsAuthenticated(true);
      setUserRole(storedUserType);
    }
  }, []);

  const handleAuthSuccess = (user, role) => {
    console.log('Auth success:', { user, role });
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userType', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              userRole === 'Tutor' ? (
                <Navigate to="/tutor-dashboard" replace />
              ) : (
                <Navigate to="/learner-dashboard" replace />
              )
            ) : (
              <AuthForm onAuthSuccess={handleAuthSuccess} />
            )
          }
        />

        {/* Protected Tutor Dashboard Route */}
        <Route
          path="/tutor-dashboard"
          element={
            isAuthenticated && userRole === 'Tutor' ? (
              <TutorDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected Learner Dashboard Route */}
        <Route
          path="/learner-dashboard"
          element={
            isAuthenticated && userRole === 'Learner' ? (
              <StudentPage onLogout={handleLogout}/>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected Upload Page (only for Tutors) */}
        <Route
          path="/upload"
          element={
            isAuthenticated && userRole === 'Tutor' ? (
              <Uploadpage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback for unmatched routes */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              userRole === 'Tutor' ? (
                <Navigate to="/tutor-dashboard" replace />
              ) : (
                <Navigate to="/learner-dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
