import React, { useState } from 'react';
import { Box } from '@mui/material'; // Removed Toolbar as it's not needed here
import Navbar from '../components/Navbar.jsx';
import SideDrawer from '../components/SideDrawer.jsx'; // Assuming this component exists
import Footer from '../components/Footer.jsx';
import { useNavigate } from 'react-router-dom';

function MainLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    navigate('/login');
  };

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') ? true : false;
  const userName = localStorage.getItem('name') || '';

  return (
    // Main container for the entire layout
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar component */}
      <Navbar
        toggleDrawer={toggleDrawer}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Side Drawer, only visible when logged in */}
      {isLoggedIn && (
        <SideDrawer
          open={drawerOpen}
          toggleDrawer={toggleDrawer}
          onLogout={handleLogout}
        />
      )}

      {/* Main content area that grows to fill available space */}
      {/* Removed 'p: 3' from here. Page-specific padding should be handled within each page component (e.g., BankAccounts.jsx's Container). */}
      {/* Removed <Toolbar /> as it was creating extra space below the Navbar. */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children} {/* Yahan page ka content render hoga */}
      </Box>

      {/* Footer component */}
      <Footer />
    </Box>
  );
}

export default MainLayout;
