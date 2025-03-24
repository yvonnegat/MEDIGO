import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Snackbar, Alert } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/stores';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const ProductItem = ({ product }) => {
  const theme = useTheme();
  const [rating, setRating] = useState(product?.rating || 0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product) {
      dispatch(addToCart(product));
      setSnackbarMessage(`${product.name} added to cart!`);
      setSnackbarOpen(true);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
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
          borderRadius: 3, 
          boxShadow: 4, 
          transition: '0.3s', 
          cursor: 'pointer',
          backgroundColor: theme.palette.background.default,
          '&:hover': { 
            boxShadow: 8, 
            transform: 'scale(1.05)', 
            backgroundColor: theme.palette.action.hover 
          },
          maxWidth: 300,
          overflow: 'hidden'
        }} 
        onClick={handleCardClick}
      >
        {product.imageUrl ? (
          <CardMedia
            component="img"
            image={product.imageUrl}
            alt={product.name}
            sx={{ 
              height: 250, 
              objectFit: 'cover', 
              width: '100%', 
              borderTopLeftRadius: 12, 
              borderTopRightRadius: 12 
            }}
          />
        ) : (
          <CardMedia
            component="div"
            sx={{ 
              height: 250, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: theme.palette.grey[300],
              width: '100%'
            }}
          >
            <Typography align="center" color="text.secondary">
              No Image Available
            </Typography>
          </CardMedia>
        )}
        <CardContent sx={{ padding: 2, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <Typography 
            variant="h6" 
            sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 1 }}
          >
            {product.name || 'No Name'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
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
              sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
            >
              KSh {product.price || '0.00'}
            </Typography>
            <IconButton 
              onClick={handleAddToCart} 
              sx={{ color: theme.palette.secondary.main }}
            >
              <ShoppingCartIcon />
            </IconButton>
          </Box>
          <Rating
            name="product-rating"
            value={rating}
            onChange={handleRatingChange}
            precision={0.5}
            icon={<StarIcon fontSize="inherit" />}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
          />
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