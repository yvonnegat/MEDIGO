import React from 'react';
import { Link } from 'react-router-dom';
import "../App.css";
import { Container, Typography, Button, Box,  Paper } from '@mui/material';

const HeroSection = () => {

  return (
    <section className="hero-section">
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh', // Full viewport height
          textAlign: 'center',
          padding: '0 20px',
         
        }}
      >
        <Paper
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundImage: 'url("https://d5wt70d4gnm1t.cloudfront.net/media/a-s/artworks/annabel-andrews/72864-749520043119/annabel-andrews-2-hb-800x800.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            padding: '40px 20px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
          }}
          elevation={3}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
            }}
          />
          <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h1"
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 'bold',
                fontSize: '3.5rem',
                lineHeight: '1.2',
                color: 'white',
                mb: 2,
                '@media (max-width: 600px)': {
                  fontSize: '2.5rem',
                }
              }}
            >
              Acrylic Alchemy
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                fontFamily: 'Lora, serif',
                fontSize: '1.25rem',
                color: 'white',
                mb: 4,
                '@media (max-width: 600px)': {
                  fontSize: '1rem',
                }
              }}
            >
              Discover beautiful paintings to decorate your space.
            </Typography>
            <Button 
              className='btn'
              component={Link}
              to="/gallery"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #FF6F61, #D5AAFF)', // Gradient background
                color: 'white',
                padding: '12px 24px',
                fontSize: '1.125rem',
                borderRadius: '50px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #D5AAFF, #FF6F61)',
                  transform: 'scale(1.05)',
                },
                '@media (max-width: 600px)': {
                  fontSize: '1rem',
                  padding: '10px 20px',
                }
              }}
            >
              View Gallery
            </Button>
          </div>
        </Paper>
      </Container>
    </section>
  );
};

export default HeroSection;
