import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // For Add New button
import NotificationsIcon from '@mui/icons-material/Notifications'; // For Notifications
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ toggleDrawer, isLoggedIn, userName, onLogout }) {
  const navigate = useNavigate();
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Ab iski zaroorat nahi hai yahan

  const [anchorEl, setAnchorEl] = useState(null); // For Profile/User Menu
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState(null); // For Add New Menu

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddMenu = (event) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout(); // Parent component ko logout handle karne ke liye call karein
  };

  const handleDashboardClick = () => {
    navigate('/dashboard'); // Dashboard par navigate karein
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Left Side: Logo / Brand Name and Hamburger Icon */}
        {isLoggedIn && ( // Jab logged in ho, tab hamesha hamburger icon dikhega
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to={isLoggedIn ? "/dashboard" : "/"} style={{ textDecoration: 'none', color: 'inherit' }}>
            My Finance Dashboard
          </Link>
        </Typography>

        {/* Right Side: Conditional rendering based on login status */}
        {!isLoggedIn ? (
          // When NOT Logged In
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/features">
              Features
            </Button>
            <Button color="inherit" component={Link} to="/login">
              Login Karein
            </Button>
            <Button variant="contained" color="secondary" component={Link} to="/register" sx={{ ml: 2 }}>
              Register Karein
            </Button>
          </Box>
        ) : (
          // When Logged In
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Desktop par Dashboard button ki ab zaroorat nahi, Drawer se access hoga */}
            {/* {!isMobile && (
              <Button color="inherit" onClick={handleDashboardClick} sx={{ mr: 2 }}>
                Dashboard
              </Button>
            )} */}

            {/* Add New Button/Dropdown */}
            <Button
              color="inherit"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddMenu}
              sx={{ mr: 1 }}
            >
              Add New
            </Button>
            <Menu
              id="add-menu-appbar"
              anchorEl={addMenuAnchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(addMenuAnchorEl)}
              onClose={handleAddMenuClose}
            >
              <MenuItem onClick={handleAddMenuClose}>Add Expense</MenuItem>
              <MenuItem onClick={handleAddMenuClose}>Add Income</MenuItem>
              <MenuItem onClick={handleAddMenuClose}>Add Transaction</MenuItem>
            </Menu>

            {/* Notifications (Optional) */}
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <NotificationsIcon />
            </IconButton>

            {/* Profile / User Menu */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>My Profile</MenuItem>
              <MenuItem onClick={handleClose}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout Karein</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
