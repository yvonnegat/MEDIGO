import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003C71', // Deep Blue
      contrastText: '#FFFFFF', // White for contrast
    },
    secondary: {
      main: '#4F9CC3', // Light Blue
      contrastText: '#FFFFFF', // White for contrast
    },
    error: {
      main: '#D14836', // Error color
    },
    warning: {
      main: '#FF5722', // Bold Orange for warnings
    },
    info: {
      main: '#003C71', // Deep Blue
    },
    success: {
      main: '#388E3C', // Green for success messages
    },
    background: {
      default: '#FFFFFF', // White for default background
      paper: '#F4F4F4', // Soft Gray for paper elements
    },
    text: {
      primary: '#333333', // Dark Gray for primary text
      secondary: '#4F9CC3', // Light Blue for secondary text
      disabled: '#B0B0B0', // Disabled text color
    },
  },
  typography: {
    fontFamily: [
      'Sevillana',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#003C71', // Deep Blue for headers
    },
    body1: {
      fontSize: '1rem',
      color: '#333333', // Dark Gray for body text
      lineHeight: '1.6',
    },
    // Additional typography styles...
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#003C71', // Deep Blue
          color: '#FFFFFF', // White for text
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        },
        colorInherit: {
          color: '#FFFFFF', // White for text
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF', // White
          color: '#003C71', // Deep Blue text
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // White
          borderRadius: '8px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#4F9CC3', // Light Blue
            },
            '&:hover fieldset': {
              borderColor: '#003C71', // Deep Blue
            },
            '&.Mui-focused fieldset': {
              borderColor: '#003C71', // Deep Blue
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#003C71', // Deep Blue
          borderRadius: '20px',
          padding: '8px 16px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#4F9CC3', // Light Blue
            color: '#FFFFFF', // White
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#FFFFFF', // White
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF', // White
          color: '#003C71', // Deep Blue text
          borderRadius: '16px',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#003C71', // Deep Blue
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#003C71', // Deep Blue
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: '#4F9CC3', // Light Blue
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#003C71', // Deep Blue
          '&:hover': {
            color: '#4F9CC3', // Light Blue
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // White
          padding: '20px',
        },
      },
    },
  },
});

export default theme;
