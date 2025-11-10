import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Bottom sheet for zone actions (Delete/Edit)
 * Triggered when tapping saved zone on map
 */
export default function ZoneActionSheet({ visible, zone, onEdit, onDelete, onClose }) {
  if (!zone) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          {/* Zone metadata display */}
          <View style={styles.header}>
            <View style={[styles.colorIndicator, { backgroundColor: zone.colorHex }]} />
            <View style={styles.info}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneDetails}>
                {zone.type === 'circle' && `Circle • ${Math.round(zone.area)} m²`}
                {zone.type === 'polygon' && `Polygon • ${zone.coordinates.length} points`}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  info: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  zoneDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#111827',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
