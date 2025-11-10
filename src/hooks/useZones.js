import { useState, useEffect, useRef } from 'react';
import * as Crypto from 'expo-crypto';
import { calculateZoneArea, calculateZoneCenter } from '../utils/zoneCalculations';
import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS } from '../../shared/constants';

/**
 * CRUD hook with AsyncStorage persistence
 * Auto-calculates zone area and center on creation
 */
export function useZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousZonesRef = useRef(zones); // Prevents unnecessary saves

  /**
   * Load zones from AsyncStorage on mount
   */
  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const stored = await getItem(STORAGE_KEYS.ZONES);
      if (stored && Array.isArray(stored)) {
        setZones(stored);
        previousZonesRef.current = stored;
      }
    } catch (error) {
      console.error('[useZones] Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-save to AsyncStorage on zones change
   * Uses ref comparison to prevent save loops
   */
  useEffect(() => {
    if (loading) return;

    // Deep equality check (prevents re-save on same data)
    if (JSON.stringify(previousZonesRef.current) === JSON.stringify(zones)) {
      return;
    }

    const saveZones = async () => {
      try {
        await setItem(STORAGE_KEYS.ZONES, zones);
        previousZonesRef.current = zones;
      } catch (error) {
        console.error('[useZones] Error saving zones:', error);
      }
    };

    saveZones();
  }, [zones, loading]);

  /**
   * Create zone with auto-calculated metadata
   * - Generates UUID
   * - Calculates area (m²)
   * - Calculates center point
   * - Adds timestamp
   */
  const addZone = (zoneData) => {
    const area = calculateZoneArea(zoneData);
    const center = calculateZoneCenter(zoneData);

    const newZone = {
      id: Crypto.randomUUID(),
      ...zoneData,
      area,
      center,
      createdAt: new Date().toISOString(),
    };

    setZones((prev) => [...prev, newZone]);
    return newZone;
  };

  /**
   * Update zone (name, color, etc.)
   * Does NOT recalculate area/center
   */
  const updateZone = (id, updates) => {
    setZones((prev) => prev.map((zone) => (zone.id === id ? { ...zone, ...updates } : zone)));
  };

  /**
   * Delete zone by ID
   */
  const deleteZone = (id) => {
    setZones((prev) => prev.filter((zone) => zone.id !== id));
  };

  /**
   * Delete all zones
   */
  const clearZones = () => {
    setZones([]);
  };

  return {
    zones,
    loading,
    addZone,
    updateZone,
    deleteZone,
    clearZones,
    refetch: loadZones, // Manual refresh (e.g., after external change)
  };
}
