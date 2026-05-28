import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

function ChangeView({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo(focus.center, focus.zoom);
  }, [focus, map]);
  return null;
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapView({ selectedProducer, matches = [], mapFocus }) {
  const mapCenter = [39.8283, -98.5795];
  const zoom = 4;
  const focusZoom = 9;

  const producerFocus = selectedProducer
    ? { center: [selectedProducer.location.lat, selectedProducer.location.lon], zoom: focusZoom }
    : null;
  const focus = mapFocus || producerFocus;

  return (
    <div className="map-pane">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        worldCopyJump
        zoomControl={false}
      >
        <ChangeView focus={focus} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap, &copy; CARTO'
          subdomains="abcd"
          maxZoom={19}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {selectedProducer && (
          <Marker position={[selectedProducer.location.lat, selectedProducer.location.lon]}>
            <Popup>
              <strong>Producer · {selectedProducer.name}</strong>
              <div style={{ marginTop: 4, color: 'var(--text-2)' }}>
                {selectedProducer.co2_supply_tonnes_per_week} t/wk supply
              </div>
            </Popup>
          </Marker>
        )}

        {matches.map((m) => (
          <Marker key={m.id} position={[m.location.lat, m.location.lon]}>
            <Popup>
              <strong>#{m.analysis?.rank ?? '–'} · {m.name}</strong>
              <div style={{ marginTop: 4, color: 'var(--text-2)' }}>
                {m.industry} · {m.distance_km} km
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
