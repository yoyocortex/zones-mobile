import * as turf from '@turf/turf';

/**
 * Check if a new zone overlaps with any existing zones
 * Uses Turf.js library for geometric intersection detection
 *
 * @param {Object} newZone - New zone data with coordinates
 * @param {Array} existingZones - Array of existing zones to check against
 * @returns {Object} { hasOverlap: boolean, overlappingZones: Array }
 */
export function checkZoneOverlap(newZone, existingZones) {
  if (!newZone || !existingZones || existingZones.length === 0) {
    return { hasOverlap: false, overlappingZones: [] };
  }

  const overlappingZones = [];
  const newGeometry = zoneToTurfGeometry(newZone);

  if (!newGeometry) {
    console.warn('Could not convert new zone to Turf geometry');
    return { hasOverlap: false, overlappingZones: [] };
  }

  // Check new zone against each existing zone
  for (const existingZone of existingZones) {
    const existingGeometry = zoneToTurfGeometry(existingZone);

    if (!existingGeometry) {
      console.warn('Could not convert existing zone to Turf geometry:', existingZone.id);
      continue;
    }

    try {
      // Check both overlap and intersection (covers all cases)
      const overlaps = turf.booleanOverlap(newGeometry, existingGeometry);
      const intersects = turf.booleanIntersects(newGeometry, existingGeometry);

      if (overlaps || intersects) {
        overlappingZones.push(existingZone);
      }
    } catch (error) {
      console.error('Error checking intersection:', error);
    }
  }

  return {
    hasOverlap: overlappingZones.length > 0,
    overlappingZones,
  };
}

/**
 * Convert zone data to Turf.js geometry format
 * Turf uses [lng, lat] format (GeoJSON standard) vs [lat, lng]
 *
 * @param {Object} zone - Zone with type and coordinates
 * @returns {Object|null} Turf Feature or null if conversion fails
 */
function zoneToTurfGeometry(zone) {
  try {
    // Circle: Convert to polygon with 64 points approximation
    if (zone.type === 'circle') {
      const center = zone.coordinates[0];

      let lat, lng;
      if (Array.isArray(center)) {
        lat = center[0];
        lng = center[1];
      } else if (center.lat !== undefined && center.lng !== undefined) {
        lat = center.lat;
        lng = center.lng;
      } else {
        console.error('[Validation] Invalid circle center format:', center);
        return null;
      }

      const radius = zone.radius / 1000; // Convert meters to kilometers
      const turfCenter = [lng, lat]; // Turf expects [lng, lat]

      return turf.circle(turfCenter, radius, {
        steps: 64,
        units: 'kilometers',
      });
    }

    // Polygon: Convert coordinates to GeoJSON format
    if (zone.type === 'polygon') {
      let coords = zone.coordinates;

      // Unwrap nested arrays to flat array of points
      while (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && coords.length === 1) {
        coords = coords[0];
      }

      // Convert [lat, lng] to [lng, lat] for Turf
      const turfCoords = coords
        .map((point) => {
          if (Array.isArray(point)) {
            return [point[1], point[0]]; // [lat, lng] → [lng, lat]
          }
          if (point.lat !== undefined && point.lng !== undefined) {
            return [point.lng, point.lat];
          }
          console.error('[Validation] Invalid polygon point:', point);
          return null;
        })
        .filter((p) => p !== null);

      // Ensure polygon is closed (first point === last point)
      const first = turfCoords[0];
      const last = turfCoords[turfCoords.length - 1];

      if (first[0] !== last[0] || first[1] !== last[1]) {
        turfCoords.push([...first]);
      }

      return turf.polygon([turfCoords]);
    }

    // Rectangle: Convert to closed polygon
    if (zone.type === 'rectangle') {
      let coords = zone.coordinates;

      // Unwrap nested arrays
      while (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && coords.length === 1) {
        coords = coords[0];
      }

      // Convert coordinate objects to arrays if needed
      const points = coords
        .map((point) => {
          if (Array.isArray(point)) {
            return point;
          }
          if (point && typeof point === 'object' && 'lat' in point && 'lng' in point) {
            return [point.lat, point.lng];
          }
          console.error('[Validation] Invalid rectangle point:', point);
          return null;
        })
        .filter((p) => p !== null);

      // Extract min/max bounds from 4 corner points
      const lats = points.map((p) => p[0]);
      const lngs = points.map((p) => p[1]);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // Create closed rectangle in [lng, lat] format
      const rectangleCoords = [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat],
      ];

      return turf.polygon([rectangleCoords]);
    }

    return null;
  } catch (error) {
    console.error('[Validation] Error converting zone:', error, zone);
    return null;
  }
}
