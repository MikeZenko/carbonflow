// frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import Sidebar from '../components/Sidebar';
import ProducerList from '../components/ProducerList';
import ImpactModal from '../components/ImpactModal';
import WelcomeModal from '../components/WelcomeModal';
import { getMatches, getAnalyzedMatches, getImpactReport } from '../api';

function HomePage() {
  const [showWelcome, setShowWelcome] = useState(false); // Set to false to avoid showing it every time during dev
  const [analysisReport, setAnalysisReport] = useState(null);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapFocus, setMapFocus] = useState(null);
  const [impactReport, setImpactReport] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    console.log('🚀 HomePage useEffect running');
    const savedWatchlist = localStorage.getItem('carbonWatchlist');
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    
    const hasVisited = sessionStorage.getItem('hasVisitedCarbonMarketplace');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const handleAddToWatchlist = (matchToAdd) => {
    let updatedWatchlist = [];
    if (!watchlist.some(item => item.id === matchToAdd.id)) {
      updatedWatchlist = [...watchlist, matchToAdd];
      alert(`${matchToAdd.name} has been added to your watchlist!`);
    } else {
      alert(`${matchToAdd.name} is already in your watchlist.`);
      updatedWatchlist = watchlist;
    }
    setWatchlist(updatedWatchlist);
    localStorage.setItem('carbonWatchlist', JSON.stringify(updatedWatchlist));
    window.dispatchEvent(new Event('watchlistUpdated'));
  };
  
  // THIS IS THE BLOCK OF MISSING HANDLER FUNCTIONS THAT IS NOW RESTORED
  const handleFindMatches = async (producer) => {
    if (!producer || !producer.id) return;
    setIsLoading(true);
    setSelectedProducer(producer);
    setAnalysisReport(null);
    setMapFocus(null);
    setImpactReport(null);
    try {
      const initialMatches = await getMatches(producer.id);
      if (initialMatches.length === 0) {
        alert(`No potential matches found for ${producer.name}.`);
        setIsLoading(false);
        return;
      }
      const report = await getAnalyzedMatches(producer, initialMatches);
      setAnalysisReport(report);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMatch = (match) => {
    setMapFocus({ center: [match.location.lat, match.location.lon], zoom: 12 });
  };

  const handleGenerateReport = async (match) => {
    if (!selectedProducer || !match) return;
    setIsLoading(true);
    try {
      const reportData = await getImpactReport(selectedProducer, match);
      setImpactReport(reportData);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    sessionStorage.setItem('hasVisitedCarbonMarketplace', 'true');
    setShowWelcome(false);
  };

  console.log('🔥 HomePage rendering - component should appear');

  return (
    <>
      {showWelcome && <WelcomeModal onGuestContinue={handleGuestContinue} />}
      {isLoading && <div className="loading-overlay">Analyzing...</div>}
      <ImpactModal report={impactReport} onClose={() => setImpactReport(null)} />
      
      <main className="dashboard-layout-3-col">
        <div className="dashboard-forms">
          <ProducerList onFindMatches={handleFindMatches} />
        </div>
        <div className="dashboard-sidebar">
          <Sidebar 
            producer={selectedProducer} 
            report={analysisReport} 
            onSelectMatch={handleSelectMatch}
            onGenerateReport={handleGenerateReport}
            onAddToWatchlist={handleAddToWatchlist}
          />
        </div>
        <div className="dashboard-map">
          <MapView 
            selectedProducer={selectedProducer} 
            matches={analysisReport ? analysisReport.ranked_matches : []}
            mapFocus={mapFocus}
          />
        </div>
      </main>
    </>
  );
}

export default HomePage;