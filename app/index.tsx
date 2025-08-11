import React, { useCallback, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { setCapturedImageBase64 } from '@/lib/captureStore';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);

  const hasPermission = permission?.granted === true;
  const canAskAgain = permission?.canAskAgain !== false;

  const onRequestPermission = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  const onCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const camera = cameraRef.current as unknown as {
        takePictureAsync: (options?: { quality?: number; base64?: boolean; skipProcessing?: boolean }) => Promise<{ uri: string; base64?: string }>;
      };
      const photo = await camera.takePictureAsync({ quality: 0.9, base64: true, skipProcessing: true });
      const base64: string | undefined = photo?.base64;
      if (base64) {
        setCapturedImageBase64(base64);
        router.push('/modal');
      } else {
        const uri: string | undefined = photo?.uri;
        router.push({ pathname: '/modal', params: { uri } });
      }
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera access is required</Text>
        {canAskAgain ? (
          <TouchableOpacity style={styles.permissionButton} onPress={onRequestPermission}>
            <Text style={styles.permissionButtonText}>Grant permission</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.permissionNote}>Enable the Camera permission in Settings</Text>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.previewArea}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        <View style={styles.frame} />
        <Text style={styles.hintText}>Point the camera at a math problem</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.captureButton, isCapturing && styles.captureDisabled]} onPress={onCapture} disabled={isCapturing}>
          {isCapturing ? <ActivityIndicator color="#000" /> : <View style={styles.captureInner} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
  },
  permissionButton: {
    marginTop: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  permissionNote: {
    color: '#bbb',
    marginTop: 8,
  },
  previewArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '80%',
    aspectRatio: 1.4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#4ade80',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  hintText: {
    marginTop: 16,
    color: '#fff',
    opacity: 0.8,
  },
  controls: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  captureDisabled: { opacity: 0.7 },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#000',
  },
});


