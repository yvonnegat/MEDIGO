// MpeasaPaymentDialog.js
import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import axios from 'axios';

const MpeasaPaymentDialog = ({ open, onClose, onPaymentSuccess }) => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:3001/stk', { phone, amount });
      if (response.data) {
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Error processing M-Pesa payment:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>M-Pesa Payment</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Phone Number"
          type="tel"
          fullWidth
          variant="outlined"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Amount"
          type="number"
          fullWidth
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MpeasaPaymentDialog;
