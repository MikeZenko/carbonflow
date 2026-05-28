import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import RegisterProducerPage from './pages/RegisterProducerPage';
import RegisterConsumerPage from './pages/RegisterConsumerPage';
import AnalyticsPage from './pages/AnalyticsPage';

function NotFound() {
  return (
    <div className="form-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you were looking for doesn't exist or has moved.</p>
      <a href="/" className="btn btn-ghost mt-6">Back to home</a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/register-producer" element={<RegisterProducerPage />} />
        <Route path="/register-consumer" element={<RegisterConsumerPage />} />
      </Route>

      <Route path="/compare" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
