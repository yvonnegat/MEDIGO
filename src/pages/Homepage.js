// pages/HomePage.js
import React from 'react';
import Header from "../components/Header";
import HeroSection from '../components/HeroSection';
import FeaturedPainting from '../components/FeaturedPainting';
import Footer from '../components/Footer';

const HomePage = ({ isFirstVisit }) => {
  return (
    <div>
      <Header />
      {isFirstVisit && <div>Welcome to our site! Please sign up to get started.</div>}
      <HeroSection />
      <FeaturedPainting />
      
      <Footer />
    </div>
  );
};

export default HomePage;
