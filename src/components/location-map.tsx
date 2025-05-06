
'use client';

import type { LocationData } from '@/services/location-service';
import 'leaflet/dist/leaflet.css';
// import L from 'leaflet'; // Removed direct import
import type L from 'leaflet'; // Import L type for type safety
import { useEffect, useState, useRef } from 'react';
import { LoadingSpinner } from './loading-spinner';


interface LocationMapProps {
  locations: LocationData[];
}

export function LocationMap({ locations }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const LRef = useRef<typeof L | null>(null);


  useEffect(() => {
    // Dynamically import Leaflet only on the client side
    import('leaflet').then(leaflet => {
      LRef.current = leaflet.default;
      // Fix for default icon issue with Leaflet and Webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (LRef.current.Icon.Default.prototype as any)._getIconUrl;

      LRef.current.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setIsLeafletLoaded(true);
    }).catch(error => {
        console.error("Failed to load Leaflet", error);
        // Potentially set an error state here to inform the user
    });
  }, []);

  useEffect(() => {
    if (!isLeafletLoaded || !mapRef.current || !LRef.current) return;
    
    const L = LRef.current;


    // Initialize map if it hasn't been initialized yet
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        // Adjust map options if needed, e.g., scrollWheelZoom: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    const validLocations = locations.filter(loc => loc.latitude != null && loc.longitude != null);

    if (validLocations.length > 0) {
      validLocations.forEach(location => {
        const marker = L.marker([location.latitude, location.longitude])
          .addTo(map)
          .bindPopup(`Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)} <br />Time: ${new Date(location.timestamp).toLocaleString()}`);
        markersRef.current.push(marker);
      });

      if (validLocations.length === 1) {
        map.setView([validLocations[0].latitude, validLocations[0].longitude], 13);
      } else {
        const latitudes = validLocations.map(loc => loc.latitude);
        const longitudes = validLocations.map(loc => loc.longitude);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        if (minLat !== Infinity && maxLat !== -Infinity && minLng !== Infinity && maxLng !== -Infinity) {
          map.fitBounds([
            [minLat, minLng],
            [maxLat, maxLng],
          ], { padding: [50, 50] });
        } else if (validLocations.length > 0) { // Fallback if bounds are weird but locations exist
           map.setView([validLocations[0].latitude, validLocations[0].longitude], 5);
        }
      }
    } else {
      // Default view if no locations
      map.setView([20, 0], 2);
    }

    // Ensure map size is updated if container size changed
    map.invalidateSize();


  }, [locations, isLeafletLoaded]); // Rerun effect if locations or leaflet loaded status changes

  // Cleanup function to remove map instance when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);


  if (!isLeafletLoaded) {
    return <div className="flex-grow flex justify-center items-center h-full w-full rounded-lg shadow-md bg-muted"><LoadingSpinner size={32} /><p className="ml-2">Loading map components...</p></div>;
  }

  // The div for the map container. Leaflet will attach the map to this div.
  // Ensure `flex-grow` allows it to take available space in its parent CardContent.
  return (
    <div 
      ref={mapRef} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }} 
      className="flex-grow" 
      aria-label="Location map"
    />
  );
}
