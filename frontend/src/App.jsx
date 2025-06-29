// frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Import Layouts and Pages
import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import RegisterProducerPage from './pages/RegisterProducerPage';
import RegisterConsumerPage from './pages/RegisterConsumerPage';
import ComparisonPage from './pages/ComparisonPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <Routes>
      {/* Route 1: The Landing Page at the root URL "/" */}
      <Route path="/" element={<LandingPage />} />

      {/* Route 2: The registration pages, which are standalone */}
      <Route path="/register-producer" element={<RegisterProducerPage />} />
      <Route path="/register-consumer" element={<RegisterConsumerPage />} />
      
      {/* Route 3: All other pages will share the MainLayout (which has the header) */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  );
}

export default App;