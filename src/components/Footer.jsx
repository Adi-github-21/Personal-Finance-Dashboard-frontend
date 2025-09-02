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
        background: 'linear-gradient(to right, #2d91f5ff, #c2e9fb)', // Theme se dark primary color
        color: '#333',          // White text
        textAlign: 'center',
        borderTop: '1px solid rgba(7, 17, 23, 0.34) !important',
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