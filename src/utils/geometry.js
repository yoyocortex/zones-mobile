/**
 * Geometry utilities for polygon validation and zone overlap detection
 */

/**
 * Line segment intersection test
 * Uses cross-product method to detect if two line segments intersect
 * @returns {boolean} True if segments intersect (including collinear overlaps)
 */
export const doLinesIntersect = (p1, p2, p3, p4) => {
  // Calculate cross products (orientation test)
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  // General case: segments straddle each other
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  // Collinear cases: points lie on same line
  if (d1 === 0 && onSegment(p3, p1, p4)) return true;
  if (d2 === 0 && onSegment(p3, p2, p4)) return true;
  if (d3 === 0 && onSegment(p1, p3, p2)) return true;
  if (d4 === 0 && onSegment(p1, p4, p2)) return true;

  return false;
};

/**
 * Cross product for orientation test
 * Returns: 0 (collinear), >0 (clockwise), <0 (counterclockwise)
 */
const direction = (p1, p2, p3) => {
  return (p3[1] - p1[1]) * (p2[0] - p1[0]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
};

/**
 * Check if collinear point q lies on segment pr
 */
const onSegment = (p, q, r) => {
  return (
    q[0] <= Math.max(p[0], r[0]) &&
    q[0] >= Math.min(p[0], r[0]) &&
    q[1] <= Math.max(p[1], r[1]) &&
    q[1] >= Math.min(p[1], r[1])
  );
};

/**
 * Self-intersection check for polygon drawing
 * Prevents user from creating invalid polygons with crossing lines
 * @returns {boolean} True if adding newPoint would cause self-intersection
 */
export const wouldIntersect = (existingPoints, newPoint) => {
  if (existingPoints.length < 2) {
    return false; // Need 2+ points to form line
  }

  const lastPoint = existingPoints[existingPoints.length - 1];
  const newLine = [lastPoint, newPoint];

  // Check new line against all existing lines
  for (let i = 0; i < existingPoints.length - 1; i++) {
    const existingLine = [existingPoints[i], existingPoints[i + 1]];

    // Skip checking against line we're extending
    if (i === existingPoints.length - 2) {
      continue;
    }

    if (doLinesIntersect(newLine[0], newLine[1], existingLine[0], existingLine[1])) {
      return true;
    }
  }

  // Check if closing polygon (newPoint → firstPoint) would intersect
  if (existingPoints.length >= 2) {
    const closingLine = [newPoint, existingPoints[0]];

    for (let i = 1; i < existingPoints.length - 1; i++) {
      const existingLine = [existingPoints[i], existingPoints[i + 1]];

      if (doLinesIntersect(closingLine[0], closingLine[1], existingLine[0], existingLine[1])) {
        return true;
      }
    }
  }

  return false;
};
