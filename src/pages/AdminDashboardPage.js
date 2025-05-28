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
  Chat as ChatIcon,
} from '@mui/icons-material';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
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
  const [pendingChats, setPendingChats] = useState(0);
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
          fetchPendingChats(adminPharmacyId);
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
    const ordersQuery = query(ordersRef, where('pharmacyId', '==', adminPharmacyId));
  
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const orderList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Filtered orders:", orderList);
      setOrders(orderList);
    });
  
    return unsubscribe;
  };
  
  const fetchPendingChats = (adminPharmacyId) => {
    const chatSummariesRef = collection(db, 'chatSummaries');
    const chatQuery = query(chatSummariesRef, where('pharmacyId', '==', adminPharmacyId));
    
    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const pendingCount = snapshot.docs.filter(doc => 
        doc.data().unreadByPharmacy === true
      ).length;
      
      setPendingChats(pendingCount);
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
  
  const handleNavigateToChats = () => {
    navigate('/admin/chats');
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

        {/* Customer Chat Quick Access */}
        <Box
          onClick={handleNavigateToChats}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 900,
            bgcolor: '#2FB8A0',
            color: 'white',
            borderRadius: '50%',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 3,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#5C9EFF',
            }
          }}
        >
          <Badge
            badgeContent={pendingChats}
            color="error"
            invisible={pendingChats === 0}
          >
            <ChatIcon fontSize="large" />
          </Badge>
        </Box>

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
                  <ChatIcon color="info" sx={{ fontSize: 30 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Customer Chats</Typography>
                  <Typography variant="h5" fontWeight="bold">{pendingChats}</Typography>
                  {pendingChats > 0 && (
                    <Chip 
                      label="Unread messages" 
                      size="small" 
                      color="error" 
                      sx={{ mt: 1 }} 
                    />
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="medium" mb={2}>
                    Inventory Status
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Out of Stock Items
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={products.length > 0 ? (outOfStockCount / products.length) * 100 : 0} 
                        color="error"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="h6" color="error" ml={2}>
                      {outOfStockCount}
                    </Typography>
                  </Box>
                  {featuredProduct && (
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardHeader 
                        title="Featured Product" 
                        subheader="Highest stock item"
                        avatar={<StarIcon color="warning" />}
                      />
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {featuredProduct.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Stock: {featuredProduct.stock} units
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: ${featuredProduct.price}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="medium" mb={2}>
                    Recent Orders
                  </Typography>
                  {orders.length > 0 ? (
                    orders.slice(0, 3).map((order) => (
                      <Paper key={order.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Order #{order.id.slice(0, 6)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {order.customerName || 'Customer'}
                            </Typography>
                          </Box>
                          <Chip 
                            label={order.status || 'Processing'} 
                            color={
                              order.status === 'completed' ? 'success' : 
                              order.status === 'cancelled' ? 'error' : 'warning'
                            } 
                            size="small" 
                          />
                        </Box>
                        <Typography variant="body2" mt={1}>
                          Total: ${order.totalAmount || '0.00'}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                      No orders yet
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="medium" mb={3}>
                <AddIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Add New Product
              </Typography>
              <ProductUpload pharmacyId={pharmacyId} onProductAdded={handleProductUpdated} />
            </Paper>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="medium">
                  <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Inventory Management
                </Typography>
                <Paper
                  component="form"
                  sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </Box>
              <ProductList 
                products={filteredProducts} 
                isAdmin={true} 
                onProductUpdated={handleProductUpdated}
              />
            </Paper>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="medium" mb={3}>
                <OrdersIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Orders Management
              </Typography>
              <AdminOrders orders={orders} />
            </Paper>
          </Box>
        )}

        {tabValue === 4 && (
          <Box>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="medium" mb={3}>
                <PrescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Prescription Management
              </Typography>
              <AdminPrescriptions prescriptions={prescriptions} />
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  ) : null;
};

export default AdminDashboardPage;