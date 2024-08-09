import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { Box, Typography, Card, CardMedia, CardContent, Button, Container, Grid, Snackbar, Alert } from '@mui/material';
import ProductItem from '../components/ProductItem';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/stores'; // Ensure this path is correct
import Header from './Header';
import Footer from './Footer';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      setSnackbarMessage(`${product.name} added to cart!`);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProduct(docSnap.data());
        fetchAllProducts();
      } else {
        console.error('No such document!');
      }
    };

    const fetchAllProducts = async () => {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRelatedProducts(products.filter(p => p.id !== id)); // Exclude the current product
    };

    fetchProduct();
  }, [id]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (!product) {
    return (
      <Container>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ marginTop: 4 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <div>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ padding: 4 }}>
          <Card sx={{ display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 2 }}>
            {product.imageUrl ? (
              <CardMedia
                component="img"
                image={product.imageUrl}
                alt={product.name}
                sx={{ 
                  height: 400, 
                  objectFit: 'contain', // Ensure the image fits within the container
                  width: '100%', 
                  maxWidth: '100%', 
                  display: 'block' 
                }}
              />
            ) : (
              <CardMedia
                component="div"
                sx={{ 
                  height: 400, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: '#f0f0f0' 
                }}
              >
                <Typography align="center" color="text.secondary">
                  No Image Available
                </Typography>
              </CardMedia>
            )}
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {product.name || 'No Name'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {product.description || 'No Description'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Artist: {product.artistName || 'Unknown Artist'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Contact: {product.artistPhoneNumber || 'N/A'}
              </Typography>
              <Typography variant="h5" color="primary" sx={{ marginTop: 2 }}>
                KSh {product.price || '0.00'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ marginTop: 3, width: '100%', padding: 1.5 }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>

          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h5" gutterBottom>
              OTHER PRODUCTS
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((relatedProduct) => (
                <Grid item xs={12} sm={6} md={4} key={relatedProduct.id}>
                  <ProductItem product={relatedProduct} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>

      {/* Snackbar Component */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Footer/>
    </div>
  );
};

export default ProductDetails;
