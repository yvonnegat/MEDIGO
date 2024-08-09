// components/FeaturedPainting.js
import React from 'react';
import { Button, Container, Typography, Box, IconButton, useMediaQuery } from '@mui/material';
import PaintingItem from './ProductItem';
import { Link } from 'react-router-dom';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import {
  featuredPaintings,
  topPaintings,
  bestSellers,
  topPicks,
} from '../data/PaintingData';

const FeaturedPainting = () => {
  const carouselItems = [
    {
      title: 'Featured Paintings',
      paintings: featuredPaintings,
    },
    {
      title: 'Top Paintings',
      paintings: topPaintings,
    },
    {
      title: 'Best Sellers',
      paintings: bestSellers,
    },
    {
      title: 'Top Picks',
      paintings: topPicks,
    },
  ];

  const scrollRef = React.useRef(null);
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;

      if (scrollAmount < 0) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (scrollAmount > scrollWidth - clientWidth) {
        scrollRef.current.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Container>
        <Box my={4}>
          <Typography 
            variant={isSmallScreen ? 'h4' : 'h2'} 
            align="center" 
            gutterBottom 
            sx={{ fontFamily: 'serif', fontWeight: 'bolder', color: '#333' }}
          >
            EXPLORE OUR COLLECTION
          </Typography>

          {carouselItems.map((item, index) => (
            <Box key={index} my={4} sx={{ position: 'relative', backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h4" align="center" gutterBottom sx={{ padding: '10px', fontFamily: 'serif' }}>
                {item.title}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <IconButton
                  onClick={() => scroll('left')}
                  sx={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: '#fff',
                    zIndex: 1,
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                >
                  <ArrowBackIos />
                </IconButton>
                <Box
                  ref={scrollRef}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                  }}
                >
                  {item.paintings.map((painting, index) => (
                    <Box key={index} minWidth="250px" px={1}>
                      <PaintingItem painting={painting} />
                    </Box>
                  ))}
                </Box>
                <IconButton
                  onClick={() => scroll('right')}
                  sx={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: '#fff',
                    zIndex: 1,
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                >
                  <ArrowForwardIos />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <Box my={4} textAlign="center">
          <Button
            component={Link}
            to="/gallery"
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#003C71',
              padding: '10px 20px',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              borderRadius: '30px',
              '&:hover': {
                backgroundColor: '#4C1D95',
              },
            }}
          >
            Go To Shop
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedPainting;
