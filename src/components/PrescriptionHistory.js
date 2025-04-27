import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Header from './Header';

const PrescriptionHistory = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login');
      } else {
        fetchPrescriptions(user.uid);
      }
    });
    
    return () => checkAuth();
  }, [navigate]);

  const fetchPrescriptions = async (userId) => {
    try {
      const prescriptionsRef = collection(db, 'prescriptions');
      const q = query(
        prescriptionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const prescriptionList = [];
      
      querySnapshot.forEach((doc) => {
        prescriptionList.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });
      
      setPrescriptions(prescriptionList);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to load prescription history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'processing':
        return theme.palette.info.main;
      case 'ready':
        return theme.palette.success.main;
      case 'delivered':
        return theme.palette.success.dark;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending':
        return 'Pending Review';
      case 'processing':
        return 'Processing';
      case 'ready':
        return 'Ready for Pickup/Delivery';
      case 'delivered':
        return 'Delivered';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown Status';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
        <Header/>
    <Box sx={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: 3,
      minHeight: '80vh'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}
        >
          Prescription History
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={() => navigate('/submit-prescription')}
          startIcon={<LocalPharmacyIcon />}
        >
          New Prescription
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {prescriptions.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <DescriptionIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Prescriptions Found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            You haven't submitted any prescriptions yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/submit-prescription')}
            sx={{ mt: 2 }}
          >
            Submit Your First Prescription
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {prescriptions.map((prescription) => (
            <Grid item xs={12} key={prescription.id}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {prescription.patientName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" />
                        Submitted: {formatDate(prescription.createdAt)}
                      </Typography>
                    </Box>
                    <Chip 
                      label={getStatusLabel(prescription.status)} 
                      sx={{ 
                        bgcolor: getStatusColor(prescription.status),
                        color: '#fff',
                        fontWeight: 'medium'
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Delivery Address:</strong> {prescription.deliveryAddress}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Phone Number:</strong> {prescription.phoneNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Urgency:</strong> {prescription.urgency.charAt(0).toUpperCase() + prescription.urgency.slice(1)}
                    </Typography>
                    {prescription.notes && (
                      <Typography variant="body2" color="textSecondary">
                        <strong>Notes:</strong> {prescription.notes}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    href={prescription.prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Prescription
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
</div>
  );
};

export default PrescriptionHistory;