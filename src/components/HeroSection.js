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
            background: 'linear-gradient(145deg, #E6F5EA, #FFFFFF)', // Background from theme (mint to white)
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Soft card shadow from theme
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
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '3rem',
                color: '#333333', // Text color from theme
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
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.25rem',
                color: '#555555', // Secondary text color from theme
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
                background: '#2FB8A0', // Primary color from theme
                color: '#FFFFFF',
                padding: '12px 24px',
                fontSize: '1.125rem',
                borderRadius: '12px', // Soft button corner from theme
                boxShadow: '0 0 8px rgba(47, 184, 160, 0.4)', // Teal glow from theme
                textTransform: 'none',
                '&:hover': {
                  background: '#5C9EFF', // Secondary color from theme for hover
                  boxShadow: '0 0 8px rgba(92, 158, 255, 0.4)', // Blue glow on hover
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
