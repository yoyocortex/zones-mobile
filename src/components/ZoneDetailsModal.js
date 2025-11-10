import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { getColorOptions } from '../../shared/colors';

/**
 * Dual-purpose modal: Create new zone OR Edit existing zone
 */
export default function ZoneDetailsModal({ visible, onConfirm, onCancel, onError, initialValues }) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');

  const colors = getColorOptions();

  // Sync state with modal visibility and mode
  useEffect(() => {
    if (visible) {
      if (initialValues) {
        setName(initialValues.name || '');
        setSelectedColor(initialValues.color || 'blue');
      } else {
        setName('');
        setSelectedColor('blue');
      }
    }
  }, [visible, initialValues]);

  const handleConfirm = () => {
    if (!name.trim()) {
      onError?.('Please enter a zone name');
      return;
    }
    onConfirm({ name: name.trim(), color: selectedColor });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Dynamic title based on mode */}
          <Text style={styles.title}>{initialValues ? 'Edit Zone' : 'Zone Details'}</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter zone name"
            placeholderTextColor="#9ca3af"
            autoFocus
          />

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorGrid}>
            {colors.map((colorOption) => (
              <TouchableOpacity
                key={colorOption.value}
                style={[
                  styles.colorButton,
                  selectedColor === colorOption.value && styles.colorButtonSelected,
                ]}
                onPress={() => setSelectedColor(colorOption.value)}
              >
                <View style={[styles.colorCircle, { backgroundColor: colorOption.hex }]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>{initialValues ? 'Save' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#111827',
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  colorButton: {
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  colorButtonSelected: {
    borderColor: '#111827',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#111827',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
