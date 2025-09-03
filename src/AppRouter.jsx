import React from 'react';
// Naya: Link ko yahan import kiya gaya hai
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BankAccounts from './pages/BankAccounts.jsx';
import Investments from './pages/Investments.jsx';
import FixedDeposits from './pages/FixedDeposits.jsx';
import EmiTracking from './pages/EmiTracking.jsx';
import DebtTracking from './pages/DebtTracking.jsx';
import ExpenseTracking from './pages/ExpenseTracking.jsx';
import SavingsGoals from './pages/SavingsGoals.jsx';
import MainLayout from './layouts/MainLayout.jsx';

// PrivateRoute component jo check karega ki user logged in hai ya nahi
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Login, Register, Landing) - No MainLayout here */}
        <Route
          path="/"
          element={
            <MainLayout> {/* <-- MainLayout add kiya */}
              <Navigate to="/login" />
            </MainLayout>
          }
        /> 
        <Route
          path="/register"
          element={
            <MainLayout> {/* <-- MainLayout add kiya */}
              <Register />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout> {/* <-- MainLayout add kiya */}
              <Login />
            </MainLayout>
          }
        />
        <Route path="/features" element={
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h4">Features Page (Not Logged In)</Typography>
            <Typography variant="body1">This page would highlight your app's features for visitors.</Typography>
            <Button component={Link} to="/login" sx={{ mt: 2 }}>Login</Button>
          </Box>
        } />

        {/* Protected Routes - MainLayout ke andar */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        {/* Future protected routes yahan add honge, MainLayout ke andar */}
        <Route
          path="/bank-accounts"
          element={
            <PrivateRoute>
              <MainLayout>
                <BankAccounts />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/investments"
          element={
            <PrivateRoute>
              <MainLayout>
                <Investments />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/fixed-deposits"
          element={
            <PrivateRoute>
              <MainLayout>
                <FixedDeposits />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/emi-tracking"
          element={
            <PrivateRoute>
              <MainLayout>
                <EmiTracking />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/debt-tracking"
          element={
            <PrivateRoute>
              <MainLayout>
                <DebtTracking />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/expense-tracking"
          element={
            <PrivateRoute>
              <MainLayout>
                <ExpenseTracking />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/savings-goals"
          element={
            <PrivateRoute>
              <MainLayout>
                <SavingsGoals />
              </MainLayout>
            </PrivateRoute>
          }
        /> 
      </Routes>
    </Router>
  );
}

export default AppRouter;