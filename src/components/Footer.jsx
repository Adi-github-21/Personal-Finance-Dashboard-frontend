import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto', // Footer ko bottom par push karega
        bgcolor: 'primary.dark', // Theme se dark primary color
        color: 'white',          // White text
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="inherit">
          &copy; {new Date().getFullYear()} My Finance Dashboard. All rights reserved.
        </Typography>
        <Typography variant="body2" color="inherit" sx={{ mt: 0.5 }}>
          Designed with ❤️ for personal finance management.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;