import React from 'react';
import { Circle, Polygon, Polyline, Marker } from 'react-native-maps';
import { useZonesContext } from '../context/ZonesContext';

/**
 * Renders current drawing shape
 * Different from ZoneLayer which renders saved zones
 */
export default function DrawingLayer() {
  const { drawingMode, drawingShape } = useZonesContext();

  if (!drawingShape) return null;

  // Circle: render immediately with center + radius
  if (drawingMode === 'circle' && drawingShape.center) {
    return (
      <Circle
        center={{
          latitude: drawingShape.center.lat,
          longitude: drawingShape.center.lng,
        }}
        radius={drawingShape.radius || 100}
        fillColor="rgba(59, 130, 246, 0.3)"
        strokeColor="#3b82f6"
        strokeWidth={3}
      />
    );
  }

  // Rectangle: stored as polygon with 4 corners
  if (drawingMode === 'rectangle' && drawingShape.coordinates) {
    const coords = drawingShape.coordinates.map((point) => ({
      latitude: point[0],
      longitude: point[1],
    }));

    return (
      <Polygon
        coordinates={coords}
        fillColor="rgba(59, 130, 246, 0.3)"
        strokeColor="#3b82f6"
        strokeWidth={3}
      />
    );
  }

  // Polygon: progressive rendering based on point count
  if (drawingMode === 'polygon' && drawingShape.coordinates) {
    const coords = drawingShape.coordinates.map((point) => ({
      latitude: point[0],
      longitude: point[1],
    }));

    // < 3 points: show markers + connecting line (no fill)
    if (coords.length < 3) {
      return (
        <>
          {coords.map((coord, index) => (
            <Marker key={index} coordinate={coord} pinColor="#3b82f6" />
          ))}

          {coords.length > 1 && (
            <Polyline coordinates={coords} strokeColor="#3b82f6" strokeWidth={3} />
          )}
        </>
      );
    }

    // >= 3 points: show filled polygon + markers on vertices
    return (
      <>
        {coords.map((coord, index) => (
          <Marker key={index} coordinate={coord} pinColor="#3b82f6" />
        ))}

        <Polygon
          coordinates={coords}
          fillColor="rgba(59, 130, 246, 0.3)"
          strokeColor="#3b82f6"
          strokeWidth={3}
        />
      </>
    );
  }

  return null;
}
