import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProductUpload = ({ productToEdit, onProductUpdated }) => {
  const theme = useTheme();
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    artistName: '',
    artistPhoneNumber: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setProductData(productToEdit);
      setImagePreview(productToEdit.imageUrl);
    } else {
      setProductData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        artistName: '',
        artistPhoneNumber: ''
      });
      setImagePreview('');
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
    if (name === 'imageUrl') {
      setImagePreview(value);
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Remove `$` symbol from the price
      const price = productData.price.replace(/[^0-9.]/g, ''); 
      let imageUrl = productData.imageUrl;
      if (imageFile) {
        const imageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (productToEdit) {
        // Edit existing product
        const productRef = doc(db, 'products', productToEdit.id);
        await updateDoc(productRef, { ...productData, price, imageUrl });
        console.log('Product updated successfully');
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), { ...productData, price, imageUrl });
        console.log('Product added successfully');
      }

      // Notify parent component
      onProductUpdated();
      setProductData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        artistName: '',
        artistPhoneNumber: ''
      });
      setImagePreview('');
      setImageFile(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        padding: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 1,
        maxWidth: 600,
        margin: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: 3, fontWeight: 'bold' }}>
        {productToEdit ? 'Edit Product' : 'Upload New Product'}
      </Typography>
      <TextField
        name="name"
        label="Product Name"
        fullWidth
        margin="normal"
        value={productData.name}
        onChange={handleChange}
        required
        variant="outlined"
      />
      <TextField
        name="description"
        label="Product Description"
        fullWidth
        margin="normal"
        value={productData.description}
        onChange={handleChange}
        required
        variant="outlined"
      />
      <TextField
        name="price"
        label="Price"
        fullWidth
        margin="normal"
        value={productData.price}
        onChange={handleChange}
        required
        type="number"
        InputProps={{ startAdornment: <Typography variant="body1">KSh</Typography> }}
        variant="outlined"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ margin: '16px 0', display: 'block' }}
      />
      <TextField
        name="artistName"
        label="Artist Name"
        fullWidth
        margin="normal"
        value={productData.artistName}
        onChange={handleChange}
        variant="outlined"
      />
      <TextField
        name="artistPhoneNumber"
        label="Artist Phone Number"
        fullWidth
        margin="normal"
        value={productData.artistPhoneNumber}
        onChange={handleChange}
        type="tel"
        variant="outlined"
      />
      {imagePreview && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
            Image Preview:
          </Typography>
          <Box sx={{ 
            position: 'relative', 
            height: 0, 
            paddingBottom: '56.25%', // 16:9 aspect ratio
            overflow: 'hidden',
            borderRadius: 4,
            backgroundColor: '#f0f0f0'
          }}>
            <img
              src={imagePreview}
              alt="Product Preview"
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain'
              }}
            />
          </Box>
        </Box>
      )}
      <Button
        type="submit"
        variant="contained"
        sx={{
          marginTop: 3,
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }}
      >
        {productToEdit ? 'Update Product' : 'Add Product'}
      </Button>
    </Box>
  );
};

export default ProductUpload;
