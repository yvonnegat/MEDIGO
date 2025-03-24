import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, IconButton, TextField, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { removeFromCart, updateCartQuantity } from '../redux/stores'; // Ensure this import matches the actual path
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const CartPage = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  // Debugging: Verify cart data
  console.log('Cart from Redux store:', cart);

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item));
  };

  const handleQuantityChange = (item, quantity) => {
    if (quantity > 0) {
      dispatch(updateCartQuantity({ ...item, quantity }));
    }
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * item.quantity, 0);
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token'); // Check if user is logged in
    if (!token) {
      navigate('/login'); // Redirect to login if not authenticated
    } else {
      navigate('/checkout'); // Proceed to checkout if logged in
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Header />
      <br />
      <Typography
        variant="h4"
        gutterBottom
        style={{
          marginBottom: '20px',
          textAlign: 'center',
          color: theme.palette.primary.main,
          fontWeight: 'bolder',
          fontFamily: theme.typography.fontFamily,
        }}
      >
        SHOPPING CART
      </Typography>
      <Container
        maxWidth="lg"
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          marginTop: '20px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <Typography variant="body1" style={{ marginBottom: '20px', color: theme.palette.text.secondary }}>
              Your cart is empty.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/shop"
              style={{ marginTop: '20px', backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main) }}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <img src={item.imageUrl} alt={item.title} style={{ width: '100px', borderRadius: '8px' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" gutterBottom style={{ fontWeight: 500 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell>${item.price}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
                          inputProps={{ min: 1 }}
                          style={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleRemoveFromCart(item)}>
                          <DeleteIcon color="secondary" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Typography variant="h6" style={{ color: theme.palette.text.primary }}>
                Subtotal: ${calculateTotalPrice().toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                onClick={handleCheckout}
                color="primary"
                style={{ marginTop: '20px', backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main) }}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </Container>
      <br />
      <Footer style={{ flexShrink: 0 }} />
    </div>
  );
};

export default CartPage;
