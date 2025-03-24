import React, { useState } from 'react';
import { Container, CssBaseline, TextField, Button, Typography, Box, Link } from '@mui/material';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setMessage('Please verify your email before logging in.');
        
        // Immediately log out the user since they are not verified
        await signOut(auth);
        return;
      }

      // Store user session token
      localStorage.setItem('token', await user.getIdToken());
      console.log('Login successful'); // Replace this with navigation logic

    } catch (error) {
      console.error('Login error:', error.message);
      setMessage(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" color="primary">
          Login
        </Typography>
        {message && <Typography color="error">{message}</Typography>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField onChange={handleChange} value={formData.email} margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus />
          <TextField onChange={handleChange} value={formData.password} margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'secondary.main' } }}>
            Login
          </Button>
          <Link href="/signup" variant="body2" sx={{ color: 'primary.main' }}>
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
