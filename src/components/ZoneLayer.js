import React from 'react';
import { Polygon, Circle } from 'react-native-maps';
import { useZonesContext } from '../context/ZonesContext';

/**
 * Renders saved zones on map (respects color filter)
 * Handles coordinate format normalization for polygons
 */
export default function ZoneLayer({ onZonePress }) {
  const { filteredZones } = useZonesContext();

  return (
    <>
      {filteredZones.map((zone) => {
        // Circle rendering
        if (zone.type === 'circle' && zone.radius) {
          const center = zone.coordinates[0];

          // Handle multiple coordinate formats
          const coordinate = Array.isArray(center)
            ? { latitude: center[0], longitude: center[1] }
            : {
                latitude: center.lat || center.latitude,
                longitude: center.lng || center.longitude,
              };

          return (
            <Circle
              key={zone.id}
              center={coordinate}
              radius={zone.radius}
              fillColor={zone.colorHex + '33'}
              strokeColor={zone.colorHex}
              strokeWidth={2}
              onPress={() => onZonePress?.(zone)}
            />
          );
        }

        // Polygon/Rectangle rendering
        if (zone.type === 'polygon' || zone.type === 'rectangle') {
          let coords = zone.coordinates;

          // Unwrap nested arrays (legacy data handling)
          while (Array.isArray(coords) && coords.length === 1 && Array.isArray(coords[0])) {
            coords = coords[0];
          }

          // Normalize to { latitude, longitude } format
          const coordinates = coords
            .map((point) => {
              // Object format: {lat, lng} or {latitude, longitude}
              if (point && typeof point === 'object' && !Array.isArray(point)) {
                return {
                  latitude: point.lat || point.latitude,
                  longitude: point.lng || point.longitude,
                };
              }

              // Array format: [lat, lng]
              if (Array.isArray(point) && point.length >= 2) {
                return {
                  latitude: point[0],
                  longitude: point[1],
                };
              }

              console.warn('[ZoneLayer] Invalid coordinate format:', point);
              return null;
            })
            .filter((p) => p !== null);

          // Skip rendering if no valid coordinates
          if (coordinates.length === 0) {
            console.warn('[ZoneLayer] No valid coordinates for zone:', zone.id);
            return null;
          }

          return (
            <Polygon
              key={zone.id}
              coordinates={coordinates}
              fillColor={zone.colorHex + '33'}
              strokeColor={zone.colorHex}
              strokeWidth={2}
              tappable={true}
              onPress={() => onZonePress?.(zone)}
            />
          );
        }

        return null;
      })}
    </>
  );
}
