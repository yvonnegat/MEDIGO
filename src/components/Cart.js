import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, Typography, Grid, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { removeFromCart } from '../store'; // Import the action to remove from cart
import Header from './Header';
import Footer from './Footer';

const CartPage = () => {
  const cart = useSelector((state) => state.cart); // Access the cart state
  const dispatch = useDispatch(); // Get the dispatch function

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item)); // Dispatch the action to remove from cart
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  return (
    <>
      <Header />
      <div style={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Your Cart
        </Typography>
        {cart.length === 0 ? (
          <Typography variant="body1">Your cart is empty.</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {cart.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card>
                    <CardContent>
                      <img src={item.image} alt={item.title} style={{ width: '100%', marginBottom: '10px' }} />
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Price: ${item.price}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.description}
                      </Typography>
                      <IconButton onClick={() => handleRemoveFromCart(item)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Typography variant="h6" style={{ marginTop: '20px' }}>
              Subtotal: ${calculateTotalPrice().toFixed(2)}
            </Typography>
            <Button variant="contained" color="primary" style={{ marginTop: '20px' }}>
              Checkout
            </Button>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
