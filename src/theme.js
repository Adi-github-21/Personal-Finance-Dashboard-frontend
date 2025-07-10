
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3', // Medium to dark blue (Professional & Trustworthy)
      light: '#64B5F6', // Thoda halka blue for accents/hover
      dark: '#1976D2',  // Thoda gehra blue
    },
    secondary: {
      main: '#00BFA5', // Teal/Green (Positive indicators, growth)
      light: '#33E0C8',
      dark: '#00897B',
    },
    background: {
      default: '#F5F5F5', // Off-white/Light gray for clean background
      paper: '#FFFFFF',   // Card/Paper backgrounds ke liye white
    },
    text: {
      primary: '#424242', // Dark gray for readability
      secondary: '#757575', // Lighter gray for secondary text
    },
    // Agar aap orange/amber bhi use karna chahte hain alerts ke liye:
    // warning: {
    //   main: '#FFC107',
    // },
  },
  typography: {
    fontFamily: 'Inter, sans-serif', // Inter font use karein
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h4: { fontSize: '1.8rem', fontWeight: 600 },
    // Aur bhi typography settings yahan add kar sakte hain
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners for buttons
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners for cards/paper
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Navbar ke corners round nahi honge
        },
      },
    },
  },
});

export default theme;
