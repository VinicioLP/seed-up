import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-context';

const loginCards = [
  {
    title: 'Inspirar',
    image: 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Organizar',
    image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Cultivar',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80',
  },
];

export default function Login() {
  const { colors } = useAppTheme();
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const nicknameFocus = useRef(new Animated.Value(0)).current;
  const passwordFocus = useRef(new Animated.Value(0)).current;
  const nicknameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/home" />;
  }

  function animateFocus(value: Animated.Value, toValue: number) {
    Animated.timing(value, {
      toValue,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }

  function animatedInputStyle(value: Animated.Value) {
    return {
      borderColor: value.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', colors.tint],
      }),
      shadowOpacity: value.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.18],
      }),
      shadowRadius: value.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 8],
      }),
    };
  }

  async function authenticate() {
    const cleanNickname = nickname.trim();

    if (!cleanNickname || !password) {
      setErrorMessage('Preencha apelido e senha para continuar.');
      return;
    }

    if (cleanNickname.length < 3) {
      setErrorMessage('Digite um apelido valido.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('A senha precisa ter pelo menos 4 caracteres.');
      return;
    }

    setErrorMessage('');

    try {
      await signIn(cleanNickname, password);
      router.replace('/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel entrar.');
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <View style={styles.mainGroup}>
            <View style={styles.brandArea}>
              <View style={[styles.logoBox, { backgroundColor: colors.tint }]}>
                <Ionicons name="leaf-outline" size={38} color="#FFFFFF" />
              </View>
              <Text style={[styles.brandTitle, { color: colors.tint }]}>SeedUp</Text>
              <Text style={[styles.brandSubtitle, { color: colors.muted }]}>
                Cultivando um futuro consciente
              </Text>
            </View>

            <View style={[styles.loginCard, { backgroundColor: colors.surfaceStrong }]}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>Bem-vindo de volta</Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.muted }]}>
                Entre para gerenciar seu jardim.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Apelido</Text>
                <Animated.View
                  onTouchEnd={() => nicknameInputRef.current?.focus()}
                  style={[
                    styles.inputBox,
                    styles.inputBoxAnimated,
                    { backgroundColor: colors.surface },
                    animatedInputStyle(nicknameFocus),
                  ]}>
                  <Ionicons name="person-outline" size={28} color={colors.subtle} />
                  <TextInput
                    ref={nicknameInputRef}
                    value={nickname}
                    onChangeText={setNickname}
                    onFocus={() => animateFocus(nicknameFocus, 1)}
                    onBlur={() => animateFocus(nicknameFocus, 0)}
                    placeholder="seu apelido"
                    placeholderTextColor={colors.subtle}
                    autoCapitalize="words"
                    style={[styles.input, { color: colors.text }]}
                  />
                </Animated.View>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Senha</Text>
                  <Pressable onPress={() => setErrorMessage('Use a senha cadastrada para entrar.')}>
                    <Text style={[styles.forgotText, { color: colors.tint }]}>Esqueceu?</Text>
                  </Pressable>
                </View>
                <Animated.View
                  onTouchEnd={() => passwordInputRef.current?.focus()}
                  style={[
                    styles.inputBox,
                    styles.inputBoxAnimated,
                    { backgroundColor: colors.surface },
                    animatedInputStyle(passwordFocus),
                  ]}>
                  <Ionicons name="lock-closed-outline" size={28} color={colors.subtle} />
                  <TextInput
                    ref={passwordInputRef}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => animateFocus(passwordFocus, 1)}
                    onBlur={() => animateFocus(passwordFocus, 0)}
                    placeholder="senha"
                    placeholderTextColor={colors.subtle}
                    secureTextEntry={!isPasswordVisible}
                    style={[styles.input, { color: colors.text }]}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPressIn={(event) => event.stopPropagation()}
                    onPress={() => setIsPasswordVisible((current) => !current)}>
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={28}
                      color={colors.subtle}
                    />
                  </Pressable>
                </Animated.View>
              </View>

              <Text style={[styles.errorText, { color: '#B84D3B', opacity: errorMessage ? 1 : 0 }]}>
                {errorMessage || 'Mensagem'}
              </Text>

              <Pressable style={[styles.primaryButton, { backgroundColor: colors.tint }]} onPress={authenticate}>
                <Text style={styles.primaryButtonText}>Entrar</Text>
              </Pressable>

              <View style={styles.signupRow}>
                <Text style={[styles.signupText, { color: colors.muted }]}>Ainda nao tem conta?</Text>
                <Pressable onPress={() => router.push('/signup')}>
                  <Text style={[styles.signupLink, { color: colors.tint }]}>Cadastrar</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={[styles.cardRail, isKeyboardVisible && styles.cardRailHidden]}>
            {loginCards.map((card) => (
              <View key={card.title} style={styles.inspirationCard}>
                <Image source={{ uri: card.image }} style={styles.cardImage} contentFit="cover" />
                <View style={styles.cardScrim} />
                <View style={styles.cardPill}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.footer, isKeyboardVisible && styles.footerHidden]}>
            <View style={styles.footerLinks}>
              <Text style={[styles.footerLink, { color: colors.subtle }]}>Termos</Text>
              <Text style={[styles.footerLink, { color: colors.subtle }]}>Privacidade</Text>
              <Text style={[styles.footerLink, { color: colors.subtle }]}>Ajuda</Text>
            </View>
            <Text style={[styles.copy, { color: colors.subtle }]}>
              © 2024 SeedUp App. Made with love for nature.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
  },
  mainGroup: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  brandArea: {
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  logoBox: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 18px rgba(7, 131, 59, 0.22)',
  },
  brandTitle: {
    marginTop: 2,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '900',
  },
  brandSubtitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  loginCard: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 8,
    boxShadow: '0 18px 28px rgba(46, 96, 72, 0.13)',
  },
  welcomeTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
  },
  welcomeSubtitle: {
    marginTop: -4,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputBox: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  inputBoxAnimated: {
    shadowColor: '#07833B',
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 22,
  },
  eyeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: -2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 15px rgba(7, 131, 59, 0.24)',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  signupText: {
    fontSize: 13,
    lineHeight: 18,
  },
  signupLink: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  cardRail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardRailHidden: {
    display: 'none',
  },
  inspirationCard: {
    flex: 1,
    height: 92,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#E5E9E4',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
  },
  cardPill: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    minHeight: 26,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(27, 35, 29, 0.34)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
  },
  footer: {
    alignItems: 'center',
    gap: 5,
  },
  footerHidden: {
    display: 'none',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 26,
  },
  footerLink: {
    fontSize: 12,
    lineHeight: 16,
  },
  copy: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
