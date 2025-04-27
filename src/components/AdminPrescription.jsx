import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  VisibilityOutlined,
  CheckCircleOutline,
  HighlightOff,
  MessageOutlined,
  LocalShippingOutlined
} from '@mui/icons-material';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AdminPrescriptions = ({ pharmacyId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!pharmacyId) return;

    const fetchPrescriptions = () => {
      setLoading(true);
      const prescriptionsRef = collection(db, 'prescriptions');
      const q = query(
        prescriptionsRef, 
        where('pharmacyId', '==', pharmacyId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const prescriptionList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setPrescriptions(prescriptionList);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchPrescriptions();
    return () => unsubscribe && unsubscribe();
  }, [pharmacyId]);

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setStatusUpdate(prescription.status);
    setFeedback(prescription.feedback || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPrescription(null);
  };

  const handleStatusChange = async () => {
    if (!selectedPrescription) return;

    try {
      const prescriptionRef = doc(db, 'prescriptions', selectedPrescription.id);
      await updateDoc(prescriptionRef, {
        status: statusUpdate,
        feedback,
        updatedAt: new Date()
      });

      setSnackbar({
        open: true,
        message: 'Prescription status updated successfully',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating prescription:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update prescription status',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  const filteredPrescriptions = statusFilter === 'all' 
    ? prescriptions 
    : prescriptions.filter(prescription => prescription.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'processing': return 'info';
      case 'ready': return 'secondary';
      case 'delivered': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'processing': return 'Processing';
      case 'ready': return 'Ready for Pickup/Delivery';
      case 'delivered': return 'Delivered';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <Box>
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Tabs 
          value={statusFilter} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab label="All Prescriptions" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Approved" value="approved" />
          <Tab label="Processing" value="processing" />
          <Tab label="Ready" value="ready" />
          <Tab label="Delivered" value="delivered" />
          <Tab label="Rejected" value="rejected" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredPrescriptions.length === 0 ? (
          <Alert severity="info">No prescriptions found with the selected status</Alert>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell><Typography fontWeight="bold">Patient Name</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Date Submitted</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Urgency</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id} hover>
                    <TableCell>{prescription.patientName}</TableCell>
                    <TableCell>
                      {prescription.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={prescription.urgency === 'urgent' ? 'Urgent' : 
                               prescription.urgency === 'normal' ? 'Normal' : 'Regular'} 
                        color={prescription.urgency === 'urgent' ? 'error' : 
                               prescription.urgency === 'normal' ? 'primary' : 'default'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(prescription.status)} 
                        color={getStatusColor(prescription.status)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewPrescription(prescription)}
                          color="primary"
                        >
                          <VisibilityOutlined />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Prescription Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedPrescription && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight="bold">
                Prescription Details
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 2 }}>
                <Box sx={{ flex: 1, mr: { md: 2 } }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Patient Information
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
                    <Typography variant="body1">
                      <strong>Name:</strong> {selectedPrescription.patientName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Phone:</strong> {selectedPrescription.phoneNumber}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Delivery Address:</strong> {selectedPrescription.deliveryAddress}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Submitted By:</strong> {selectedPrescription.userEmail}
                    </Typography>
                  </Paper>
                </Box>
                <Box sx={{ flex: 1, ml: { md: 2 } }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Prescription Information
                  </Typography>
                  <Paper sx={{ p: 2 }} variant="outlined">
                    <Typography variant="body1">
                      <strong>Urgency:</strong> {selectedPrescription.urgency === 'urgent' ? 'Urgent (24 hours)' : 
                                                selectedPrescription.urgency === 'normal' ? 'Normal (2-3 days)' : 
                                                'Regular (3-5 days)'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Date Submitted:</strong> {selectedPrescription.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Current Status:</strong> {getStatusLabel(selectedPrescription.status)}
                    </Typography>
                    {selectedPrescription.notes && (
                      <Typography variant="body1">
                        <strong>Notes:</strong> {selectedPrescription.notes}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Prescription Image
              </Typography>
              <Paper sx={{ p: 2, mb: 2, textAlign: 'center' }} variant="outlined">
                {selectedPrescription.prescriptionUrl ? (
                  <Box sx={{ maxWidth: '100%', overflow: 'auto' }}>
                    <a 
                      href={selectedPrescription.prescriptionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {selectedPrescription.prescriptionUrl.toLowerCase().endsWith('.pdf') ? (
                        <Button variant="outlined" color="primary" sx={{ mb: 2 }}>
                          Open PDF Document
                        </Button>
                      ) : (
                        <img 
                          src={selectedPrescription.prescriptionUrl} 
                          alt="Prescription" 
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} 
                        />
                      )}
                    </a>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No prescription image available</Typography>
                )}
              </Paper>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Update Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                <FormControl fullWidth sx={{ flex: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusUpdate}
                    label="Status"
                    onChange={(e) => setStatusUpdate(e.target.value)}
                  >
                    <MenuItem value="pending">Pending Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="ready">Ready for Pickup/Delivery</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Feedback to Customer
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Enter any notes or feedback for the customer..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button onClick={handleCloseDialog} color="inherit">
                Cancel
              </Button>
              <Button 
                onClick={handleStatusChange} 
                variant="contained" 
                color="primary"
                startIcon={<CheckCircleOutline />}
              >
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPrescriptions;