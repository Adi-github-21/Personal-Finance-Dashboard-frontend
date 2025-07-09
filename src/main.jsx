import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // App.jsx import kiya
import './index.css'; // Basic CSS
import { ThemeProvider } from '@mui/material/styles'; // ThemeProvider import kiya
import CssBaseline from '@mui/material/CssBaseline'; // CssBaseline import kiya
import theme from './theme'; // Apna custom theme import kiya

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> {/* App ko theme se wrap kiya */}
      <CssBaseline /> {/* Material-UI ki default styling reset karega */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);