import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-context';
import { CameraCaptureModal } from '@/components/camera-capture-modal';

export default function Profile() {
  const { colors } = useAppTheme();
  const { signOut, updateNickname, updateProfilePhoto, user } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [message, setMessage] = useState('');
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  useEffect(() => {
    setNickname(user?.nickname ?? '');
  }, [user?.nickname]);

  async function handleSaveNickname() {
    const cleanNickname = nickname.trim();

    if (cleanNickname.length < 3) {
      setMessage('O apelido precisa ter pelo menos 3 caracteres.');
      return;
    }

    try {
      await updateNickname(cleanNickname);
      setMessage('Apelido atualizado.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar.');
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  async function handlePhotoCaptured(photoUri: string) {
    await updateProfilePhoto(photoUri);
    setMessage('Foto de perfil atualizada.');
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Perfil</Text>
          <Text style={[styles.pageSubtitle, { color: colors.muted }]}>
            Gerencie suas informacoes pessoais.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceStrong }]}>
          <Pressable
            style={[styles.avatar, { backgroundColor: colors.iconBox }]}
            onPress={() => setIsCameraVisible(true)}>
            {user?.profilePhotoUri ? (
              <Image source={{ uri: user.profilePhotoUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Ionicons name="person-outline" size={42} color={colors.tint} />
            )}
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
            </View>
          </Pressable>

          <Text style={[styles.nickname, { color: colors.text }]}>
            {user?.nickname ?? 'Jardineiro'}
          </Text>
          <Text style={[styles.email, { color: colors.muted }]}>{user?.email}</Text>

          <View style={styles.infoGroup}>
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <View style={[styles.readOnlyBox, { backgroundColor: colors.surface }]}>
              <Ionicons name="mail-outline" size={22} color={colors.subtle} />
              <Text style={[styles.readOnlyText, { color: colors.muted }]}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Apelido no app</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
              <Ionicons name="leaf-outline" size={22} color={colors.subtle} />
              <TextInput
                value={nickname}
                onChangeText={(value) => {
                  setNickname(value);
                  setMessage('');
                }}
                placeholder="Digite seu apelido"
                placeholderTextColor={colors.subtle}
                autoCapitalize="words"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          {message ? (
            <Text
              style={[
                styles.message,
                { color: message.includes('atualizado') ? colors.tint : '#B84D3B' },
              ]}>
              {message}
            </Text>
          ) : null}

          <Pressable style={[styles.saveButton, { backgroundColor: colors.tint }]} onPress={handleSaveNickname}>
            <Ionicons name="save-outline" size={19} color="#FFFFFF" />
            <Text style={styles.saveText}>Salvar apelido</Text>
          </Pressable>

          <Pressable style={[styles.logoutButton, { borderColor: colors.border }]} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.tint} />
            <Text style={[styles.logoutText, { color: colors.tint }]}>Sair da conta</Text>
          </Pressable>
        </View>
      </ScrollView>

      <CameraCaptureModal
        visible={isCameraVisible}
        title="Foto de perfil"
        onClose={() => setIsCameraVisible(false)}
        onCaptured={handlePhotoCaptured}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 110,
    justifyContent: 'center',
    gap: 18,
  },
  header: {
    gap: 6,
  },
  pageTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 22,
    gap: 14,
    boxShadow: '0 16px 24px rgba(46, 96, 72, 0.12)',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  nickname: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  email: {
    marginTop: -8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  infoGroup: {
    gap: 7,
  },
  label: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  readOnlyBox: {
    minHeight: 52,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readOnlyText: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  inputBox: {
    minHeight: 52,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 22,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  logoutButton: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
});
