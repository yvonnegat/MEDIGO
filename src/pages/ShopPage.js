import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Grid, Box, Pagination, TextField } from '@mui/material';
import ProductItem from '../components/ProductItem';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '@mui/material/styles';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import CategoryNavbar from '../components/CategoryNavbar';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const theme = useTheme();

  // 🔹 Create a reference for category elements
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            name: data.name || 'No Name', 
            description: data.description || 'No Description', 
            price: data.price || '0.00', 
            category: data.category || 'Uncategorized',
            imageUrl: data.imageUrl 
          };
        });
        setProducts(productsData);
        setFilteredProducts(productsData); // Show all products initially
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);

    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  // Apply search filter
  const searchedProducts = filteredProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = searchedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: theme.palette.background.default 
    }}>
      
      <Header onSearch={handleSearch} />
      
      {/* 🔹 Pass categoryRefs to CategoryNavbar */}
      <CategoryNavbar onSelectCategory={handleCategorySelect} categoryRefs={categoryRefs} />
      
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

        <Box sx={{ marginBottom: theme.spacing(3), display: 'flex', justifyContent: 'center' }}>
          <TextField 
            label="Search Products" 
            variant="outlined" 
            value={searchQuery} 
            onChange={handleSearch} 
            fullWidth 
            sx={{ maxWidth: 400, backgroundColor: theme.palette.background.paper }}
          />
        </Box>

        {currentProducts.length > 0 ? (
          <Grid container spacing={4}>
            {currentProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <ProductItem product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography align="center" sx={{ marginTop: 3, color: '#777' }}>
            No products found.
          </Typography>
        )}

        {searchedProducts.length > productsPerPage && (
          <Box sx={{ marginTop: theme.spacing(4), display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={Math.ceil(searchedProducts.length / productsPerPage)} 
              page={currentPage} 
              onChange={handlePageChange} 
              color="primary" 
              size="large" 
              sx={{ marginBottom: theme.spacing(4) }}
            />
          </Box>
        )}
      </Container>

      <Footer />
    </div>
  );
};

export default ShopPage;
