import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ProductItem from './ProductItem';
import { Box, Typography, IconButton, useMediaQuery } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const categories = [
  { key: 'offers', title: 'Featured Offers' },
  { key: 'newest', title: 'Newest' },
  { key: 'popular', title: 'Most Popular' },
  { key: 'top-brand', title: 'Top Brand' },
  { key: 'see-more', title: 'See More' }
];

const FeaturedMedicine = ({ categoryRefs }) => {
  const [featuredData, setFeaturedData] = useState({});
  const scrollRefs = useRef({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      const newFeaturedData = {};
      for (let category of categories) {
        const q = query(collection(db, 'products'), where('featuredCategory', '==', category.key));
        const querySnapshot = await getDocs(q);
        newFeaturedData[category.key] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      setFeaturedData(newFeaturedData);
    };
    fetchData();
  }, []);

  const scroll = (category, direction) => {
    const scrollContainer = scrollRefs.current[category];
    if (scrollContainer) {
      const scrollAmount = isMobile ? 200 : 300;
      scrollContainer.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <Box sx={{ padding: '10px', maxWidth: '95%', margin: 'auto', background: '#EDE8DC', borderRadius: '20px', boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)' }}>
      {categories.map(({ key, title }) => (
        <Box key={key} ref={(el) => { if (el) categoryRefs.current[key] = el; }} sx={{
          position: 'relative',
          marginBottom: '30px',
          padding: '15px',
          background: '#C1CFA1',
          borderRadius: '15px',
          boxShadow: 'inset 0px 4px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': { boxShadow: 'inset 0px 6px 12px rgba(0, 0, 0, 0.2)' }
        }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#B17F59',
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>{title}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {!isMobile && (
              <IconButton 
                onClick={() => scroll(key, 'left')} 
                sx={{
                  position: 'absolute',
                  left: 0,
                  zIndex: 2,
                  background: '#A5B68D',
                  color: 'white',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': { background: '#B17F59' }
                }}
              >
                <ArrowBackIos />
              </IconButton>
            )}

            <Box
              ref={(el) => { if (el) scrollRefs.current[key] = el; }}
              sx={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                padding: '10px',
                width: '100%',
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              {featuredData[key]?.length > 0 ? (
                featuredData[key].map(product => (
                  <Box key={product.id} sx={{
                    flex: '0 0 auto',
                    minWidth: isMobile ? '80%' : '250px',
                    scrollSnapAlign: 'start'
                  }}>
                    <ProductItem product={product} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No products available</Typography>
              )}
            </Box>

            {!isMobile && (
              <IconButton 
                onClick={() => scroll(key, 'right')} 
                sx={{
                  position: 'absolute',
                  right: 0,
                  zIndex: 2,
                  background: '#A5B68D',
                  color: 'white',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': { background: '#B17F59' }
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default FeaturedMedicine;
