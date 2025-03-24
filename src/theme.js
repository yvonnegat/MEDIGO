import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#B17F59', // Warm brownish tone for primary actions
    },
    secondary: {
      main: '#A5B68D', // Muted green for secondary actions
    },
    background: {
      default: '#EDE8DC', // Light neutral background for a clean look
      paper: '#C1CFA1', // Soft green for subtle contrast
    },
    text: {
      primary: '#3D3D3D', // Dark gray for readability
      secondary: '#5A5A5A',
    },
  },
  typography: {
    fontFamily: `'Inter', sans-serif`,
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px', // Rounded for a soft claymorphic feel
          padding: '10px 20px',
          boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
          boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          backgroundColor: '#EDE8DC',
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
              borderColor: '#A5B68D',
            },
            '&:hover fieldset': {
              borderColor: '#B17F59',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#B17F59',
              boxShadow: '0 0 8px rgba(177, 127, 89, 0.5)',
            },
          },
        },
      },
    },
  },
});

export default theme;
