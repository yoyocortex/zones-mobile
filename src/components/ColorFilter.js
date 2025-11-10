import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { getColorOptions } from '../../shared/colors';

/**
 * Floating vertical color filter bar
 * Toggles zone visibility by color
 */
export default function ColorFilter({ activeColors, onToggleColor }) {
  const colors = getColorOptions();

  return (
    <View style={styles.container}>
      {colors.map((color) => {
        const isActive = activeColors.includes(color.value);

        return (
          <TouchableOpacity
            key={color.value}
            style={[
              styles.colorButton,
              { backgroundColor: color.hex },
              !isActive && styles.colorButtonInactive,
            ]}
            onPress={() => onToggleColor(color.value)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -100 }],
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  colorButtonInactive: {
    opacity: 0.3,
    borderColor: '#e5e7eb',
  },
});
