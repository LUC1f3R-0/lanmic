"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface FreeMapProps {
  center: [number, number];
  zoom: number;
  className?: string;
}

const FreeMap: React.FC<FreeMapProps> = ({ center, zoom, className }) => {
  useEffect(() => {
    // Import Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    return () => {
      // Cleanup
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={center}
          eventHandlers={{
            click: () => {
              console.log('LANMIC Polymers location clicked');
            }
          }}
        >
          <Popup>
            <div style={{ padding: '12px', maxWidth: '250px', textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%', 
                margin: '0 auto 12px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                L
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px', fontWeight: 'bold' }}>
                LANMIC Polymers (Pvt) Ltd
              </h3>
              <p style={{ margin: '0 0 6px 0', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                Fullerton Industrial Zone
              </p>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                Kalutara, Sri Lanka
              </p>
              <div style={{ 
                padding: '6px 12px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '6px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                📍 Exact Location
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default FreeMap;
