import React, { useState, useEffect, useRef } from 'react';
import MapView from '../components/MapView';
import MatchesPanel from '../components/Sidebar';
import ProducerList from '../components/ProducerList';
import ImpactModal from '../components/ImpactModal';
import { getMatches, getMatchSummary, getImpactReport } from '../api';
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
  const reqRef = useRef(0); // guards against a stale async summary landing late

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
    const reqId = ++reqRef.current;
    try {
      // /api/matches returns fully-ranked matches with a score breakdown in
      // ~80ms, so the list shows instantly. The brief AI summary is fetched
      // separately and folded in when it lands — it never blocks the matches.
      const matches = await getMatches(producer.id);
      if (reqRef.current !== reqId) return; // superseded by a newer selection

      const base = {
        ranked_matches: matches,
        overall_summary: matches.length
          ? `${matches.length} viable partner${matches.length === 1 ? '' : 's'} for ${producer.name}, ranked by capacity fit, proximity, and CO₂ purity.`
          : 'No viable matches in range.',
      };
      cacheAnalysisReport(producer, base);
      localStorage.setItem('carbonflow_last_producer', JSON.stringify(producer));
      setAnalysisReport(base);

      if (matches.length) {
        getMatchSummary(producer, matches)
          .then(({ summary }) => {
            if (reqRef.current !== reqId || !summary) return;
            const upgraded = { ...base, overall_summary: summary };
            cacheAnalysisReport(producer, upgraded);
            setAnalysisReport(upgraded);
          })
          .catch(() => {}); // keep the deterministic summary if AI is slow/down
      }
    } catch (e) {
      if (reqRef.current !== reqId) return;
      setError(e.message);
      setAnalysisReport({ ranked_matches: [], overall_summary: `Couldn't load matches: ${e.message}` });
    } finally {
      if (reqRef.current === reqId) setIsLoading(false);
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
