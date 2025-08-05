import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LearnerDashboard from './pages/LearnerDashboard';
import TutorDashboard from './pages/TutorDashboard';
import ContentViewer from './pages/ContentViewer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route 
                path="/learner/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['learner']}>
                    <LearnerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/tutor/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['tutor']}>
                    <TutorDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/content/:contentId" 
                element={
                  <ProtectedRoute allowedRoles={['learner', 'tutor']}>
                    <ContentViewer />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;