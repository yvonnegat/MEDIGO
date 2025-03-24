import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, GlobalStyles, CircularProgress, Box } from '@mui/material';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import HomePage from './pages/Homepage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckOutPage';
import Login from './pages/LoginPage';
import Signup from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ContactPage from './pages/ContactPage';
import ProductDetails from './components/ProductDetails';
import ShopPage from './pages/ShopPage';
import theme from './theme';

const App = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVisitAndAuth = () => {
      const firstVisit = localStorage.getItem('firstVisit');
      if (!firstVisit) {
        setIsFirstVisit(true);
        localStorage.setItem('firstVisit', 'false');
      }

      onAuthStateChanged(auth, (user) => {
        setIsLoggedIn(!!user);
        setLoading(false);
      });
    };

    checkVisitAndAuth();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '*': {
            fontFamily: `${theme.typography.fontFamily} !important`,
            boxSizing: 'border-box',
          },
          body: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            margin: 0,
            padding: 0,
            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
          },
          button: {
            fontWeight: 'bold',
            borderRadius: '20px',
            padding: '10px 20px',
            boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1), -4px -4px 10px rgba(255, 255, 255, 0.7)',
            background: theme.palette.primary.main,
            border: 'none',
            color: '#fff',
            '&:hover': {
              background: theme.palette.primary.dark,
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={isFirstVisit && !isLoggedIn ? <Signup /> : <HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={isLoggedIn ? <Navigate to="/" /> : <Signup />} />
          <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isLoggedIn ? <AdminDashboardPage /> : <Navigate to="/login" />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
