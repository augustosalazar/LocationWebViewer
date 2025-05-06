'use client';

import type { LocationData } from '@/services/location-service';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default icon issue with Leaflet and Webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationMapProps {
  locations: LocationData[];
}

// Component to recenter map when locations change
function RecenterAutomatically({ locations }: { locations: LocationData[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const latitudes = locations.map(loc => loc.latitude);
      const longitudes = locations.map(loc => loc.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      if (locations.length === 1) {
        map.setView([locations[0].latitude, locations[0].longitude], 13);
      } else if (minLat !== Infinity && maxLat !== -Infinity && minLng !== Infinity && maxLng !== -Infinity) {
         map.fitBounds([
          [minLat, minLng],
          [maxLat, maxLng],
        ], { padding: [50, 50] }); // Add padding to ensure markers are not on the edge
      }
    }
  }, [locations, map]);
  return null;
}


export function LocationMap({ locations }: LocationMapProps) {
  if (!locations || locations.length === 0) {
    return <p className="text-muted-foreground">No locations to display on the map.</p>;
  }

  // Calculate a center point for the map. If only one location, use it. Otherwise, use the first location.
  const centerLat = locations[0].latitude;
  const centerLng = locations[0].longitude;

  return (
    <MapContainer center={[centerLat, centerLng]} zoom={locations.length === 1 ? 13 : 5} style={{ height: '400px', width: '100%', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map(location => (
        <Marker key={location.id} position={[location.latitude, location.longitude]}>
          <Popup>
            Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)} <br />
            Time: {new Date(location.timestamp).toLocaleString()}
          </Popup>
        </Marker>
      ))}
      <RecenterAutomatically locations={locations} />
    </MapContainer>
  );
}
