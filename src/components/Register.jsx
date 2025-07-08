import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';
import API from '../api.jsx'; // Apni API instance import ki (path updated)
import { useNavigate } from 'react-router-dom'; // React Router se navigation ke liye

function Register() {
  const [name, setName] = useState(''); // Naya state for name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault(); // Default form submission ko roka
    setError('');       // Pichhle errors clear kiye
    setSuccess('');     // Pichhle success messages clear kiye

    if (password !== confirmPassword) { // Password match check
      return setError('Password and Confirm Password missmatch!'); // Hinglish message
    }

    try {
      const res = await API.post('/auth/register', { name, email, password }); // Backend API call
      setSuccess(res.data.message); // Success message set kiya
      localStorage.setItem('token', res.data.token); // Token localStorage mein save kiya
      localStorage.setItem('userId', res.data.userId); // userId localStorage mein save kiya
      localStorage.setItem('email', res.data.email); // email localStorage mein save kiya
      localStorage.setItem('name', res.data.name); // name localStorage mein save kiya
      navigate('/dashboard'); // Dashboard par redirect kiya
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed'); // Error message set kiya
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Register Form
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {/* Name input field */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Your Naam" // Hinglish label
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password" // Hinglish label
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Register;
