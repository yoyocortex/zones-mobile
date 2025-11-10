/**
 * Utility functions for calculating zone geometric properties
 * Handles area and center calculations for all zone types
 */

/**
 * Calculate area of a zone in square meters
 * Supports: circle, rectangle, polygon
 * @param {Object} zone - Zone object with type, coordinates, and optional radius
 * @returns {number|null} Area in m² or null if calculation fails
 */
export function calculateZoneArea(zone) {
  if (zone.type === 'circle' && zone.radius) {
    const area = Math.PI * zone.radius * zone.radius;
    return area;
  }

  if (zone.type === 'rectangle') {
    // Unwrap nested coordinate arrays to flat array of [lat, lng] points
    let coords = zone.coordinates;
    while (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && coords.length === 1) {
      coords = coords[0];
    }

    const lat1 = Math.min(coords[0][0], coords[1][0], coords[2][0], coords[3][0]);
    const lat2 = Math.max(coords[0][0], coords[1][0], coords[2][0], coords[3][0]);
    const lng1 = Math.min(coords[0][1], coords[1][1], coords[2][1], coords[3][1]);
    const lng2 = Math.max(coords[0][1], coords[1][1], coords[2][1], coords[3][1]);

    const latDiff = Math.abs(lat2 - lat1);
    const lngDiff = Math.abs(lng2 - lng1);
    const avgLat = (lat1 + lat2) / 2;

    const heightM = latDiff * 111000;
    const widthM = lngDiff * 111000 * Math.cos((avgLat * Math.PI) / 180);

    const area = heightM * widthM;
    return area;
  }

  if (zone.type === 'polygon') {
    let coords = zone.coordinates;
    while (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && coords.length === 1) {
      coords = coords[0];
    }

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const lat1 = coords[i][0];
      const lng1 = coords[i][1];
      const lat2 = coords[j][0];
      const lng2 = coords[j][1];

      area += lng1 * lat2 - lng2 * lat1;
    }

    area = Math.abs(area / 2);

    const metersPerDegreeLat = 111000;
    const avgLat = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
    const metersPerDegreeLng = 111000 * Math.cos((avgLat * Math.PI) / 180);

    const result = area * metersPerDegreeLat * metersPerDegreeLng;
    return result;
  }

  return null;
}

/**
 * Calculate center point (centroid) of a zone
 * @param {Object} zone - Zone object with type and coordinates
 * @returns {Object|null} Center point { lat, lng } or null if calculation fails
 */
export function calculateZoneCenter(zone) {
  // Circle: center is the single coordinate point
  if (zone.type === 'circle') {
    const [lat, lng] = zone.coordinates[0];
    return { lat, lng };
  }

  // Rectangle & Polygon: calculate centroid (average of all points)
  if (zone.type === 'rectangle' || zone.type === 'polygon') {
    // Unwrap nested arrays
    let coords = zone.coordinates;
    while (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && coords.length === 1) {
      coords = coords[0];
    }

    // Calculate mean of all coordinates
    const sumLat = coords.reduce((sum, coord) => sum + coord[0], 0);
    const sumLng = coords.reduce((sum, coord) => sum + coord[1], 0);

    const center = {
      lat: sumLat / coords.length,
      lng: sumLng / coords.length,
    };

    return center;
  }

  return null;
}
