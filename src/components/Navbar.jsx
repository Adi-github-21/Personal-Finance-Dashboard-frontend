// personal-finance-dashboard-frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
// AddCircleOutlineIcon ki jagah ExploreIcon ya ArrowForwardIcon use karenge
import ExploreIcon from '@mui/icons-material/Explore'; // <-- Naya icon
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ toggleDrawer, isLoggedIn, userName, onLogout }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null); // For Profile/User Menu
  // const [addMenuAnchorEl, setAddMenuAnchorEl] = useState(null); // <-- Ab iski zaroorat nahi

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // handleAddMenu aur handleAddMenuClose ki ab zaroorat nahi
  // const handleAddMenu = (event) => {
  //   setAddMenuAnchorEl(event.currentTarget);
  // };
  // const handleAddMenuClose = () => {
  //   setAddMenuAnchorEl(null);
  // };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  // handleDashboardClick ki ab zaroorat nahi, Drawer se access hoga
  // const handleDashboardClick = () => {
  //   navigate('/dashboard');
  // };

  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        background: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.primary.light}) !important`,
        color: theme.palette.text.primary, 
        backdropFilter: 'blur(10px) !important',
        borderRadius: '30px',
        marginTop: '10px',
        borderBottom: '1px solid rgba(26, 154, 239, 0.92) !important',
      }}
    >
      <Toolbar>
        {/* Left Side: Logo / Brand Name and Hamburger Icon */}
        {isLoggedIn && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer} // <-- Hamburger icon Drawer kholega
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
              Login
            </Button>
            <Button variant="contained" color="secondary" component={Link} to="/register" sx={{ ml: 2 }}>
              Register
            </Button>
          </Box>
        ) : (
          // When Logged In
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* "GO TO" Button jo Drawer kholega */}
            <Button
              color="inherit"
              startIcon={<ExploreIcon />} // <-- Naya icon
              onClick={toggleDrawer} // <-- Drawer kholega
              sx={{ mr: 1 }}
            >
              GO TO
            </Button>
            {/* Add New Menu ki ab zaroorat nahi */}
            {/* <Menu
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
            </Menu> */}

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