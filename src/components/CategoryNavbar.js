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

    if (categoryRefs?.current?.[category]) {
      categoryRefs.current[category].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box
      sx={{
        width: '95%',
        margin: '20px auto',
        backgroundColor: '#E6F5EA', // Light mint background matching the theme
        borderRadius: '20px',
        padding: '15px 10px',
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          padding: '10px',
        }}
      >
        {['All', ...categories].map((category) => (
          <Button
            key={category}
            onClick={() => handleCategorySelect(category)}
            sx={{
              backgroundColor: selectedCategory === category ? '#2FB8A0' : '#FFFFFF', // Primary color for selected
              color: selectedCategory === category ? '#fff' : '#333333', // Text color based on selection
              borderRadius: '12px', // Follow theme's rounded style
              padding: '8px 20px',
              fontWeight: '600',
              fontSize: '14px',
              textTransform: 'none',
              boxShadow: selectedCategory === category
                ? '0 0 10px rgba(47, 184, 160, 0.4)' // Teal glow on selection
                : '0 0 5px rgba(0, 0, 0, 0.1)', // Light shadow for non-selected buttons
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#5C9EFF', // Secondary color for hover
                color: '#fff',
                boxShadow: '0 0 8px rgba(92, 158, 255, 0.4)', // Soft blue glow on hover
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
