import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Snackbar, Alert } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/stores'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';

const ProductItem = ({ product }) => {
  const [rating, setRating] = useState(product?.rating || 0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent click event from triggering card click
    if (product) {
      dispatch(addToCart(product));
      setSnackbarMessage(`${product.name} added to cart!`);
      setSnackbarOpen(true);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`); // Navigate to product details page
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (!product) {
    return null;
  }

  return (
    <>
      <Card 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: 2, 
          boxShadow: 3, 
          transition: '0.3s', 
          '&:hover': { 
            boxShadow: 6, 
            transform: 'scale(1.02)' 
          },
          cursor: 'pointer' 
        }} 
        onClick={handleCardClick}
      >
        {product.imageUrl ? (
          <CardMedia
            component="img"
            image={product.imageUrl}
            alt={product.name}
            sx={{ 
              height: 200, 
              objectFit: 'cover', 
              width: '100%' 
            }}
          />
        ) : (
          <CardMedia
            component="div"
            sx={{ 
              height: 200, 
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
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ mb: 1, fontWeight: 'bold' }}
          >
            {product.name || 'No Name'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {product.description || 'No Description'}
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 1 
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ fontWeight: 'bold' }}
            >
              KSh {product.price || '0.00'}
            </Typography>
            <IconButton 
              onClick={handleAddToCart} 
              sx={{ color: 'primary.main' }}
            >
              <ShoppingCartIcon />
            </IconButton>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Rating
              name="product-rating"
              value={rating}
              onChange={handleRatingChange}
              precision={0.5}
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
            />
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductItem;
