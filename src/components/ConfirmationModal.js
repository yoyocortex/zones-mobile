import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Reusable confirmation modal for destructive actions
 * Supports 'danger' and 'warning' types with different button styling
 */
export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, type === 'danger' && styles.dangerButton]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, type === 'danger' && styles.dangerText]}>
                {confirmText}
              </Text>
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
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 24,
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
  dangerButton: {
    borderColor: '#ef4444',
  },
  dangerText: {
    color: '#ef4444',
  },
});
