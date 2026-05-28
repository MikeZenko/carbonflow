import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import MatchesPanel from '../components/Sidebar';
import ProducerList from '../components/ProducerList';
import ImpactModal from '../components/ImpactModal';
import { getMatches, getImpactReport } from '../api';
import {
  cacheReport, getCachedReport,
  cacheAnalysisReport, getCachedAnalysisReport,
} from '../utils/reportCache';

function HomePage() {
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapFocus, setMapFocus] = useState(null);
  const [impactReport, setImpactReport] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('carbonWatchlist');
    if (saved) {
      try { setWatchlist(JSON.parse(saved)); } catch {}
    }

    const last = localStorage.getItem('carbonflow_last_producer');
    if (last) {
      try {
        const p = JSON.parse(last);
        const cached = getCachedAnalysisReport(p);
        if (cached) {
          setSelectedProducer(p);
          setAnalysisReport(cached);
        } else {
          localStorage.removeItem('carbonflow_last_producer');
        }
      } catch {
        localStorage.removeItem('carbonflow_last_producer');
      }
    }
  }, []);

  const handleAddToWatchlist = (m) => {
    if (watchlist.some((i) => i.id === m.id)) return;
    const next = [...watchlist, m];
    setWatchlist(next);
    localStorage.setItem('carbonWatchlist', JSON.stringify(next));
  };

  const handleFindMatches = async (producer) => {
    if (!producer?.id) return;
    setSelectedProducer(producer);
    setMapFocus(null);
    setImpactReport(null);
    setError(null);

    const cached = getCachedAnalysisReport(producer);
    if (cached) {
      localStorage.setItem('carbonflow_last_producer', JSON.stringify(producer));
      setAnalysisReport(cached);
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);
    try {
      // /api/matches already returns ranked matches with a full score
      // breakdown in ~80ms. We surface that directly — no slow per-match
      // LLM pass, which is also exactly the "no black box" pitch.
      const matches = await getMatches(producer.id);
      const report = {
        ranked_matches: matches || [],
        overall_summary: matches && matches.length
          ? `${matches.length} viable partner${matches.length === 1 ? '' : 's'} for ${producer.name}, ranked by capacity fit, proximity, and CO₂ purity.`
          : 'No viable matches in range.',
      };
      cacheAnalysisReport(producer, report);
      localStorage.setItem('carbonflow_last_producer', JSON.stringify(producer));
      setAnalysisReport(report);
    } catch (e) {
      setError(e.message);
      setAnalysisReport({ ranked_matches: [], overall_summary: `Couldn't load matches: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMatch = (m) => {
    setMapFocus({ center: [m.location.lat, m.location.lon], zoom: 11 });
  };

  const handleGenerateReport = async (m) => {
    if (!selectedProducer || !m) return;
    const cached = getCachedReport(selectedProducer, m);
    if (cached) { setImpactReport(cached); return; }

    setIsLoading(true);
    try {
      const data = await getImpactReport(selectedProducer, m);
      cacheReport(selectedProducer, m, data);
      setImpactReport(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const matches = analysisReport?.ranked_matches || [];
  const hasMatches = matches.length > 0;

  return (
    <div className="dashboard">
      <ProducerList selectedId={selectedProducer?.id} onSelect={handleFindMatches} />

      <div className={`workspace ${selectedProducer ? '' : 'no-matches'}`}>
        <MapView
          selectedProducer={selectedProducer}
          matches={hasMatches ? matches : []}
          mapFocus={mapFocus}
        />
        {selectedProducer && (
          <MatchesPanel
            producer={selectedProducer}
            report={analysisReport}
            isLoading={isLoading}
            onSelectMatch={handleSelectMatch}
            onGenerateReport={handleGenerateReport}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}
      </div>

      {impactReport && (
        <ImpactModal report={impactReport} onClose={() => setImpactReport(null)} />
      )}

      {error && (
        <div className="scrim" onClick={() => setError(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button className="btn btn-ghost" onClick={() => setError(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
