import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
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

export default function Login() {
  const { colors } = useAppTheme();
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const emailFocus = useRef(new Animated.Value(0)).current;
  const passwordFocus = useRef(new Animated.Value(0)).current;
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

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
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setErrorMessage('Preencha e-mail e senha para continuar.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setErrorMessage('Digite um e-mail valido.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('A senha precisa ter pelo menos 4 caracteres.');
      return;
    }

    setErrorMessage('');

    try {
      await signIn(cleanEmail, password);
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
                <Text style={[styles.fieldLabel, { color: colors.text }]}>E-mail</Text>
                <Animated.View
                  onTouchEnd={() => emailInputRef.current?.focus()}
                  style={[
                    styles.inputBox,
                    styles.inputBoxAnimated,
                    { backgroundColor: colors.surface },
                    animatedInputStyle(emailFocus),
                  ]}>
                  <Ionicons name="mail-outline" size={28} color={colors.subtle} />
                  <TextInput
                    ref={emailInputRef}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => animateFocus(emailFocus, 1)}
                    onBlur={() => animateFocus(emailFocus, 0)}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.subtle}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
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
});
