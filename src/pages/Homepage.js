import React, { useState, useRef } from 'react';
import Header from "../components/Header";
import HeroSection from '../components/HeroSection';
import FeaturedMedicine from '../components/FeaturedMedicine';
import Footer from '../components/Footer';
import CategoryNavbar from '../components/CategoryNavbar';

const HomePage = ({ isFirstVisit }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categoryRefs = useRef({});

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);

    // Scroll to the selected category section if it exists
    if (categoryRefs.current[category]) {
      categoryRefs.current[category].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <Header />
      {isFirstVisit && <div>Welcome to our site! Please sign up to get started.</div>}
      <HeroSection />
      <CategoryNavbar onSelectCategory={handleCategorySelect} categoryRefs={categoryRefs} />
      <FeaturedMedicine selectedCategory={selectedCategory} categoryRefs={categoryRefs} />
      <Footer />
    </div>
  );
};

export default HomePage;
