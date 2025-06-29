// frontend/src/components/MapView.jsx

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// --- HELPER COMPONENT #1: To change the map's view ---
function ChangeView({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo(focus.center, focus.zoom);
    }
  }, [focus, map]);
  return null;
}

// --- HELPER COMPONENT #2: To add the search bar ---
const SearchField = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      onLocationSelect(result.location);
    });

    return () => map.removeControl(searchControl);
  }, [map, onLocationSelect]);

  return null;
};

// --- Icon Fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// --- Main MapView Component ---
function MapView({ selectedProducer, matches = [], onLocationSelect, mapFocus }) {
  const mapCenter = [39.8283, -98.5795];
  const zoomLevel = 4;
  const focusZoomLevel = 9;

  const producerFocus = selectedProducer ? { center: [selectedProducer.location.lat, selectedProducer.location.lon], zoom: focusZoomLevel } : null;
  const currentFocus = mapFocus || producerFocus;

  return (
    <div className="dashboard-map"> 
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        worldCopyJump={true}
      >
        <ChangeView focus={currentFocus} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* onLocationSelect is now optional */}
        {onLocationSelect && <SearchField onLocationSelect={onLocationSelect} />}

        {/* Conditionally render markers only if they exist */}
        {selectedProducer && (
          <Marker position={[selectedProducer.location.lat, selectedProducer.location.lon]}>
            <Popup><strong>PRODUCER: {selectedProducer.name}</strong></Popup>
          </Marker>
        )}

        {matches.map((match) => (
          <Marker key={match.id} position={[match.location.lat, match.location.lon]}>
            <Popup>
              <strong><span className="rank-badge">{match.analysis.rank}</span> {match.name}</strong>
              <div className="popup-analysis">
                <p><em>{match.analysis.justification}</em></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;