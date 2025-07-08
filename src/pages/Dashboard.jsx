import React, { useEffect, useState } from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState(''); // State for user name

  useEffect(() => {
    // Check karein ki user logged in hai ya nahi
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name'); // name bhi fetch kiya
    if (!token || !email || !name) { // Ab name bhi check kiya
      navigate('/login'); // Agar token/email/name nahi hai toh login page par redirect karo
    } else {
      setUserEmail(email);
      setUserName(name); // Name set kiya
    }
  }, [navigate]); // navigate dependency array mein hai

  const handleLogout = () => {
    localStorage.removeItem('token'); // Token remove karo
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('name'); // name bhi remove kiya
    navigate('/login'); // Login page par redirect karo
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Aapke Dashboard mein Swagat hai, {userName || userEmail}! {/* Name display kiya */}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Yeh aapka personal finance overview hai. Aur features jald hi aayenge!
        </Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout Karein
        </Button>
        {/* Yahan par aap apne financial summaries aur quick links add karenge */}
      </Box>
    </Container>
  );
}

export default Dashboard;
