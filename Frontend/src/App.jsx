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
  const [loading, setLoading] = useState(true); // Added missing loading state

  // Check authentication status
  const checkAuthStatus = () => {
    const storedUser = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('userType');
    
    console.log('Checking auth status:', { storedUser: !!storedUser, storedUserType });
    
    if (storedUser && storedUserType) {
      try {
        const user = JSON.parse(storedUser);
        console.log('User found in localStorage:', user);
        setIsAuthenticated(true);
        setUserRole(storedUserType);
        return true;
      } catch (error) {
        console.error("Invalid stored user data:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('access_token'); // Also clear token
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    console.log('App useEffect - checking auth status...');
    checkAuthStatus();
    setLoading(false);
  }, []);

  const handleAuthSuccess = (user, role) => {
    console.log('Auth success called:', { user, role });
    
    // Update state immediately
    setIsAuthenticated(true);
    setUserRole(role);
    
    // Ensure localStorage is updated
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userType', role);
    
    console.log('Auth state updated:', { isAuthenticated: true, userRole: role });
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('access_token');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('App render - Auth state:', { isAuthenticated, userRole });

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
              <Navigate 
                to={userRole === 'Tutor' ? "/tutor-dashboard" : "/learner-dashboard"} 
                replace 
              />
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
              <Uploadpage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback for unmatched routes */}
        <Route
          path="*"
          element={
            <Navigate 
              to={isAuthenticated 
                ? (userRole === 'Tutor' ? "/tutor-dashboard" : "/learner-dashboard")
                : "/login"
              } 
              replace 
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;