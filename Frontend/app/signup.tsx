import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-context';

export default function Signup() {
  const { colors } = useAppTheme();
  const { isAuthenticated, isLoading, signUp } = useAuth();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const nicknameFocus = useRef(new Animated.Value(0)).current;
  const emailFocus = useRef(new Animated.Value(0)).current;
  const passwordFocus = useRef(new Animated.Value(0)).current;
  const confirmPasswordFocus = useRef(new Animated.Value(0)).current;
  const nicknameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

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

  async function createAccount() {
    const cleanEmail = email.trim();
    const cleanNickname = nickname.trim();

    if (!cleanNickname || !cleanEmail || !password || !confirmPassword) {
      setErrorMessage('Preencha todos os campos para cadastrar.');
      return;
    }

    if (cleanNickname.length < 3) {
      setErrorMessage('O apelido precisa ter pelo menos 3 caracteres.');
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

    if (password !== confirmPassword) {
      setErrorMessage('As senhas precisam ser iguais.');
      return;
    }

    setErrorMessage('');

    try {
      await signUp(cleanEmail, password, cleanNickname);
      router.replace('/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel cadastrar.');
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <View style={styles.brandArea}>
            <View style={[styles.logoBox, { backgroundColor: colors.tint }]}>
              <Ionicons name="leaf-outline" size={38} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandTitle, { color: colors.tint }]}>Criar conta</Text>
            <Text style={[styles.brandSubtitle, { color: colors.muted }]}>
              Comece a organizar seu jardim hoje.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surfaceStrong }]}>
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
                <Ionicons name="person-outline" size={26} color={colors.subtle} />
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
              <Text style={[styles.fieldLabel, { color: colors.text }]}>E-mail</Text>
              <Animated.View
                onTouchEnd={() => emailInputRef.current?.focus()}
                style={[
                  styles.inputBox,
                  styles.inputBoxAnimated,
                  { backgroundColor: colors.surface },
                  animatedInputStyle(emailFocus),
                ]}>
                <Ionicons name="mail-outline" size={26} color={colors.subtle} />
                <TextInput
                  ref={emailInputRef}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => animateFocus(emailFocus, 1)}
                  onBlur={() => animateFocus(emailFocus, 0)}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.subtle}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.input, { color: colors.text }]}
                />
              </Animated.View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Senha</Text>
              <Animated.View
                onTouchEnd={() => passwordInputRef.current?.focus()}
                style={[
                  styles.inputBox,
                  styles.inputBoxAnimated,
                  { backgroundColor: colors.surface },
                  animatedInputStyle(passwordFocus),
                ]}>
                <Ionicons name="lock-closed-outline" size={26} color={colors.subtle} />
                <TextInput
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => animateFocus(passwordFocus, 1)}
                  onBlur={() => animateFocus(passwordFocus, 0)}
                  placeholder="senha"
                  placeholderTextColor={colors.subtle}
                  secureTextEntry
                  style={[styles.input, { color: colors.text }]}
                />
              </Animated.View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Confirmar senha</Text>
              <Animated.View
                onTouchEnd={() => confirmPasswordInputRef.current?.focus()}
                style={[
                  styles.inputBox,
                  styles.inputBoxAnimated,
                  { backgroundColor: colors.surface },
                  animatedInputStyle(confirmPasswordFocus),
                ]}>
                <Ionicons name="shield-checkmark-outline" size={26} color={colors.subtle} />
                <TextInput
                  ref={confirmPasswordInputRef}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => animateFocus(confirmPasswordFocus, 1)}
                  onBlur={() => animateFocus(confirmPasswordFocus, 0)}
                  placeholder="confirme sua senha"
                  placeholderTextColor={colors.subtle}
                  secureTextEntry
                  style={[styles.input, { color: colors.text }]}
                />
              </Animated.View>
            </View>

            {errorMessage ? (
              <Text style={[styles.errorText, { color: '#B84D3B' }]}>{errorMessage}</Text>
            ) : null}

            <Pressable style={[styles.primaryButton, { backgroundColor: colors.tint }]} onPress={createAccount}>
              <Text style={styles.primaryButtonText}>Cadastrar</Text>
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: colors.muted }]}>Ja tem conta?</Text>
              <Pressable onPress={() => router.replace('/login')}>
                <Text style={[styles.loginLink, { color: colors.tint }]}>Entrar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 22,
    justifyContent: 'center',
    gap: 14,
  },
  brandArea: {
    alignItems: 'center',
    gap: 5,
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
  card: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 14,
    boxShadow: '0 18px 28px rgba(46, 96, 72, 0.13)',
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  inputBox: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  inputBoxAnimated: {
    shadowColor: '#07833B',
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    lineHeight: 23,
  },
  errorText: {
    marginTop: -4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 15px rgba(7, 131, 59, 0.24)',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  loginText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loginLink: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
});
