// src/components/Footer.js
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import theme from '../theme';
const Footer = () => {

  return (
    <Box py={3} bgcolor={theme.palette.primary.main} color={theme.palette.common.white}>
      <Container>
        <Typography variant="body2" align="center">
          &copy; {new Date().getFullYear()} Medigo. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
