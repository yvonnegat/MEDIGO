import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Pagination, TextField } from '@mui/material';
import ProductItem from '../components/ProductItem'; // Adjust path if necessary
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '@mui/material/styles';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const theme = useTheme();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, name: data.name || 'No Name', description: data.description || 'No Description', price: data.price || '0.00', imageUrl: data.imageUrl };
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset current page when search query changes
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: theme.palette.background.default 
    }}>
      <Header onSearch={handleSearch} />
      <Container component="main" sx={{ flex: 1, padding: theme.spacing(4) }}>
        <Typography 
          variant="h2" 
          align="center" 
          gutterBottom 
          sx={{ 
            color: theme.palette.primary.main, 
            fontFamily: theme.typography.fontFamily,
            marginBottom: theme.spacing(4),
            fontWeight: 'bold'
          }}
        >
          Shop
        </Typography>
        <Box 
          sx={{ 
            marginBottom: theme.spacing(3), 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <TextField 
            label="Search Products" 
            variant="outlined" 
            value={searchQuery} 
            onChange={handleSearch} 
            fullWidth 
            sx={{ maxWidth: 400, backgroundColor: theme.palette.background.paper }}
          />
        </Box>
        <Grid container spacing={4}>
          {currentProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <ProductItem product={product} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ marginTop: theme.spacing(4), display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={Math.ceil(filteredProducts.length / productsPerPage)} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary" 
            size="large" 
            sx={{ marginBottom: theme.spacing(4) }}
          />
        </Box>
      </Container>
      <Footer />
    </div>
  );
};

export default ShopPage;
