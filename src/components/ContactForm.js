// src/components/ContactInfo.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ContactInfo = () => {
  return (
    <Box py={5} bgcolor="background.paper">
      <Container>
        <Typography variant="h2" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1">
          If you have any questions or need assistance, feel free to reach out to us. We're here to help!
        </Typography>
        <Typography variant="h6" mt={3}>
          Email: info@mypaintingshop.com
        </Typography>
        <Typography variant="h6">
          Phone: (123) 456-7890
        </Typography>
        <Typography variant="h6">
          Address: 123 Art Street, Paintsville, PA 12345
        </Typography>
      </Container>
    </Box>
  );
};

export default ContactInfo;
