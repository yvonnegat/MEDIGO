import React, { useState } from "react";
import {
  Container,
  CssBaseline,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { v4 as uuidv4 } from "uuid"; // Import UUID library

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default role
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword, role } = formData;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate a unique pharmacy ID only for admins
      const pharmacyId = role === "admin" ? uuidv4() : null;

      // Save user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        role,
        pharmacyId, // Store pharmacy ID if admin
      });

      // Send email verification
      await sendEmailVerification(user);
      setMessage("Signup successful! Please check your email for verification before logging in.");
    } catch (error) {
      console.error("Signup error:", error.message);
      setMessage(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5" color="primary">
          Sign Up
        </Typography>
        {message && <Typography color="error">{message}</Typography>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            onChange={handleChange}
            value={formData.name}
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
          />
          <TextField
            onChange={handleChange}
            value={formData.email}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
          />
          <TextField
            onChange={handleChange}
            value={formData.phone}
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
          />

          {/* Role Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Sign up as</InputLabel>
            <Select labelId="role-label" id="role" name="role" value={formData.role} onChange={handleChange}>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Pharmacy (Admin)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            onChange={handleChange}
            value={formData.password}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <TextField
            onChange={handleChange}
            value={formData.confirmPassword}
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, backgroundColor: "primary.main", "&:hover": { backgroundColor: "secondary.main" } }}
          >
            Sign Up
          </Button>
          <Link href="/login" variant="body2" sx={{ color: "primary.main" }}>
            {"Already have an account? Login"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup;
