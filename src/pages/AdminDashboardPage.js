import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Divider, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ProductUpload from '../components/ProductUpload';
import ProductList from '../components/ProductList';
import AdminOrders from '../components/AdminOrders';

const AdminDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [pharmacyId, setPharmacyId] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login'); // Redirect if not logged in
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
        setAdminName(userDoc.data().name || 'Admin');
        const adminPharmacyId = userDoc.data().pharmacyId || null;
        setPharmacyId(adminPharmacyId);

        if (adminPharmacyId) {
          fetchProducts(adminPharmacyId); // Fetch products for this pharmacy
        }
      } else {
        navigate('/');
      }
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  // Function to fetch products for a specific pharmacy
  const fetchProducts = async (adminPharmacyId) => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productList = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => product.pharmacyId === adminPharmacyId); // Filter by pharmacyId

    setProducts(productList);
  };

  // Function to update product list when a new product is uploaded
  const handleProductUpdated = async () => {
    if (pharmacyId) {
      fetchProducts(pharmacyId);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return isAdmin ? (
    <Container component="main" maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
        Welcome, {adminName}!
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={3}>
        {/* Upload Product Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Upload New Product</Typography>
            {pharmacyId ? (
              <ProductUpload pharmacyId={pharmacyId} onProductUpdated={handleProductUpdated} />
            ) : (
              <Typography color="error">Pharmacy ID not found</Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Orders Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Recent Orders</Typography>
            {pharmacyId ? (
              <AdminOrders pharmacyId={pharmacyId} />
            ) : (
              <Typography color="error">Pharmacy ID not found</Typography>
            )}
          </Paper>
        </Grid>

        {/* Product List Section */}
        <Grid item xs={12}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Product List</Typography>
            {pharmacyId ? (
              <ProductList pharmacyId={pharmacyId} products={products} />
            ) : (
              <Typography color="error">Pharmacy ID not found</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  ) : null;
};

export default AdminDashboardPage;
