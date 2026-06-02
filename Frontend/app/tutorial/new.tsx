import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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
import { createTutorial } from '@/lib/tutorials';

type FormState = {
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  image: string;
  intro: string;
  materials: string;
  steps: string;
  tips: string;
};

const initialForm: FormState = {
  title: '',
  category: 'Horta',
  level: 'Iniciante',
  duration: '10 min',
  description: '',
  image: '',
  intro: '',
  materials: '',
  steps: '',
  tips: '',
};

function parseLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function NewTutorial() {
  const { colors } = useAppTheme();
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitTutorial() {
    const materials = parseLines(form.materials);
    const steps = parseLines(form.steps);
    const tips = parseLines(form.tips);

    if (!form.title.trim() || !form.description.trim() || !form.image.trim() || !form.intro.trim()) {
      setErrorMessage('Preencha titulo, descricao, imagem e introducao.');
      return;
    }

    if (materials.length === 0 || steps.length === 0 || tips.length === 0) {
      setErrorMessage('Adicione pelo menos um material, um passo e uma dica.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');

      const tutorial = await createTutorial({
        title: form.title.trim(),
        category: form.category.trim(),
        level: form.level.trim(),
        duration: form.duration.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        intro: form.intro.trim(),
        materials,
        steps,
        tips,
      });

      setForm(initialForm);
      router.replace({
        pathname: '/tutorial/[id]',
        params: { id: tutorial.id },
      } as never);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
            <Text style={[styles.topTitle, { color: colors.text }]}>Novo tutorial</Text>
            <View style={styles.iconButton} />
          </View>

          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.text }]}>Cadastro de Tutorial</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Esta tela fica fora das abas e salva os tutoriais direto no banco de dados.
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
            <Field
              label="Titulo"
              value={form.title}
              onChangeText={(value) => updateField('title', value)}
              placeholder="Ex: Compostagem simples"
              colors={colors}
            />
            <View style={styles.twoColumns}>
              <Field
                label="Categoria"
                value={form.category}
                onChangeText={(value) => updateField('category', value)}
                placeholder="Horta"
                colors={colors}
              />
              <Field
                label="Nivel"
                value={form.level}
                onChangeText={(value) => updateField('level', value)}
                placeholder="Iniciante"
                colors={colors}
              />
            </View>
            <Field
              label="Duracao"
              value={form.duration}
              onChangeText={(value) => updateField('duration', value)}
              placeholder="10 min"
              colors={colors}
            />
            <Field
              label="Imagem por URL"
              value={form.image}
              onChangeText={(value) => updateField('image', value)}
              placeholder="https://..."
              autoCapitalize="none"
              colors={colors}
            />
            <Field
              label="Descricao curta"
              value={form.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Resumo que aparece no card"
              multiline
              colors={colors}
            />
            <Field
              label="Introducao"
              value={form.intro}
              onChangeText={(value) => updateField('intro', value)}
              placeholder="Explique o objetivo do tutorial"
              multiline
              colors={colors}
            />
            <Field
              label="Materiais necessarios"
              value={form.materials}
              onChangeText={(value) => updateField('materials', value)}
              placeholder={'Um item por linha\nVaso com furos\nSubstrato leve'}
              multiline
              colors={colors}
            />
            <Field
              label="Passo a passo"
              value={form.steps}
              onChangeText={(value) => updateField('steps', value)}
              placeholder={'Um passo por linha\nEscolha o local\nPrepare o vaso'}
              multiline
              colors={colors}
            />
            <Field
              label="Dicas rapidas"
              value={form.tips}
              onChangeText={(value) => updateField('tips', value)}
              placeholder={'Uma dica por linha\nRegue pela manha'}
              multiline
              colors={colors}
            />

            {errorMessage ? (
              <Text style={[styles.errorText, { color: colors.tint }]}>{errorMessage}</Text>
            ) : null}

            <Pressable
              disabled={isSaving}
              style={[
                styles.submitButton,
                { backgroundColor: colors.tint, opacity: isSaving ? 0.6 : 1 },
              ]}
              onPress={submitTutorial}>
              <Ionicons name="save-outline" size={19} color="#FFFFFF" />
              <Text style={styles.submitText}>{isSaving ? 'Salvando...' : 'Salvar tutorial'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  multiline,
  autoCapitalize,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtle}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 42,
    gap: 22,
  },
  topBar: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  formCard: {
    borderRadius: 18,
    padding: 18,
    gap: 16,
  },
  twoColumns: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 106,
    paddingTop: 13,
    paddingBottom: 13,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
