import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Polygon, Circle, Marker } from 'react-native-maps';

import { ZonesProvider, useZonesContext } from './src/context/ZonesContext';
import { checkZoneOverlap } from './src/utils/zoneValidation';
import { wouldIntersect } from './src/utils/geometry';
import { getColorHex } from './shared/colors';

import BottomToolbar from './src/components/BottomToolbar';
import DrawingLayer from './src/components/DrawingLayer';
import ZoneDetailsModal from './src/components/ZoneDetailsModal';
import ZoneActionSheet from './src/components/ZoneActionSheet';
import ZoneListModal from './src/components/ZoneListModal';
import ColorFilter from './src/components/ColorFilter';
import Toast from './src/components/Toast';
import ConfirmationModal from './src/components/ConfirmationModal';

/**
 * Main map screen component
 * Handles zone drawing, editing, deletion, and map interactions
 * Separated from App to consume ZonesContext (must be child of ZonesProvider)
 */
function MapScreen() {
  const {
    zones,
    clearZones,
    drawingMode,
    drawingShape,
    startDrawing,
    setDrawingShape,
    clearDrawing,
    completeDrawing,
    deleteZone,
    updateZone,
    colorFilter,
    toggleColorFilter,
    filteredZones,
    undoLastPoint,
    redoLastPoint,
    redoStack,
  } = useZonesContext();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showZoneListModal, setShowZoneListModal] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [confirmation, setConfirmation] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const mapRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  const showConfirmation = (title, message, onConfirm) => {
    setConfirmation({ visible: true, title, message, onConfirm });
  };

  const hideConfirmation = () => {
    setConfirmation({ visible: false, title: '', message: '', onConfirm: null });
  };

  /**
   * Toggle drawing mode (tap again to exit)
   */
  const handleModeSelect = (mode) => {
    if (drawingMode === mode) {
      clearDrawing();
    } else {
      startDrawing(mode);
    }
  };

  /**
   * Handle map tap during drawing
   * Circle/Rectangle: Single tap creates shape
   * Polygon: Multiple taps add points
   */
  const handleMapPress = (event) => {
    if (!drawingMode) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Circle: Create fixed-radius circle at tap location
    if (drawingMode === 'circle') {
      setDrawingShape({
        center: { lat: latitude, lng: longitude },
        radius: 300, // Fixed 300m radius
        coordinates: [[latitude, longitude]],
      });
    }

    // Rectangle: Create fixed-size rectangle centered at tap
    if (drawingMode === 'rectangle') {
      const latOffset = 0.0015; // ~165m N-S
      const lngOffset = 0.002; // ~165m E-W (at 45° lat)

      const rectangleCoords = [
        [latitude + latOffset, longitude - lngOffset], // Top-left
        [latitude + latOffset, longitude + lngOffset], // Top-right
        [latitude - latOffset, longitude + lngOffset], // Bottom-right
        [latitude - latOffset, longitude - lngOffset], // Bottom-left
      ];

      setDrawingShape({
        coordinates: rectangleCoords,
      });
    }

    // Polygon: Add point with self-intersection check
    if (drawingMode === 'polygon') {
      const newPoint = [latitude, longitude];

      if (!drawingShape) {
        // First point
        setDrawingShape({
          coordinates: [newPoint],
        });
      } else {
        // Self-intersection check (prevents crossing lines)
        if (wouldIntersect(drawingShape.coordinates, newPoint)) {
          showToast('Invalid point - would create crossing lines', 'error');
          return;
        }

        // Add point
        const updatedCoords = [...drawingShape.coordinates, newPoint];
        setDrawingShape({
          coordinates: updatedCoords,
        });
      }
    }
  };

  /**
   * Complete drawing (validate + show name/color modal)
   */
  const handleComplete = () => {
    if (!drawingShape) {
      showToast('No shape to save', 'error');
      return;
    }

    // Validate polygon has 3+ points
    if (drawingMode === 'polygon' && drawingShape.coordinates.length < 3) {
      showToast('Polygon needs at least 3 points', 'error');
      return;
    }

    // Prepare zone for overlap check
    const tempZone = {
      type: drawingMode === 'rectangle' ? 'polygon' : drawingMode,
      coordinates: drawingShape.coordinates,
      radius: drawingShape.radius,
    };

    // Overlap detection using Turf.js (accurate)
    const { hasOverlap, overlappingZones } = checkZoneOverlap(tempZone, zones);

    if (hasOverlap) {
      showToast(
        `Cannot save - overlaps with ${overlappingZones.length} zone${overlappingZones.length > 1 ? 's' : ''}`,
        'error'
      );
      return;
    }

    // Show name/color input modal
    setShowDetailsModal(true);
  };

  /**
   * Save zone with name and color
   * Handles both CREATE (new zone) and EDIT (existing zone)
   */
  const handleConfirmDetails = ({ name, color }) => {
    if (selectedZone) {
      // EDIT MODE: Update existing zone
      const colorHex = getColorHex(color);
      updateZone(selectedZone.id, {
        name,
        color,
        colorHex,
      });
      setShowDetailsModal(false);
      setSelectedZone(null);
      showToast(`Zone "${name}" updated`, 'success');
    } else {
      // CREATE MODE: Save new zone
      const zone = completeDrawing({ name, color });
      setShowDetailsModal(false);
      if (zone) {
        showToast(`Zone "${name}" created`, 'success');
      }
    }
  };

  /**
   * Cancel drawing
   */
  const handleClear = () => {
    clearDrawing();
  };

  /**
   * Delete all zones (with confirmation)
   */
  const handleDeleteAll = () => {
    if (zones.length === 0) return;

    showConfirmation(
      'Delete All Zones?',
      `This will permanently delete all ${zones.length} zones.`,
      () => {
        const count = zones.length;
        clearZones();
        hideConfirmation();
        showToast(`${count} zones deleted`, 'success');
      }
    );
  };

  /**
   * Animate camera to zone bounds
   * Circle: Center + radius padding
   * Polygon: Calculate bounding box
   */
  const zoomToZone = (zone) => {
    if (!mapRef.current) return;

    if (zone.type === 'circle') {
      const center = zone.coordinates[0];
      const radiusInDegrees = zone.radius / 111000;

      mapRef.current.animateToRegion(
        {
          latitude: center[0],
          longitude: center[1],
          latitudeDelta: radiusInDegrees * 3,
          longitudeDelta: radiusInDegrees * 3,
        },
        500
      );
    } else {
      // Polygon/Rectangle: Calculate bounds
      const coords = zone.coordinates;
      const lats = coords.map((c) => c[0]);
      const lngs = coords.map((c) => c[1]);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.5;
      const lngDelta = (maxLng - minLng) * 1.5;

      mapRef.current.animateToRegion(
        {
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lngDelta, 0.01),
        },
        500
      );
    }
  };

  /**
   * Zone tap handler (opens edit/delete action sheet)
   * Disabled during drawing mode
   */
  const handleZonePress = (zone) => {
    if (drawingMode) {
      return;
    }
    setSelectedZone(zone);
    setShowActionSheet(true);
  };

  /**
   * Edit zone (opens name/color modal in edit mode)
   */
  const handleEditZone = () => {
    setShowActionSheet(false);
    setShowDetailsModal(true);
  };

  /**
   * Delete single zone (with confirmation)
   */
  const handleDeleteZone = () => {
    if (!selectedZone) return;

    showConfirmation(
      'Delete Zone?',
      `Are you sure you want to delete "${selectedZone.name}"?`,
      () => {
        const zoneName = selectedZone.name;
        deleteZone(selectedZone.id);
        setShowActionSheet(false);
        setSelectedZone(null);
        hideConfirmation();
        showToast(`Zone "${zoneName}" deleted`, 'success');
      }
    );
  };

  /**
   * Close action sheet
   */
  const handleCloseActionSheet = () => {
    setShowActionSheet(false);
    setSelectedZone(null);
  };

  const handleOpenZoneList = () => {
    setShowZoneListModal(true);
  };

  const handleZoneSelectFromList = (zone) => {
    setShowZoneListModal(false);
    zoomToZone(zone);
  };

  const handleDeleteAllFromList = () => {
    setShowZoneListModal(false);
    handleDeleteAll();
  };

  const handleUndoLastPoint = () => {
    undoLastPoint();
  };

  const handleRedoLastPoint = () => {
    redoLastPoint();
  };

  /**
   * Called from ZoneDetailsModal when validation fails (e.g., empty name)
   */
  const onError = (message) => {
    showToast(message, 'error');
    setShowDetailsModal(false);
    setSelectedZone(null);
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 45.815, // Zagreb, Croatia
          longitude: 15.98,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={handleMapPress}
      >
        {/* Render saved zones */}
        {filteredZones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;

          if (zone.type === 'circle') {
            const center = zone.coordinates[0];
            const centerCoord = {
              latitude: center[0],
              longitude: center[1],
            };

            return (
              <React.Fragment key={zone.id}>
                {/* Circle visual */}
                <Circle
                  center={centerCoord}
                  radius={zone.radius}
                  fillColor={zone.colorHex + (isSelected ? '60' : '40')}
                  strokeColor={zone.colorHex}
                  strokeWidth={isSelected ? 4 : 2}
                />

                {/* Invisible tap target (Circle doesn't support onPress) */}
                <Marker
                  coordinate={centerCoord}
                  opacity={0}
                  onPress={() => handleZonePress(zone)}
                />
              </React.Fragment>
            );
          } else {
            // Polygon/Rectangle
            const coords = zone.coordinates.map((point) => ({
              latitude: point[0],
              longitude: point[1],
            }));

            return (
              <Polygon
                key={zone.id}
                coordinates={coords}
                fillColor={zone.colorHex + (isSelected ? '60' : '40')}
                strokeColor={zone.colorHex}
                strokeWidth={isSelected ? 4 : 2}
                onPress={() => handleZonePress(zone)}
                tappable={true}
              />
            );
          }
        })}

        {/* In-progress drawing (blue overlay) */}
        <DrawingLayer />
      </MapView>

      {/* Header (zones count + list button) */}
      <View style={styles.headerWrapper} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="auto">
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Zones</Text>
              <Text style={styles.subtitle}>{filteredZones.length} zones</Text>
            </View>
            <TouchableOpacity style={styles.listButton} onPress={handleOpenZoneList}>
              <Text style={styles.listIcon}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Color filter (floating right side) */}
      <ColorFilter activeColors={colorFilter} onToggleColor={toggleColorFilter} />

      {/* Bottom toolbar (mode selection + actions) */}
      <BottomToolbar
        drawingMode={drawingMode}
        onSelectMode={handleModeSelect}
        onComplete={handleComplete}
        onClear={handleClear}
        onUndo={handleUndoLastPoint}
        onRedo={handleRedoLastPoint}
        hasDrawing={drawingShape !== null}
        canUndo={drawingMode === 'polygon' && drawingShape?.coordinates?.length > 0}
        canRedo={drawingMode === 'polygon' && redoStack.length > 0}
      />

      {/* Zone name/color input modal (dual-mode: create/edit) */}
      <ZoneDetailsModal
        visible={showDetailsModal}
        onConfirm={handleConfirmDetails}
        onCancel={() => {
          setShowDetailsModal(false);
          setSelectedZone(null);
        }}
        onError={onError}
        initialValues={selectedZone ? { name: selectedZone.name, color: selectedZone.color } : null}
      />

      {/* Edit/Delete action sheet (bottom sheet) */}
      <ZoneActionSheet
        visible={showActionSheet}
        zone={selectedZone}
        onEdit={handleEditZone}
        onDelete={handleDeleteZone}
        onClose={handleCloseActionSheet}
      />

      {/* All zones list modal */}
      <ZoneListModal
        visible={showZoneListModal}
        zones={zones}
        onZoneSelect={handleZoneSelectFromList}
        onDeleteAll={handleDeleteAllFromList}
        onClose={() => setShowZoneListModal(false)}
      />

      {/* Toast notifications (non-blocking feedback) */}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* Confirmation modal (destructive actions) */}
      <ConfirmationModal
        visible={confirmation.visible}
        title={confirmation.title}
        message={confirmation.message}
        confirmText="Delete"
        onConfirm={confirmation.onConfirm}
        onCancel={hideConfirmation}
        type="danger"
      />
    </View>
  );
}

/**
 * Root App component
 * Wraps MapScreen with ZonesProvider (context must be parent)
 */
export default function App() {
  return (
    <ZonesProvider>
      <MapScreen />
    </ZonesProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  map: {
    flex: 1,
  },
  headerWrapper: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  listButton: {
    width: 36,
    height: 36,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listIcon: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
});
