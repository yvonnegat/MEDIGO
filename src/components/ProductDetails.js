import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { 
  Box, Typography, Card, CardMedia, CardContent, Button, 
  Container, Grid, Snackbar, Alert 
} from '@mui/material';
import ProductItem from '../components/ProductItem';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/stores'; 
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
      setRelatedProducts(products.filter(p => p.id !== id)); 
    };

    fetchProduct();
  }, [id]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (!product) {
    return (
      <Container>
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary" 
          sx={{ marginTop: 4, fontStyle: 'italic' }}
        >
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: '#EDE8DC' }}>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ padding: 4 }}>
          <Card sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            boxShadow: '6px 6px 12px #C1CFA1, -6px -6px 12px #ffffff', 
            borderRadius: '20px',
            backgroundColor: '#C1CFA1', 
            color: '#3A3A3A',
            overflow: 'hidden',
            padding: 3
          }}>
            {product.imageUrl ? (
              <CardMedia
                component="img"
                image={product.imageUrl}
                alt={product.name}
                sx={{ 
                  height: 350, 
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: 'inset 4px 4px 8px #A5B68D, inset -4px -4px 8px #ffffff'
                }}
              />
            ) : (
              <Box sx={{ 
                height: 350, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#A5B68D',
                borderRadius: '12px'
              }}>
                <Typography align="center" color="white">
                  No Image Available
                </Typography>
              </Box>
            )}
            <CardContent>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ fontWeight: 'bold', color: '#B17F59' }}
              >
                {product.name || 'No Name'}
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description || 'No Description'}
              </Typography>
              <Typography variant="body1">
                Manufacturer: <span style={{ fontWeight: 'bold' }}>{product.manufacturerName || 'N/A'}</span>
              </Typography>
              <Typography variant="body1">
                Expiry Date: <span style={{ fontWeight: 'bold' }}>{product.expiryDate || 'N/A'}</span>
              </Typography>
              <Typography variant="body1">
                Category: <span style={{ fontWeight: 'bold' }}>{product.category || 'N/A'}</span>
              </Typography>
              <Typography variant="body1">
                Size: <span style={{ fontWeight: 'bold' }}>{product.size || 'N/A'}</span>
              </Typography>
              <Typography variant="body1">
                Stock Number: <span style={{ fontWeight: 'bold' }}>{product.stockQuantity || 'N/A'}</span>
              </Typography>
              <Typography variant="body1">
                Availability: <span style={{ fontWeight: 'bold' }}>{product.availability ? 'In Stock' : 'Out of Stock'}</span>
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  marginTop: 2, 
                  color: '#A5B68D', 
                  fontWeight: 'bold' 
                }}
              >
                KSh {product.price || '0.00'}
              </Typography>
              <Button
                variant="contained"
                sx={{ 
                  marginTop: 3, 
                  width: '100%', 
                  padding: 1.5, 
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  backgroundColor: '#B17F59',
                  boxShadow: '4px 4px 8px #A5B68D, -4px -4px 8px #ffffff',
                  '&:hover': {
                    backgroundColor: '#A5B68D'
                  }
                }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>

          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#B17F59' }}>
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
      <Footer />
    </div>
  );
};

export default ProductDetails;
