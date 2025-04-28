// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2FB8A0', // Calm soft teal for main actions (trust & freshness)
    },
    secondary: {
      main: '#5C9EFF', // Cool, calming blue for secondary actions
    },
    background: {
      default: '#E6F5EA', // Light mint for healthy background
      paper: '#FFFFFF', // Clean white for cards and content
    },
    text: {
      primary: '#333333', // Crisp dark gray for main text
      secondary: '#555555', // Slightly lighter for subtext
    },
  },
  typography: {
    fontFamily: `'Inter', sans-serif`,
    h1: {
      fontSize: '2.2rem',
      fontWeight: 700,
      color: '#333333',
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 600,
      color: '#333333',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#555555',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#E6F5EA',
          color: '#333333',
          fontFamily: `'Inter', sans-serif`,
          margin: 0,
          padding: 0,
          minHeight: '100vh',
        },
        h1: {
          fontSize: '2.2rem',
          fontWeight: 700,
          color: '#333333',
        },
        h2: {
          fontSize: '1.8rem',
          fontWeight: 600,
          color: '#333333',
        },
        p: {
          fontSize: '1rem',
          color: '#555555',
        },
        a: {
          color: '#2FB8A0',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Professional soft button
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 8px rgba(47, 184, 160, 0.4)', // Teal glow
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Soft card shadow
          backgroundColor: '#FFFFFF',
          padding: '20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#2FB8A0',
            },
            '&:hover fieldset': {
              borderColor: '#5C9EFF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2FB8A0',
              boxShadow: '0 0 8px rgba(47, 184, 160, 0.4)',
            },
          },
        },
      },
    },
  },
});

export default theme;
