import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Grid, Typography, TextField, Button, Paper, Divider, Snackbar, Alert, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication
import { doc, setDoc, Timestamp } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebaseConfig'; // Ensure you import your Firebase configuration

const CheckoutPage = () => {
  const [user, setUser] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('creditCard'); // Default payment method
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    phone: '', // Added phone for M-Pesa
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openMpesaDialog, setOpenMpesaDialog] = useState(false);
  const cart = useSelector((state) => state.cart);

  useEffect(() => {
    // Fetch user details from Firebase Authentication
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        name: currentUser.displayName || '',
        email: currentUser.email || '',
      });
    }
  }, []);

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    if (!user) {
      console.error('User is not authenticated');
      return;
    }

    if (paymentMethod === 'mpesa') {
      handleOpenMpesaDialog();
    } else {
      placeOrder();
    }
  };

  const handleOpenMpesaDialog = () => {
    setOpenMpesaDialog(true);
  };

  const handleCloseMpesaDialog = () => {
    setOpenMpesaDialog(false);
  };

  const placeOrder = async () => {
    try {
      // Create a transaction object
      const transactionData = {
        userId: getAuth().currentUser.uid,
        userName: user.name,
        userEmail: user.email,
        shippingInfo,
        paymentMethod,
        paymentInfo: paymentMethod === 'creditCard' ? paymentInfo : {},
        cart,
        totalPrice: calculateTotalPrice(),
        timestamp: Timestamp.fromDate(new Date()),
      };

      // Save the transaction to Firestore
      await setDoc(doc(db, 'users', getAuth().currentUser.uid, 'transactions', `transaction_${Date.now()}`), transactionData);

      // Show success message
      setSnackbarMessage('Order placed successfully');
      setOpenSnackbar(true);
      console.log('Order placed successfully');
      // You may want to clear the cart or redirect the user here
    } catch (error) {
      console.error('Error placing order:', error);
      setSnackbarMessage('Error placing order');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      <Container maxWidth="lg" style={{ flex: 1, padding: '20px', marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', textAlign: 'center', color: '#333', fontWeight: 'bolder', fontFamily: 'serif' }}>
          CHECKOUT
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: '20px', marginBottom: '20px' }}>
              <Typography variant="h6" gutterBottom>
                User Details
              </Typography>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                margin="normal"
                value={user ? user.name : ''}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                value={user ? user.email : ''}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </Paper>
            <Paper style={{ padding: '20px', marginBottom: '20px' }}>
              <Typography variant="h6" gutterBottom>
                Shipping Information
              </Typography>
              <TextField
                fullWidth
                label="Address"
                variant="outlined"
                margin="normal"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
              />
              <TextField
                fullWidth
                label="City"
                variant="outlined"
                margin="normal"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
              />
              <TextField
                fullWidth
                label="Postal Code"
                variant="outlined"
                margin="normal"
                value={shippingInfo.postalCode}
                onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
              />
              <TextField
                fullWidth
                label="Country"
                variant="outlined"
                margin="normal"
                value={shippingInfo.country}
                onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
              />
            </Paper>
            <Paper style={{ padding: '20px', marginBottom: '20px' }}>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel value="creditCard" control={<Radio />} label="Credit Card" />
                  <FormControlLabel value="mpesa" control={<Radio />} label="M-Pesa" />
                  <FormControlLabel value="delivery" control={<Radio />} label="Payment on Delivery" />
                </RadioGroup>
              </FormControl>
              {paymentMethod === 'creditCard' && (
                <div>
                  <TextField
                    fullWidth
                    label="Card Number"
                    variant="outlined"
                    margin="normal"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    variant="outlined"
                    margin="normal"
                    value={paymentInfo.cardholderName}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardholderName: e.target.value })}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Expiry Date"
                        variant="outlined"
                        margin="normal"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="CVV"
                        variant="outlined"
                        margin="normal"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </div>
              )}
              {paymentMethod === 'mpesa' && (
                <Typography variant="body1" gutterBottom>
                  Please follow the M-Pesa payment instructions provided at checkout.
                </Typography>
              )}
              {paymentMethod === 'delivery' && (
                <Typography variant="body1" gutterBottom>
                  You will pay on delivery. Please make sure to have the exact amount ready.
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: '20px', marginBottom: '20px' }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              {cart.map((item, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: '100%', borderRadius: '8px' }} />
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{item.title}</Typography>
                      <Typography variant="body2" color="textSecondary">Quantity: {item.quantity}</Typography>
                      <Typography variant="body2" color="textSecondary">Price: Ksh {item.price}</Typography>
                    </Grid>
                  </Grid>
                </div>
              ))}
              <Divider style={{ margin: '20px 0' }} />
              <Typography variant="h6" gutterBottom>Total: Ksh {calculateTotalPrice()}</Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Dialog
  open={openMpesaDialog}
  onClose={handleCloseMpesaDialog}
  aria-labelledby="mpesa-dialog-title"
>
  <DialogTitle id="mpesa-dialog-title" sx={{ color: '#4CAF50' }}>M-Pesa Payment</DialogTitle>
  <DialogContent>
    <Typography variant="body1" sx={{ color: '#4CAF50' }} gutterBottom>
      Please follow the M-Pesa payment instructions provided at checkout.
    </Typography>
    <TextField
      autoFocus
      margin="dense"
      id="phone"
      label="Phone Number"
      type="text"
      fullWidth
      value={paymentInfo.phone}
      onChange={(e) => setPaymentInfo({ ...paymentInfo, phone: e.target.value })}
      sx={{ marginBottom: 2 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseMpesaDialog} sx={{ color: '#4CAF50' }}>
      Cancel
    </Button>
    <Button
      onClick={() => {
        handleCloseMpesaDialog();
        placeOrder();
      }}
      sx={{ color: '#4CAF50' }}
    >
      Pay Now
    </Button>
  </DialogActions>
</Dialog>
    </div>
  );
};

export default CheckoutPage;
