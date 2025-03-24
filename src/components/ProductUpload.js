import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const categories = [
  'Pain Relievers', 'Vitamins', 'Antibiotics', 'Allergy Relief', 'Cough & Cold',
  'Digestive Health', 'Heart Health', 'Skin Care', 'Diabetes Care', 'Supplements'
];

const featuredCategories = [
  { value: '', label: 'None' },
  { value: 'offers', label: 'Offers' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'top-brand', label: 'Top Brand' },
  { value: 'see-more', label: 'See More' }
];

const ProductUpload = ({ productToEdit, onProductUpdated }) => {
  const theme = useTheme();
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    manufacturerName: '',
    batchNumber: '',
    expiryDate: '',
    stockQuantity: '',
    category: '',
    size: '',
    featuredCategory: ''
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
        manufacturerName: '',
        batchNumber: '',
        expiryDate: '',
        stockQuantity: '',
        category: '',
        size: '',
        featuredCategory: ''
      });
      setImagePreview('');
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const price = parseFloat(productData.price) || 0;
      let imageUrl = productData.imageUrl;

      if (imageFile) {
        const imageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (productToEdit) {
        const productRef = doc(db, 'products', productToEdit.id);
        await updateDoc(productRef, { ...productData, price, imageUrl });
        console.log('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), { ...productData, price, imageUrl });
        console.log('Product added successfully');
      }

      onProductUpdated();
      setProductData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        manufacturerName: '',
        batchNumber: '',
        expiryDate: '',
        stockQuantity: '',
        category: '',
        size: '',
        featuredCategory: ''
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
        {productToEdit ? 'Edit Medicine' : 'Upload New Medicine'}
      </Typography>

      <TextField name="name" label="Medicine Name" fullWidth margin="normal" value={productData.name} onChange={handleChange} required variant="outlined" />
      <TextField name="description" label="Description" fullWidth margin="normal" value={productData.description} onChange={handleChange} required variant="outlined" />
      <TextField name="price" label="Price" fullWidth margin="normal" value={productData.price} onChange={handleChange} required type="number" variant="outlined" />

      <TextField
        select
        name="category"
        label="Category"
        fullWidth
        margin="normal"
        value={productData.category}
        onChange={handleChange}
        required
        variant="outlined"
      >
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        name="featuredCategory"
        label="Featured Category"
        fullWidth
        margin="normal"
        value={productData.featuredCategory}
        onChange={handleChange}
        variant="outlined"
      >
        {featuredCategories.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField name="size" label="Size" fullWidth margin="normal" value={productData.size} onChange={handleChange} required variant="outlined" />
      <TextField name="manufacturerName" label="Manufacturer" fullWidth margin="normal" value={productData.manufacturerName} onChange={handleChange} variant="outlined" />
      <TextField name="batchNumber" label="Batch Number" fullWidth margin="normal" value={productData.batchNumber} onChange={handleChange} variant="outlined" />
      <TextField name="expiryDate" label="Expiry Date" fullWidth margin="normal" value={productData.expiryDate} onChange={handleChange} type="date" variant="outlined" InputLabelProps={{ shrink: true }} />
      <TextField name="stockQuantity" label="Stock Quantity" fullWidth margin="normal" value={productData.stockQuantity} onChange={handleChange} required type="number" variant="outlined" />

      <input type="file" accept="image/*" onChange={handleFileChange} style={{ margin: '16px 0', display: 'block' }} />

      {imagePreview && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Image Preview:</Typography>
          <Box sx={{ height: 200, overflow: 'hidden', borderRadius: 4, backgroundColor: '#f0f0f0' }}>
            <img src={imagePreview} alt="Product Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
        </Box>
      )}

      <Button type="submit" variant="contained" sx={{ marginTop: 3, backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
        {productToEdit ? 'Update Medicine' : 'Add Medicine'}
      </Button>
    </Box>
  );
};

export default ProductUpload;
