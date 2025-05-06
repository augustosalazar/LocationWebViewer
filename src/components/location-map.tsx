
'use client';

import type { LocationData } from '@/services/location-service';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

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
      
      // Filter out invalid coordinates before calculating bounds
      const validLatitudes = latitudes.filter(lat => lat !== null && lat !== undefined && !isNaN(lat));
      const validLongitudes = longitudes.filter(lng => lng !== null && lng !== undefined && !isNaN(lng));

      if (validLatitudes.length === 0 || validLongitudes.length === 0) {
        // Fallback if no valid coordinates, maybe center on a default location or do nothing
        map.setView([0,0], 2); // Example: center on 0,0 with low zoom
        return;
      }
      
      const minLat = Math.min(...validLatitudes);
      const maxLat = Math.max(...validLatitudes);
      const minLng = Math.min(...validLongitudes);
      const maxLng = Math.max(...validLongitudes);
      
      if (locations.length === 1 && validLatitudes.length === 1 && validLongitudes.length === 1) {
        map.setView([validLatitudes[0], validLongitudes[0]], 13);
      } else if (minLat !== Infinity && maxLat !== -Infinity && minLng !== Infinity && maxLng !== -Infinity) {
         map.fitBounds([
          [minLat, minLng],
          [maxLat, maxLng],
        ], { padding: [50, 50] }); 
      }
    } else {
        // Default view if no locations
        map.setView([20, 0], 2); // Center on a generic world view
    }
  }, [locations, map]);
  return null;
}


export function LocationMap({ locations }: LocationMapProps) {
  const [clientRender, setClientRender] = useState(false);

  useEffect(() => {
    setClientRender(true);
  }, []);

  if (!clientRender) {
    return <div className="flex-grow flex justify-center items-center h-full w-full rounded-lg shadow-md bg-muted"><p>Loading map...</p></div>;
  }

  if (!locations || locations.length === 0) {
    // Handled by parent, but good to keep a fallback
    return <div className="flex-grow flex justify-center items-center h-full w-full rounded-lg shadow-md bg-muted"><p className="text-muted-foreground">No locations to display on the map.</p></div>;
  }

  const centerLat = locations[0]?.latitude ?? 0; // Fallback to 0 if first location is somehow invalid
  const centerLng = locations[0]?.longitude ?? 0;
  
  // Using a simpler key as the entire EmailDetails component re-mounts or major state changes handle re-renders.
  // The key's main purpose here is to ensure Leaflet initializes correctly if the container was hidden.
  const mapKey = `map-${locations.length}-${locations[0]?.id || 'empty'}`;


  return (
    <MapContainer 
        key={mapKey} 
        center={[centerLat, centerLng]} 
        zoom={locations.length === 1 ? 13 : 5} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}
        className="flex-grow"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.filter(loc => loc.latitude != null && loc.longitude != null).map(location => (
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
