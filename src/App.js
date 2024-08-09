import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

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
import { ThemeProvider } from '@mui/material/styles';

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
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={isFirstVisit && !isLoggedIn ? <Signup /> : <HomePage />} />
          <Route path="/gallery" element={<ShopPage />} />
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
