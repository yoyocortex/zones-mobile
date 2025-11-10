import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

/**
 * Bottom toolbar for zone drawing controls
 * Handles mode selection and drawing actions (undo/redo/complete/clear)
 */
export default function BottomToolbar({
  drawingMode, // 'circle' | 'rectangle' | 'polygon' | null
  onSelectMode,
  onComplete,
  onClear,
  onUndo,
  onRedo,
  hasDrawing,
  canUndo,
  canRedo,
}) {
  return (
    <View style={styles.container}>
      {/* Mode Selection - Always visible */}
      <View style={styles.modesSection}>
        <TouchableOpacity
          style={[styles.modeButton, drawingMode === 'circle' && styles.modeButtonActive]}
          onPress={() => onSelectMode('circle')}
        >
          <View style={styles.circleIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, drawingMode === 'rectangle' && styles.modeButtonActive]}
          onPress={() => onSelectMode('rectangle')}
        >
          <View style={styles.rectangleIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, drawingMode === 'polygon' && styles.modeButtonActive]}
          onPress={() => onSelectMode('polygon')}
        >
          <View style={styles.polygonIcon} />
        </TouchableOpacity>
      </View>

      {/* Action Buttons - Conditional on hasDrawing */}
      {hasDrawing && (
        <View style={styles.actionsSection}>
          {canUndo && (
            <TouchableOpacity style={styles.actionButton} onPress={onUndo}>
              <Text style={styles.actionIcon}>↶</Text>
            </TouchableOpacity>
          )}

          {canRedo && (
            <TouchableOpacity style={styles.actionButton} onPress={onRedo}>
              <Text style={styles.actionIcon}>↷</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
            <Text style={styles.actionIcon}>✓</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onClear}>
            <Text style={styles.actionIcon}>×</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  modesSection: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },

  actionsSection: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 10,
  },

  modeButton: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },

  modeButtonActive: {
    borderColor: '#111827',
  },

  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '600',
  },

  circleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6b7280',
  },

  rectangleIcon: {
    width: 22,
    height: 16,
    borderWidth: 2,
    borderColor: '#6b7280',
    borderRadius: 2,
  },

  polygonIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#6b7280',
  },
});
