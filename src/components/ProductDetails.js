import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  const handleBuyNow = () => {
    if (product) {
      const serializableProduct = {
        id: product.id,
        title: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        description: product.description,
      };
  
      localStorage.setItem("temporaryCart", JSON.stringify([serializableProduct]));
      navigate("/checkout");
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
    <div style={{ backgroundColor: '#E6F5EA' }}>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ padding: 4 }}>
          <Card sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', 
            borderRadius: '15px',
            backgroundColor: '#FFFFFF',
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
                  boxShadow: 'inset 4px 4px 8px rgba(47, 184, 160, 0.4), inset -4px -4px 8px #ffffff'
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
                sx={{ fontWeight: 700, color: '#333333' }}
              >
                {product.name || 'No Name'}
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#555555' }}>
                {product.description || 'No Description'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Manufacturer: <span style={{ fontWeight: 'bold' }}>{product.manufacturerName || 'N/A'}</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Expiry Date: <span style={{ fontWeight: 'bold' }}>{product.expiryDate || 'N/A'}</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Category: <span style={{ fontWeight: 'bold' }}>{product.category || 'N/A'}</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Size: <span style={{ fontWeight: 'bold' }}>{product.size || 'N/A'}</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Stock Number: <span style={{ fontWeight: 'bold' }}>{product.stockQuantity || 'N/A'}</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#555555' }}>
                Availability: <span style={{ fontWeight: 'bold' }}>{product.availability ? 'In Stock' : 'Out of Stock'}</span>
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  marginTop: 2, 
                  color: '#2FB8A0', 
                  fontWeight: 600 
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
                  backgroundColor: '#2FB8A0',
                  boxShadow: '0 0 8px rgba(47, 184, 160, 0.4)',
                  '&:hover': {
                    backgroundColor: '#5C9EFF'
                  }
                }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                variant="contained"
                sx={{ 
                  marginTop: 2, 
                  width: '100%', 
                  padding: 1.5, 
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  backgroundColor: '#5C9EFF',
                  boxShadow: '0 0 8px rgba(92, 158, 255, 0.4)',
                  '&:hover': {
                    backgroundColor: '#2FB8A0'
                  }
                }}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </CardContent>
          </Card>

          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#2FB8A0' }}>
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
