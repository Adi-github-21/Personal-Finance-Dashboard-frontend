import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register.jsx'; // Path updated
import Login from './components/Login.jsx';     // Path updated
import Dashboard from './pages/Dashboard.jsx';   // Path updated

// PrivateRoute component jo check karega ki user logged in hai ya nahi
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Landing page, abhi ke liye login/register par redirect kar raha hai */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Protected Dashboard route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* Future routes yahan add honge */}
      </Routes>
    </Router>
  );
}

export default AppRouter;