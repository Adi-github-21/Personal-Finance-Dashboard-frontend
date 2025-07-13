import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3', 
      light: '#64B5F6', 
      dark: '#1976D2',  
    },
    secondary: {
      main: '#00BFA5', 
      light: '#33E0C8',
      dark: '#00897B',
    },
    background: {
      default: '#F5F5F5', 
      paper: '#FFFFFF',   
    },
    text: {
      primary: '#424242', 
      secondary: '#757575', 
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif', 
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h4: { fontSize: '1.8rem', fontWeight: 600 },

  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, 
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, 
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0, 
        },
      },
    },
  },
});

export default theme;
