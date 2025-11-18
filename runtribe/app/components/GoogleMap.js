'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const GoogleMapComponent = ({ location, height = "300px", width = "100%" }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Google Maps API key - you'll need to add this to your environment variables
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!location || !GOOGLE_MAPS_API_KEY) {
      setLoading(false);
      return;
    }

    // Geocode the location string to get coordinates
    const geocodeLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        console.log('response', response);
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setCoordinates({ lat, lng });
        } else {
          setError('Location not found');
        }
      } catch (err) {
        setError('Failed to load location');
        console.error('Geocoding error:', err);
      } finally {
        setLoading(false);
      }
    };

    geocodeLocation();
  }, [location, GOOGLE_MAPS_API_KEY]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-300">Google Maps API key not configured</p>
        <p className="text-sm text-gray-400 mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center" style={{ height, width }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#66ff00] mx-auto"></div>
        <p className="mt-2 text-gray-300">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center" style={{ height, width }}>
        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="mt-2 text-gray-300">{error}</p>
        <p className="text-sm text-gray-400 mt-1">Location: {location}</p>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center" style={{ height, width }}>
        <p className="text-gray-300">No location provided</p>
      </div>
    );
  }

  const mapContainerStyle = {
    width,
    height,
    borderRadius: '8px'
  };

  const center = coordinates;

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker
          position={coordinates}
          title={location}
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
