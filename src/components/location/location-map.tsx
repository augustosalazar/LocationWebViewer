import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LatLngExpression,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon - workaround for leaflet issue with create-react-app
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export interface LocationMapProps {
  locations: {
    id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
  }[];
}

interface RecenterAutomaticallyProps {
  locations: {
    latitude: number;
    longitude: number;
  }[];
}

function RecenterAutomatically({locations}: RecenterAutomaticallyProps) {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(
        loc => loc.latitude != null && loc.longitude != null,
      );
      if (validLocations.length > 0) {
        const firstLocation: {latitude: number; longitude: number} =
          validLocations[0]; // Use the first valid location
        const center: LatLngExpression = [
          firstLocation.latitude,
          firstLocation.longitude,
        ];
        if (locations.length === 1) {
          map.setView(center, 13); // Zoom level 13 for single location
        } else {
          map.setView(center, 5); // Zoom level 5 for multiple locations
        }
      }
    } else {
      map.setView([0, 0], 2); // Default view if no locations
    }
  }, [locations, map]);

  return null;
}

export function LocationMap({locations}: LocationMapProps) {
  const [clientRender, setClientRender] = useState(false);

  useEffect(() => {
    setClientRender(true);
  }, []);

  if (!clientRender) {
    return (
      <div className="flex-grow flex justify-center items-center h-full w-full rounded-lg shadow-md bg-muted">
        <p>Loading map...</p>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    // Handled by parent, but good to keep a fallback
    return (
      <div className="flex-grow flex justify-center items-center h-full w-full rounded-lg shadow-md bg-muted">
        <p className="text-muted-foreground">
          No locations to display on the map.
        </p>
      </div>
    );
  }

  const centerLat = locations[0]?.latitude ?? 0; // Fallback to 0 if first location is somehow invalid
  const centerLng = locations[0]?.longitude ?? 0;

  // Using a simpler key as the entire EmailDetails component re-mounts or major state changes handle re-renders.
  // The key's main purpose here is to ensure Leaflet initializes correctly if the container was hidden.
  const mapKey = `map-${locations.length}-${
    locations[0]?.id || 'empty'
  }-${Date.now()}`; // Added Date.now() to ensure unique key

  return (
    <MapContainer
      key={mapKey}
      center={[centerLat, centerLng]}
      zoom={locations.length === 1 ? 13 : 5}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '0.5rem',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
      }}
      className="flex-grow"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations
        .filter(loc => loc.latitude != null && loc.longitude != null)
        .map(location => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              Lat: {location.latitude.toFixed(4)}, Lng:{' '}
              {location.longitude.toFixed(4)} <br />
              Time: {new Date(location.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      <RecenterAutomatically locations={locations} />
    </MapContainer>
  );
}
