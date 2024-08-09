import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ProductUpload from '../components/ProductUpload';
import ProductList from '../components/ProductList';

const AdminDashboardPage = () => {
  const theme = useTheme();

  return (
    <Container component="main" maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ marginTop: 4, color: theme.palette.primary.main }}>
        Admin Dashboard
      </Typography>
      <Box sx={{ marginBottom: 4 }}>
        <ProductUpload />
      </Box>
      <ProductList />
    </Container>
  );
};

export default AdminDashboardPage;
