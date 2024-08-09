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
      console.log('Product deleted successfully');
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
    // Fetch products again to update the list
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
      <Typography variant="h6" gutterBottom sx={{ marginBottom: 2, color: theme.palette.primary.main }}>
        Product List
      </Typography>
      <Grid container spacing={2}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column' }}>
              {product.imageUrl && (
                <CardMedia
                  component="img"
                  image={product.imageUrl}
                  alt={product.name}
                  sx={{ height: 140 }}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="h6" sx={{ marginTop: 1 }}>
                  ${product.price}
                </Typography>
              </CardContent>
              <Button variant="contained" sx={{ margin: 1, backgroundColor: theme.palette.primary.main }} onClick={() => handleEdit(product)}>
                Edit
              </Button>
              <Button variant="contained" sx={{ margin: 1, backgroundColor: theme.palette.error.main }} onClick={() => handleDelete(product.id)}>
                Delete
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductList;
