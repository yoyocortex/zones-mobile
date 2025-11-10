import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

/**
 * Sheet showing all zones with scroll
 * Tap zone to zoom on map, Delete All for bulk removal
 */
export default function ZoneListModal({ visible, zones, onZoneSelect, onDeleteAll, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={styles.title}>Zones</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable zone list */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {zones.length === 0 ? (
              <Text style={styles.emptyText}>No zones yet</Text>
            ) : (
              zones.map((zone) => (
                <TouchableOpacity
                  key={zone.id}
                  style={styles.zoneItem}
                  onPress={() => onZoneSelect(zone)}
                >
                  <View style={[styles.colorDot, { backgroundColor: zone.colorHex }]} />
                  <View style={styles.zoneInfo}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Text style={styles.zoneDetails}>
                      {zone.type === 'circle' && `Circle • ${Math.round(zone.area)} m²`}
                      {zone.type === 'polygon' && `Polygon • ${zone.coordinates.length} points`}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Delete All - only visible when zones exist */}
          {zones.length > 0 && (
            <TouchableOpacity style={styles.deleteAllButton} onPress={onDeleteAll}>
              <Text style={styles.deleteAllText}>Delete All Zones</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    fontSize: 32,
    color: '#6b7280',
    lineHeight: 32,
    fontWeight: '300',
  },
  list: {
    maxHeight: 400,
  },
  emptyText: {
    textAlign: 'center',
    padding: 40,
    fontSize: 14,
    color: '#9ca3af',
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  zoneDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  deleteAllButton: {
    margin: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  deleteAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
