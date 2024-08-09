// src/components/AboutSection.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AboutSection = () => {
  const theme = useTheme();

  return (
    <Box py={5} bgcolor={theme.palette.background.paper}>
      <Container>
        <Typography variant="h2" gutterBottom color={theme.palette.primary.main}>
          About Us
        </Typography>
        <Typography variant="body1" color={theme.palette.text.primary}>
          Welcome to My Painting Shop, where you can find beautiful and unique paintings to decorate your space. Our mission is to bring art into your home and make it a place of inspiration and creativity. We work with talented artists to offer a diverse collection of artworks that cater to all tastes and styles. Explore our gallery and discover the perfect piece for your home.
        </Typography>
      </Container>
    </Box>
  );
};

export default AboutSection;
