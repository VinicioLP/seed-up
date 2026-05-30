import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/components/app-theme';

type CameraCaptureModalProps = {
  visible: boolean;
  title: string;
  gallerySelectionLimit?: number;
  onClose: () => void;
  onCaptured: (photoUri: string) => void;
  onCapturedMany?: (photoUris: string[]) => void;
};

export function CameraCaptureModal({
  visible,
  title,
  gallerySelectionLimit = 1,
  onClose,
  onCaptured,
  onCapturedMany,
}: CameraCaptureModalProps) {
  const { colors } = useAppTheme();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isTakingPicture, setIsTakingPicture] = useState(false);

  useEffect(() => {
    if (visible && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission, visible]);

  async function takePicture() {
    if (!cameraRef.current || isTakingPicture) {
      return;
    }

    setIsTakingPicture(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.82,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onCaptured(photo.uri);
        onClose();
      }
    } finally {
      setIsTakingPicture(false);
    }
  }

  async function pickFromGallery() {
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!mediaPermission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.86,
      allowsEditing: gallerySelectionLimit === 1,
      allowsMultipleSelection: gallerySelectionLimit > 1,
      selectionLimit: gallerySelectionLimit,
      orderedSelection: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length) {
      const photoUris = result.assets.map((asset) => asset.uri).filter(Boolean);

      if (photoUris.length > 1 && onCapturedMany) {
        onCapturedMany(photoUris);
      } else if (photoUris[0]) {
        onCaptured(photoUris[0]);
      }

      onClose();
    }
  }

  function toggleFacing() {
    setFacing((currentFacing) => (currentFacing === 'back' ? 'front' : 'back'));
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.screen, { backgroundColor: '#050805' }]}>
        <View style={styles.topBar}>
          <Text style={styles.title}>{title}</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        ) : (
          <View style={[styles.permissionBox, { backgroundColor: colors.surfaceStrong }]}>
            <Ionicons name="camera-outline" size={42} color={colors.tint} />
            <Text style={[styles.permissionTitle, { color: colors.text }]}>Permissao da camera</Text>
            <Text style={[styles.permissionText, { color: colors.muted }]}>
              Permita o acesso para registrar a imagem.
            </Text>
            <Pressable style={[styles.permissionButton, { backgroundColor: colors.tint }]} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Permitir camera</Text>
            </Pressable>
          </View>
        )}

        {permission?.granted ? (
          <View style={styles.captureBar}>
            <Pressable style={styles.sideAction} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={25} color="#FFFFFF" />
              <Text style={styles.sideActionText}>Galeria</Text>
            </Pressable>

            <Pressable
              style={[styles.captureButton, isTakingPicture && styles.captureButtonDisabled]}
              onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </Pressable>

            <Pressable style={styles.sideAction} onPress={toggleFacing}>
              <Ionicons name="camera-reverse-outline" size={27} color="#FFFFFF" />
              <Text style={styles.sideActionText}>Virar</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    minHeight: 78,
    paddingTop: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  permissionBox: {
    margin: 24,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 12,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
  },
  permissionButton: {
    minHeight: 46,
    borderRadius: 17,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  captureBar: {
    minHeight: 118,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  sideAction: {
    width: 78,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sideActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.55,
  },
  captureButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
});
