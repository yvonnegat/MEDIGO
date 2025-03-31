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

const ProductUpload = ({ productToEdit, onProductUpdated, pharmacyId }) => {
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
        name: '', description: '', price: '', imageUrl: '', manufacturerName: '',
        batchNumber: '', expiryDate: '', stockQuantity: '', category: '', size: '', featuredCategory: ''
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
    if (!pharmacyId) {
      console.error('Pharmacy ID is missing. Aborting submission.');
      return;
    }
    try {
      const price = parseFloat(productData.price) || 0;
      let imageUrl = productData.imageUrl;

      if (imageFile) {
        const imageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const productPayload = {
        ...productData,
        price,
        imageUrl,
        pharmacyId
      };

      if (productToEdit) {
        const productRef = doc(db, 'products', productToEdit.id);
        await updateDoc(productRef, productPayload);
        console.log('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), productPayload);
        console.log('Product added successfully');
      }

      if (onProductUpdated) {
        onProductUpdated();
      }

      setProductData({
        name: '', description: '', price: '', imageUrl: '', manufacturerName: '',
        batchNumber: '', expiryDate: '', stockQuantity: '', category: '', size: '', featuredCategory: ''
      });
      setImagePreview('');
      setImageFile(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField name="name" label="Product Name" value={productData.name} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
      <TextField name="description" label="Description" value={productData.description} onChange={handleChange} fullWidth required multiline rows={3} sx={{ mb: 2 }} />
      <TextField name="price" label="Price" type="number" value={productData.price} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
      <TextField name="manufacturerName" label="Manufacturer Name" value={productData.manufacturerName} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
      <TextField name="batchNumber" label="Batch Number" value={productData.batchNumber} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
      <TextField name="expiryDate" label="Expiry Date" type="date" value={productData.expiryDate} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
      <TextField name="stockQuantity" label="Stock Quantity" type="number" value={productData.stockQuantity} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
      <TextField select name="category" label="Category" value={productData.category} onChange={handleChange} fullWidth required sx={{ mb: 2 }}>
        {categories.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </TextField>
      <TextField select name="featuredCategory" label="Featured Category" value={productData.featuredCategory} onChange={handleChange} fullWidth sx={{ mb: 2 }}>
        {featuredCategories.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
      </TextField>
      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', marginBottom: '16px' }} />
      {imagePreview && <img src={imagePreview} alt="Product Preview" style={{ maxWidth: '100%', maxHeight: '150px', marginBottom: '16px' }} />}
      <Button type="submit" variant="contained" color="primary" fullWidth>
        {productToEdit ? 'Update Product' : 'Upload Product'}
      </Button>
    </Box>
  );
};

export default ProductUpload;