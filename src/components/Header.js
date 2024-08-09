import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Box from '@mui/material/Box';

const Header = ({ onSearch }) => {
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
    <AppBar position="sticky" sx={{ 
      backgroundColor: 'transparent', 
      boxShadow: 'none', 
      backdropFilter: 'blur(10px)',
    }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleMenu} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', color: 'pink' ,fontFamily:'revert-layer' ,fontWeight:'bolder' ,fontSize:'40px'}}>
          <Link to="/" style={{ textDecoration: 'none', color: 'pink' }}>acrylic alchemy</Link>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton component={Link} to="/cart" color="inherit" sx={{ ml: 2 }}>
            <ShoppingCartIcon />
          </IconButton>
          {isLoggedIn && (
            <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <List sx={{ backgroundColor: 'pink', width: '250px', color: theme.palette.primary.contrastText }}>
          <ListItem button component={Link} to="/" onClick={() => setMenuOpen(false)}>
            <ListItemText primary="HOME" />
          </ListItem>
          <ListItem button component={Link} to="/gallery" onClick={() => setMenuOpen(false)}>
            <ListItemText primary="SHOP" />
          </ListItem>
          <ListItem button component={Link} to="/cart" onClick={() => setMenuOpen(false)}>
            <ListItemText primary="CART" />
          </ListItem>
          <ListItem button onClick={() => setMenuOpen(false)}>
            <ListItemText primary="HELP" />
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Header;
