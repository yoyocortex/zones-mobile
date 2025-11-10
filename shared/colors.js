/**
 * Zone color definitions and helper functions
 * Centralized color management for the application
 */

// Available zone colors with labels and hex values
export const ZONE_COLORS = {
  red: { name: 'Crvena', hex: '#ef4444' },
  blue: { name: 'Plava', hex: '#3b82f6' },
  green: { name: 'Zelena', hex: '#10b981' },
  yellow: { name: 'Žuta', hex: '#eab308' },
  purple: { name: 'Ljubičasta', hex: '#a855f7' },
};

/**
 * Get hex color value by color key
 * @param {string} colorKey - Color key
 * @returns {string} Hex color value
 */
export const getColorHex = (colorKey) => {
  return ZONE_COLORS[colorKey]?.hex || '#3b82f6';
};

/**
 * Get all color options formatted for select/radio inputs
 * @returns {Array} Array of { value, label, hex } objects
 */
export const getColorOptions = () => {
  return Object.entries(ZONE_COLORS).map(([key, value]) => ({
    value: key,
    label: value.name,
    hex: value.hex,
  }));
};
