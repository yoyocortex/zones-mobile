import React, { createContext, useContext, useState } from 'react';
import { useZones } from '../hooks/useZones';
import { getColorHex } from '../../shared/colors';

/**
 * Global state management for zones and drawing
 * Wraps useZones hook and adds drawing/filtering state
 */
const ZonesContext = createContext(undefined);

/**
 * Hook to consume ZonesContext
 * Throws error if used outside provider (prevents undefined access)
 */
export function useZonesContext() {
  const context = useContext(ZonesContext);
  if (!context) {
    throw new Error('useZonesContext must be used within ZonesProvider');
  }
  return context;
}

/**
 * Provider wrapping app with zones state
 * Combines CRUD (from hook) + drawing state + filtering
 */
export function ZonesProvider({ children }) {
  const zonesHook = useZones(); // AsyncStorage persistence

  // ==========================================
  // DRAWING STATE
  // ==========================================

  const [drawingMode, setDrawingMode] = useState(null); // 'circle' | 'rectangle' | 'polygon' | null
  const [drawingShape, setDrawingShape] = useState(null);
  const [redoStack, setRedoStack] = useState([]);

  // ==========================================
  // SELECTION STATE
  // ==========================================

  const [selectedZone, setSelectedZone] = useState(null);

  // ==========================================
  // FILTER STATE
  // ==========================================

  const [colorFilter, setColorFilter] = useState(['red', 'blue', 'green', 'yellow', 'purple']);
  const filteredZones = zonesHook.zones.filter((zone) => colorFilter.includes(zone.color));

  // ==========================================
  // DRAWING ACTIONS
  // ==========================================

  /**
   * Start new drawing session
   * Clears previous drawing and redo stack
   */
  const startDrawing = (mode) => {
    setDrawingMode(mode);
    setDrawingShape(null);
    setRedoStack([]); // Clear undo/redo history
    setSelectedZone(null);
  };

  /**
   * Discard current drawing
   */
  const clearDrawing = () => {
    setDrawingMode(null);
    setDrawingShape(null);
    setRedoStack([]);
  };

  /**
   * Finalize drawing and save as zone
   * Returns created zone or null if validation fails
   */
  const completeDrawing = (options = {}) => {
    if (!drawingShape || !drawingShape.coordinates) {
      console.warn('[ZonesContext] No valid drawing to complete');
      return null;
    }

    // Polygon validation
    if (drawingMode === 'polygon' && drawingShape.coordinates.length < 3) {
      console.warn('[ZonesContext] Polygon needs at least 3 points');
      return null;
    }

    // Build zone object
    const newZone = {
      name: options.name || `${capitalize(drawingMode)} ${zonesHook.zones.length + 1}`,
      color: options.color || 'blue',
      colorHex: getColorHex(options.color || 'blue'),
      type: drawingMode === 'rectangle' ? 'polygon' : drawingMode, // Rectangle stored as polygon
      coordinates: drawingShape.coordinates,
    };

    // Add radius for circles
    if (drawingMode === 'circle' && drawingShape.radius) {
      newZone.radius = drawingShape.radius;
    }

    const createdZone = zonesHook.addZone(newZone);
    clearDrawing();
    return createdZone;
  };

  /**
   * Add point to polygon (also clears redo stack)
   */
  const addDrawingPoint = (point) => {
    if (drawingMode !== 'polygon') {
      console.warn('[ZonesContext] addDrawingPoint only works in polygon mode');
      return;
    }

    setRedoStack([]);

    setDrawingShape((prev) => {
      if (!prev) {
        return { coordinates: [[point.lat, point.lng]] };
      }
      return { coordinates: [...prev.coordinates, [point.lat, point.lng]] };
    });
  };

  /**
   * Remove last polygon point (saves to redo stack)
   */
  const undoLastPoint = () => {
    if (drawingMode !== 'polygon') {
      console.warn('[ZonesContext] undoLastPoint only works in polygon mode');
      return;
    }

    setDrawingShape((prev) => {
      if (!prev || prev.coordinates.length === 0) {
        return null;
      }

      const lastPoint = prev.coordinates[prev.coordinates.length - 1];
      setRedoStack((stack) => [...stack, lastPoint]);

      if (prev.coordinates.length === 1) {
        return null;
      }

      return { coordinates: prev.coordinates.slice(0, -1) };
    });
  };

  /**
   * Restore last polygon point
   */
  const redoLastPoint = () => {
    if (drawingMode !== 'polygon') {
      console.warn('[ZonesContext] redoLastPoint only works in polygon mode');
      return;
    }

    if (redoStack.length === 0) {
      console.warn('[ZonesContext] No points to redo');
      return;
    }

    const pointToRestore = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, -1));

    setDrawingShape((prev) => {
      if (!prev) {
        return { coordinates: [pointToRestore] };
      }
      return { coordinates: [...prev.coordinates, pointToRestore] };
    });
  };

  // ==========================================
  // FILTER ACTIONS
  // ==========================================

  /**
   * Toggle color visibility (add/remove from filter)
   */
  const toggleColorFilter = (color) => {
    setColorFilter((prev) => {
      if (prev.includes(color)) {
        return prev.filter((c) => c !== color);
      } else {
        return [...prev, color];
      }
    });
  };

  /**
   * Show all colors
   */
  const setAllColors = () => {
    setColorFilter(['red', 'blue', 'green', 'yellow', 'purple']);
  };

  /**
   * Hide all colors
   */
  const clearAllColors = () => {
    setColorFilter([]);
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    // CRUD from hook (AsyncStorage persistence)
    zones: zonesHook.zones,
    loading: zonesHook.loading,
    addZone: zonesHook.addZone,
    updateZone: zonesHook.updateZone,
    deleteZone: zonesHook.deleteZone,
    clearZones: zonesHook.clearZones,
    refetch: zonesHook.refetch,

    // Drawing state + actions
    drawingMode,
    drawingShape,
    redoStack,
    startDrawing,
    setDrawingShape,
    addDrawingPoint,
    undoLastPoint,
    redoLastPoint,
    clearDrawing,
    completeDrawing,

    // Selection
    selectedZone,
    setSelectedZone,

    // Filtering
    colorFilter,
    filteredZones,
    toggleColorFilter,
    setAllColors,
    clearAllColors,
  };

  return <ZonesContext.Provider value={value}>{children}</ZonesContext.Provider>;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Capitalize first letter
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
