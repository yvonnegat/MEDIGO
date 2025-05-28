import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  CircularProgress, 
  Alert, 
  Snackbar, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { auth, storage, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const SubmitPrescription = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    deliveryAddress: '',
    notes: '',
    urgency: 'normal',
    pharmacyId: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login');
      } else {
        // Fetch available pharmacies
        fetchPharmacies();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchPharmacies = async () => {
    try {
      setLoadingPharmacies(true);
      const usersRef = collection(db, 'users');
      const pharmacyQuery = query(usersRef, where('role', '==', 'admin'));
      const querySnapshot = await getDocs(pharmacyQuery);
      
      const pharmacyList = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().pharmacyId && doc.data().name) {
          pharmacyList.push({
            id: doc.data().pharmacyId,
            name: doc.data().name,
            pharmacyLocation: doc.data().pharmacyLocation || 'Address not available'
          });
        }
      });
      
      setPharmacies(pharmacyList);
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
      setError('Failed to load available pharmacies. Please try again.');
    } finally {
      setLoadingPharmacies(false);
    }
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null); // No preview for non-image files
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prescriptionFile) {
      setError('Please upload your prescription');
      return;
    }

    if (!formData.pharmacyId) {
      setError('Please select a pharmacy');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to submit a prescription');
      }
      
      // Find the selected pharmacy name
      const selectedPharmacy = pharmacies.find(pharmacy => pharmacy.id === formData.pharmacyId);
      if (!selectedPharmacy) {
        throw new Error('Selected pharmacy not found');
      }
      
      // Upload file to Firebase Storage
      const fileRef = ref(storage, `prescriptions/${formData.pharmacyId}/${user.uid}/${Date.now()}-${prescriptionFile.name}`);
      await uploadBytes(fileRef, prescriptionFile);
      const fileUrl = await getDownloadURL(fileRef);
      
      // Save prescription data to Firestore
      await addDoc(collection(db, 'prescriptions'), {
        userId: user.uid,
        userEmail: user.email,
        patientName: formData.patientName,
        phoneNumber: formData.phoneNumber,
        deliveryAddress: formData.deliveryAddress,
        notes: formData.notes,
        urgency: formData.urgency,
        prescriptionUrl: fileUrl,
        fileName: prescriptionFile.name,
        status: 'pending',
        pharmacyId: formData.pharmacyId,
        pharmacyName: selectedPharmacy.name,
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
      setPrescriptionFile(null);
      setFilePreview(null);
      setFormData({
        patientName: '',
        phoneNumber: '',
        deliveryAddress: '',
        notes: '',
        urgency: 'normal',
        pharmacyId: ''
      });
      
      // Redirect to prescription history after 2 seconds
      setTimeout(() => {
        navigate('/prescriptions');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting prescription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div><Header/>
    <Box sx={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: 3,
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4, 
          color: theme.palette.primary.main,
          fontWeight: 'bold'
        }}
      >
        Submit Prescription
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 3, 
          borderRadius: 2,
          flex: 1
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Name"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
                variant="outlined"
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                variant="outlined"
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Address"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                required
                variant="outlined"
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Urgency</InputLabel>
                <Select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  label="Urgency"
                >
                  <MenuItem value="urgent">Urgent (24 hours)</MenuItem>
                  <MenuItem value="normal">Normal (2-3 days)</MenuItem>
                  <MenuItem value="regular">Regular (3-5 days)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Select Pharmacy</InputLabel>
                <Select
                  name="pharmacyId"
                  value={formData.pharmacyId}
                  onChange={handleInputChange}
                  label="Select Pharmacy"
                  disabled={loadingPharmacies}
                >
                  {loadingPharmacies ? (
                    <MenuItem value="">Loading pharmacies...</MenuItem>
                  ) : (
                    pharmacies.map((pharmacy) => (
                      <MenuItem key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name} - {pharmacy.pharmacyLocation}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ 
                  height: '56px', 
                  marginTop: '16px',
                  borderStyle: 'dashed',
                  display: 'flex',
                  gap: 1
                }}
              >
                <CloudUploadIcon />
                Upload Prescription
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                multiline
                rows={3}
                placeholder="Any specific medications or instructions for the pharmacist..."
              />
            </Grid>
            
            {filePreview && (
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  border: '1px solid #ddd', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Prescription Preview:
                  </Typography>
                  <img 
                    src={filePreview} 
                    alt="Prescription preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px',
                      borderRadius: '4px'
                    }} 
                  />
                </Box>
              </Grid>
            )}
            
            {!filePreview && prescriptionFile && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  File selected: {prescriptionFile.name}
                </Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || loadingPharmacies}
                  sx={{ 
                    minWidth: '200px',
                    py: 1.5
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Prescription'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Prescription submitted successfully! Our pharmacist will review it shortly.
        </Alert>
      </Snackbar>
    </Box>
    </div>
  );
};

export default SubmitPrescription;