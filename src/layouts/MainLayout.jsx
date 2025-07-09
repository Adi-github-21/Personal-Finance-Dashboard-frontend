import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from '../components/Navbar.jsx';
import SideDrawer from '../components/SideDrawer.jsx';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        toggleDrawer={toggleDrawer}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />
      {isLoggedIn && ( // Drawer sirf logged in hone par dikhega
        <SideDrawer
          open={drawerOpen}
          toggleDrawer={toggleDrawer}
          onLogout={handleLogout}
        />
      )}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Navbar ke neeche space ke liye */}
        {children} {/* Yahan page ka content render hoga */}
      </Box>
      <Footer />
    </Box>
  );
}

export default MainLayout;
