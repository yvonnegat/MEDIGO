import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Paper } from '@mui/material';
import capsuleImg from '../assets/3d-capsule (2).png'; // Ensure this image follows a soft 3D claymorphic style

const HeroSection = () => {
  return (
    <section className="hero-section">
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          textAlign: 'center',
          padding: '0 20px',
          position: 'relative',
        }}
      >
        <Paper
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            maxWidth: '1200px',
            padding: '40px',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #EDE8DC, #C1CFA1)',
            boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
            overflow: 'hidden',
          }}
          elevation={0}
        >
          {/* Floating Capsules - Mirrored Effect */}
          <img 
            src={capsuleImg} 
            alt="3D Capsule Left" 
            className="floating-capsule" 
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '400px',
              height: 'auto',
              filter: 'drop-shadow(4px 4px 10px rgba(0,0,0,0.2))',
              transform: 'scaleX(-1)', // Mirroring effect
              animation: 'floatCapsule 4s infinite ease-in-out',
            }}
          />
          <img 
            src={capsuleImg} 
            alt="3D Capsule Right" 
            className="floating-capsule" 
            style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '400px',
              height: 'auto',
              filter: 'drop-shadow(4px 4px 10px rgba(0,0,0,0.2))',
              animation: 'floatCapsule 4s infinite ease-in-out',
            }}
          />

          <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h2"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                fontSize: '3rem',
                color: '#B17F59',
                mb: 2,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                '@media (max-width: 600px)': {
                  fontSize: '2rem',
                }
              }}
            >
              Your Trusted Online Pharmacy
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                fontFamily: 'Lora, serif',
                fontSize: '1.25rem',
                color: '#5C5C5C',
                mb: 4,
                '@media (max-width: 600px)': {
                  fontSize: '1rem',
                }
              }}
            >
              Quality medicines, trusted healthcare, delivered to your doorstep.
            </Typography>
            <Button 
              component={Link}
              to="/shop"
              variant="contained"
              sx={{
                background: 'linear-gradient(145deg, #A5B68D, #C1CFA1)',
                color: '#5C5C5C',
                padding: '12px 24px',
                fontSize: '1.125rem',
                borderRadius: '50px',
                boxShadow: '4px 4px 8px #a1a1a1, -4px -4px 8px #ffffff',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(145deg, #C1CFA1, #A5B68D)',
                  transform: 'scale(1.05)',
                },
                '@media (max-width: 600px)': {
                  fontSize: '1rem',
                  padding: '10px 20px',
                }
              }}
            >
              Shop Now
            </Button>
          </div>
        </Paper>
      </Container>
    </section>
  );
};

export default HeroSection;
