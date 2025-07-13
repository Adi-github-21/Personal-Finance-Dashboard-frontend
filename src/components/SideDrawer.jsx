import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LoopIcon from '@mui/icons-material/Loop'; // For EMI
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // For Debt Tracking
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240; // Drawer ki चौड़ाई

function SideDrawer({ open, toggleDrawer, onLogout }) {
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { divider: true },
    { header: 'Accounts' },
    { text: 'Bank Accounts', icon: <AccountBalanceIcon />, path: '/bank-accounts' },
    { text: 'Investments', icon: <ShowChartIcon />, path: '/investments' },
    { text: 'Fixed Deposits (FDs)', icon: <AttachMoneyIcon />, path: '/fixed-deposits' },
    { divider: true },
    { header: 'Debts & Liabilities' },
    { text: 'EMI Tracking', icon: <LoopIcon />, path: '/emi-tracking' },
    { text: 'Debt Tracking', icon: <PeopleAltIcon />, path: '/debt-tracking' },
    { divider: true },
    { header: 'Spending & Savings' },
    { text: 'Expense Tracking', icon: <CreditCardIcon />, path: '/expense-tracking' },
    { text: 'Savings Goals', icon: <SavingsIcon />, path: '/savings-goals' },
    { divider: true },
    { text: 'Reports / Insights', icon: <ReceiptLongIcon />, path: '/reports' },
    { divider: true },
    { header: 'Other' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help / Support', icon: <HelpOutlineIcon />, path: '/help' },
    { text: 'Logout', icon: <LogoutIcon />, action: onLogout }, // Logout action
  ];

  return (
    <Drawer
      variant="temporary" // Temporary drawer for mobile
      open={open}
      onClose={toggleDrawer}
      ModalProps={{
        keepMounted: true, // For better mobile performance
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper', // Theme se background color
          color: 'text.primary',      // Theme se text color
        },
      }}
    >
      <Toolbar sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          Navigation
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} sx={{ my: 1 }} />
          ) : item.header ? (
            <Typography key={`header-${index}`} variant="overline" sx={{ px: 2, pt: 1, pb: 0.5, color: 'text.secondary' }}>
              {item.header}
            </Typography>
          ) : (
            // <-- Yahan 'ListItem' ko hamesha button={true} rakhenge
            // Aur Link ko ListItem ke andar wrap karenge
            <ListItem
              key={item.text}
              button // Hamesha button ki tarah behave karega
              onClick={item.action || toggleDrawer} // Action ya drawer close
              sx={{
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'white',
                },
                '&:hover .MuiListItemIcon-root': {
                  color: 'white',
                },
                // Link ke default styling ko override karein
                padding: 0, // ListItem ka padding control karein
              }}
            >
              {item.path ? (
                // Agar path hai toh Link ko andar wrap karein
                <Link
                  to={item.path}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 16px', // ListItem ke default padding ko yahan lagayein
                  }}
                >
                  <ListItemIcon sx={{ color: 'text.primary' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </Link>
              ) : (
                // Agar path nahi hai (jaise Logout), toh direct content
                <>
                  <ListItemIcon sx={{ color: 'text.primary' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </>
              )}
            </ListItem>
          )
        ))}
      </List>
    </Drawer>
  );
}

export default SideDrawer;
