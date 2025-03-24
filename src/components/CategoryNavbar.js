import React, { useState } from 'react';
import { Box, Button } from '@mui/material';

const categories = [
  'Pain Relievers', 'Vitamins', 'Antibiotics', 'Allergy Relief', 'Cough & Cold',
  'Digestive Health', 'Heart Health', 'Skin Care', 'Diabetes Care', 'Supplements'
];

const CategoryNavbar = ({ onSelectCategory, categoryRefs }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);

    // 🔹 Safely check categoryRefs before using scrollIntoView
    if (categoryRefs?.current?.[category]) {
      categoryRefs.current[category].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#EDE8DC',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        padding: '15px 0',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
          maxWidth: '1200px',
          width: '100%',
          padding: '0 20px',
        }}
      >
        {['All', ...categories].map((category) => (
          <Button
            key={category}
            onClick={() => handleCategorySelect(category)}
            sx={{
              backgroundColor: selectedCategory === category ? '#B17F59' : 'transparent',
              color: selectedCategory === category ? '#fff' : '#A5B68D',
              borderRadius: '25px',
              padding: '10px 20px',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'none',
              boxShadow: selectedCategory === category ? '3px 3px 6px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#C1CFA1',
                color: '#fff',
                transform: 'scale(1.05)',
              },
            }}
          >
            {category}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default CategoryNavbar;
