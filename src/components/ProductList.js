import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import ProductUpload from './ProductUpload';

const ProductList = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [productToEdit, setProductToEdit] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setProductToEdit(product);
  };

  const handleProductUpdated = () => {
    setProductToEdit(null);
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    };

    fetchProducts();
  };

  return (
    <Box>
      {productToEdit && (
        <ProductUpload productToEdit={productToEdit} onProductUpdated={handleProductUpdated} />
      )}
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ marginBottom: 3, fontWeight: 'bold', color: theme.palette.primary.main }}
      >
        Product List
      </Typography>
      <Grid container spacing={3}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 4 }}>
              {product.imageUrl ? (
                <CardMedia
                  component="img"
                  image={product.imageUrl}
                  alt={product.name}
                  sx={{ height: 160, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                />
              ) : (
                <CardContent sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.grey[300] }}>
                  <Typography>No Image Available</Typography>
                </CardContent>
              )}
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">{product.description}</Typography>
                <Typography variant="h6" sx={{ marginTop: 1, color: theme.palette.primary.main }}>
                  KSh {product.price}
                </Typography>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                <Button variant="contained" onClick={() => handleEdit(product)}>
                  Edit
                </Button>
                <Button variant="contained" color="error" onClick={() => handleDelete(product.id)}>
                  Delete
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductList;
