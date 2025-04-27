import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import HistoryIcon from '@mui/icons-material/History';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: theme.palette.background.paper, 
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '0px',
        padding: '8px 16px',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Menu Button */}
        <IconButton size="large" edge="start" color="primary" onClick={toggleMenu} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        {/* Logo / Title */}
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            textAlign: 'center', 
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>mediGO</Link>
        </Typography>

        {/* Cart & Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton component={Link} to="/cart" color="primary" sx={{ ml: 2 }}>
            <ShoppingCartIcon />
          </IconButton>
          {isLoggedIn ? (
            <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ ml: 2 }}>
              Logout
            </Button>
          ) : (
            <Button component={Link} to="/login" variant="contained" color="primary" sx={{ ml: 2 }}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Drawer Menu */}
      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <List
          sx={{
            backgroundColor: theme.palette.background.paper,
            width: '250px',
            color: theme.palette.text.primary,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '10px',
          }}
        >
          {[
            { text: 'Home', icon: <HomeIcon />, link: '/' },
            { text: 'Shop', icon: <StorefrontIcon />, link: '/shop' },
            { text: 'Submit Prescription', icon: <LocalPharmacyIcon />, link: '/submit-prescription' },
            { text: 'My Prescriptions', icon: <HistoryIcon />, link: '/prescriptions' },
            { text: 'Order History', icon: <ShoppingCartIcon />, link: '/order-history' },
            { text: 'Cart', icon: <ShoppingCartIcon />, link: '/cart' },
            { text: 'Help', icon: <HelpOutlineIcon />, link: '#' },
          ].map(({ text, icon, link }) => (
            <ListItem
              button
              component={Link}
              to={link}
              key={text}
              onClick={() => setMenuOpen(false)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
            >
              {icon}
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Header;