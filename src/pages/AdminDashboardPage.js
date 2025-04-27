import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  useMediaQuery,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Divider,
  InputBase,
  IconButton,
  Badge,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Add as AddIcon,
  Star as StarIcon,
  Search as SearchIcon,
  MedicalServices as PrescriptionIcon,
} from '@mui/icons-material';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ProductUpload from '../components/ProductUpload';
import ProductList from '../components/ProductList';
import AdminOrders from '../components/AdminOrders';
import AdminPrescriptions from '../components/AdminPrescription';

const AdminDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [pharmacyId, setPharmacyId] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
        setAdminName(userDoc.data().name || 'Admin');
        const adminPharmacyId = userDoc.data().pharmacyId || null;
        setPharmacyId(adminPharmacyId);

        if (adminPharmacyId) {
          fetchProducts(adminPharmacyId);
          fetchOrders(adminPharmacyId);
          fetchPrescriptions(adminPharmacyId);
        }
      } else {
        navigate('/');
      }
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const fetchProducts = (adminPharmacyId) => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const productList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((product) => product.pharmacyId === adminPharmacyId);
      setProducts(productList);
    });
    return unsubscribe;
  };

  const fetchOrders = (adminPharmacyId) => {
    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const orderList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => order.pharmacyId === adminPharmacyId);
      setOrders(orderList);
    });
    return unsubscribe;
  };

  const fetchPrescriptions = (adminPharmacyId) => {
    const prescriptionsRef = collection(db, 'prescriptions');
    const prescriptionsQuery = query(prescriptionsRef, where('pharmacyId', '==', adminPharmacyId));
    
    const unsubscribe = onSnapshot(prescriptionsQuery, (snapshot) => {
      const prescriptionList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(prescriptionList);
      
      // Count pending prescriptions
      const pending = prescriptionList.filter(
        (prescription) => prescription.status === 'pending'
      ).length;
      setPendingPrescriptions(pending);
    });
    
    return unsubscribe;
  };

  const handleProductUpdated = () => {
    if (pharmacyId) {
      fetchProducts(pharmacyId);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: theme.palette.text.secondary }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  const outOfStockCount = products.filter((product) => product.stock === 0).length;
  const featuredProduct = products.length > 0 ? products.reduce((prev, curr) => (prev.stock > curr.stock ? prev : curr)) : null;

  return isAdmin ? (
    <Box sx={{ backgroundColor: theme.palette.mode === 'light' ? '#f5f7fa' : theme.palette.background.default, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" mb={4} flexDirection={isMobile ? 'column' : 'row'} textAlign={isMobile ? 'center' : 'left'}>
          <Box display="flex" alignItems="center" mb={isMobile ? 2 : 0}>
            <DashboardIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>Welcome back, {adminName}!</Typography>
            </Box>
          </Box>
          <Box ml={isMobile ? 0 : 'auto'} display="flex" alignItems="center">
            <Chip label={`Pharmacy ID: ${pharmacyId || 'N/A'}`} color="primary" variant="outlined" sx={{ fontWeight: 'medium' }} />
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons 
          allowScrollButtonsMobile
        >
          <Tab label="Overview" />
          <Tab label="Add Product" />
          <Tab label="Inventory" />
          <Tab label="Orders" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Prescriptions
                {pendingPrescriptions > 0 && (
                  <Badge 
                    badgeContent={pendingPrescriptions} 
                    color="error" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            } 
          />
        </Tabs>
        <Divider sx={{ mb: 3 }} />

        {tabValue === 0 && (
          <Box>
            <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`, color: 'white', p: 3, borderRadius: 2, mb: 4 }}>
              <Typography variant="h5" fontWeight="bold">📊 Quick Overview</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <InventoryIcon color="primary" sx={{ fontSize: 30 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Total Products</Typography>
                  <Typography variant="h5" fontWeight="bold">{products.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <OrdersIcon color="success" sx={{ fontSize: 30 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Total Orders</Typography>
                  <Typography variant="h5" fontWeight="bold">{orders.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <PrescriptionIcon color="secondary" sx={{ fontSize: 30 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Prescriptions</Typography>
                  <Typography variant="h5" fontWeight="bold">{prescriptions.length}</Typography>
                  {pendingPrescriptions > 0 && (
                    <Chip 
                      label={`${pendingPrescriptions} pending`} 
                      size="small" 
                      color="error" 
                      sx={{ mt: 1 }} 
                    />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <AddIcon color="warning" sx={{ fontSize: 30 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Out of Stock</Typography>
                  <Typography variant="h5" fontWeight="bold">{outOfStockCount}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {featuredProduct && (
              <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <StarIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Featured Product</Typography>
                </Box>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Typography variant="h5">{featuredProduct.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{featuredProduct.category}</Typography>
                    <Chip 
                      label={`In Stock: ${featuredProduct.stock}`} 
                      color={featuredProduct.stock > 10 ? 'success' : 'warning'} 
                      variant="outlined" 
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Stock Level</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((featuredProduct.stock / 100) * 100, 100)} 
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="h6">{featuredProduct.price} USD</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Add New Product</Typography>
            <ProductUpload onProductUploaded={handleProductUpdated} />
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Product Inventory</Typography>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <InputBase 
                placeholder="Search products..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                sx={{ ml: 1, flex: 1, border: '1px solid #ccc', px: 2, py: 1, borderRadius: 2 }} 
              />
              <IconButton type="button"><SearchIcon /></IconButton>
            </Box>
            <ProductList pharmacyId={pharmacyId} filteredProducts={filteredProducts} />
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Recent Orders</Typography>
            <AdminOrders pharmacyId={pharmacyId} />
          </Box>
        )}

        {tabValue === 4 && (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Prescription Management</Typography>
            <AdminPrescriptions pharmacyId={pharmacyId} />
          </Box>
        )}
      </Container>
    </Box>
  ) : null;
};

export default AdminDashboardPage;