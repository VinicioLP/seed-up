import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';

type Message = {
  id: number;
  author: 'assistant' | 'user';
  text: string;
  time: string;
};

type HortaOption = {
  valor: string;
  rotulo: string;
};

type HortaQuestion = {
  id: string;
  tema: string;
  pergunta: string;
  tipo_resposta: 'sim_nao' | 'opcao_unica' | 'multipla_escolha' | 'texto_curto' | 'numero';
  opcoes?: HortaOption[];
  dica_curta?: string;
  proxima_pergunta_sugerida?: string | null;
};

type QuestionBank = {
  fluxo_inicial_sugerido: string[];
  perguntas: HortaQuestion[];
};

type QuickAction =
  | { type: 'answer'; question: HortaQuestion; value: string; label: string }
  | { type: 'tips' }
  | { type: 'help' }
  | { type: 'stage'; stage: HelpStage }
  | { type: 'restart' };

type ChatMode = 'profile' | 'menu' | 'help';

type HelpStage = {
  id: string;
  label: string;
  userText: string;
};

const questionBank = require('../../assets/data/perguntas_hortas_personalizadas_670.json') as QuestionBank;

const allQuestions = questionBank.perguntas;
const questionsById = new Map(allQuestions.map((question) => [question.id, question]));
const initialQuestions = questionBank.fluxo_inicial_sugerido
  .map((id) => questionsById.get(id))
  .filter(Boolean) as HortaQuestion[];
const firstQuestion = initialQuestions[0];

const startMessages: Message[] = [
  {
    id: 1,
    author: 'assistant',
    text:
      `Ola! Sou seu assistente botanico. Vou montar um perfil rapido da sua horta com respostas curtas.\n\n${firstQuestion.pergunta}`,
    time: 'Agora',
  },
];

const helpStages: HelpStage[] = [
  {
    id: 'planejamento',
    label: 'Planejamento',
    userText: 'Preciso de ajuda no planejamento',
  },
  {
    id: 'plantio',
    label: 'Plantio',
    userText: 'Preciso de ajuda no plantio',
  },
  {
    id: 'rega',
    label: 'Rega',
    userText: 'Preciso de ajuda com rega',
  },
  {
    id: 'pragas',
    label: 'Pragas',
    userText: 'Preciso de ajuda com pragas',
  },
  {
    id: 'colheita',
    label: 'Colheita',
    userText: 'Preciso de ajuda na colheita',
  },
];

function getAnswerOptions(question: HortaQuestion) {
  if (question.opcoes?.length) {
    return question.opcoes.map((option) => ({
      value: option.valor,
      label: option.rotulo,
    }));
  }

  if (question.tipo_resposta === 'sim_nao') {
    return [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Nao' },
    ];
  }

  if (question.tipo_resposta === 'numero') {
    return [
      { value: '1', label: '1' },
      { value: '3', label: '3' },
      { value: '5+', label: '5+' },
    ];
  }

  return [
    { value: 'pouco', label: 'Pouco' },
    { value: 'medio', label: 'Medio' },
    { value: 'muito', label: 'Muito' },
    { value: 'nao_sei', label: 'Nao sei' },
  ];
}

export default function ChatIa() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [messages, setMessages] = useState<Message[]>(startMessages);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mode, setMode] = useState<ChatMode>('profile');
  const [profileAnswers, setProfileAnswers] = useState<Record<string, string>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const activeQuestion = initialQuestions[currentQuestionIndex] ?? null;

  const actions: QuickAction[] = mode === 'profile' && activeQuestion
    ? getAnswerOptions(activeQuestion).map((option) => ({
        type: 'answer',
        question: activeQuestion,
        value: option.value,
        label: option.label,
      }))
    : mode === 'help'
      ? helpStages.map((stage) => ({ type: 'stage', stage }))
      : [{ type: 'tips' }, { type: 'help' }, { type: 'restart' }];

  function appendMessages(nextMessages: Omit<Message, 'id' | 'time'>[]) {
    setMessages((current) => [
      ...current,
      ...nextMessages.map((message, index) => ({
        ...message,
        id: current.length + index + 1,
        time: 'Agora',
      })),
    ]);
  }

  async function askAgent({
    intent,
    userMessage,
    currentQuestion,
    nextQuestion,
    profile,
  }: {
    intent: string;
    userMessage: string;
    currentQuestion?: string;
    nextQuestion?: string;
    profile?: Record<string, string>;
  }) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error('A URL da API nao foi configurada no app.');
    }

    try {
      setIsAiLoading(true);

      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          userMessage,
          currentQuestion,
          nextQuestion,
          profile: profile ?? profileAnswers,
          history: messages.slice(-8),
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          message?: string;
          details?: string;
        } | null;
        throw new Error(
          [errorBody?.message, errorBody?.details].filter(Boolean).join('\n') ||
            'A IA nao conseguiu responder agora.'
        );
      }

      const data = (await response.json()) as { reply?: string };

      if (!data.reply?.trim()) {
        throw new Error('A IA retornou uma resposta vazia.');
      }

      return data.reply.trim();
    } catch (error) {
      console.error('Erro ao consultar agente IA', error);
      throw error;
    } finally {
      setIsAiLoading(false);
    }
  }

  function getAiErrorMessage(error: unknown) {
    const details = error instanceof Error ? error.message : 'Erro inesperado.';

    return `Nao consegui consultar a IA agora.\n\nDetalhes: ${details}`;
  }

  async function chooseAnswer(question: HortaQuestion, value: string, label: string) {
    const nextQuestion = initialQuestions[currentQuestionIndex + 1] ?? null;
    const nextProfileAnswers = { ...profileAnswers, [question.id]: label };

    let agentReply: string;

    try {
      agentReply = await askAgent({
        intent: 'perfil_inicial',
        userMessage: label,
        currentQuestion: question.pergunta,
        nextQuestion: nextQuestion?.pergunta,
        profile: nextProfileAnswers,
      });
    } catch (error) {
      appendMessages([
        {
          author: 'user',
          text: label,
        },
        {
          author: 'assistant',
          text: getAiErrorMessage(error),
        },
      ]);
      return;
    }

    setProfileAnswers(nextProfileAnswers);

    appendMessages([
      {
        author: 'user',
        text: label,
      },
      {
        author: 'assistant',
        text: agentReply,
      },
    ]);
    if (nextQuestion) {
      setCurrentQuestionIndex((current) => current + 1);
      return;
    }

    setCurrentQuestionIndex((current) => current + 1);
    setMode('menu');
  }

  async function askTips() {
    let agentReply: string;

    try {
      agentReply = await askAgent({
        intent: 'pedir_dicas',
        userMessage: 'Quero dicas para minha horta',
      });
    } catch (error) {
      agentReply = getAiErrorMessage(error);
    }

    appendMessages([
      {
        author: 'user',
        text: 'Quero dicas para minha horta',
      },
      {
        author: 'assistant',
        text: agentReply,
      },
    ]);
  }

  function askHelp() {
    appendMessages([
      {
        author: 'user',
        text: 'Preciso de ajuda',
      },
      {
        author: 'assistant',
        text:
          'Claro. Em qual etapa voce precisa de ajuda? Escolha uma opcao e eu te respondo com um passo a passo detalhado.',
      },
    ]);
    setMode('help');
  }

  async function chooseStage(stage: HelpStage) {
    let agentReply: string;

    try {
      agentReply = await askAgent({
        intent: `ajuda_${stage.id}`,
        userMessage: stage.userText,
      });
    } catch (error) {
      agentReply = getAiErrorMessage(error);
    }

    appendMessages([
      {
        author: 'user',
        text: stage.userText,
      },
      {
        author: 'assistant',
        text: agentReply,
      },
    ]);
    setMode('menu');
  }

  function restartFlow() {
    setMessages(startMessages);
    setCurrentQuestionIndex(0);
    setProfileAnswers({});
    setMode('profile');
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.brandGroup}>
          <Image source={require('@/assets/images/icon.png')} style={styles.avatar} />
          <Text style={[styles.brand, { color: colors.tint }]}>SeedUp</Text>
        </View>
        <Pressable style={styles.themeButton} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? 'moon-outline' : 'sunny-outline'}
            size={31}
            color={colors.tint}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={[styles.heroIcon, { backgroundColor: colors.tint }]}>
          <Ionicons name="hardware-chip-outline" size={36} color="#FFFFFF" />
        </View>

        <View style={styles.intro}>
          <Text style={[styles.introTitle, { color: colors.text }]}>
            Como posso ajudar sua horta hoje?
          </Text>
          <Text style={[styles.introText, { color: colors.muted }]}>
            Use perguntas prontas e responda com poucas palavras, sim ou nao.
          </Text>
        </View>

        <View style={styles.messageList}>
          {messages.map((message) => {
            const isUser = message.author === 'user';

            return (
              <View key={message.id} style={styles.messageBlock}>
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                    {
                      backgroundColor: isUser ? colors.tint : colors.surface,
                      borderColor: isUser ? colors.tint : colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: isUser ? '#FFFFFF' : colors.text },
                    ]}>
                    {message.text}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.meta,
                    isUser ? styles.userMeta : styles.assistantMeta,
                    { color: colors.subtle },
                  ]}>
                  {isUser ? 'Voce' : 'Assistente'} - {message.time}
                </Text>
              </View>
            );
          })}
          {isAiLoading ? (
            <View style={styles.messageBlock}>
              <View
                style={[
                  styles.bubble,
                  styles.assistantBubble,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <Text style={[styles.bubbleText, { color: colors.muted }]}>Pensando...</Text>
              </View>
              <Text style={[styles.meta, styles.assistantMeta, { color: colors.subtle }]}>
                Assistente - Agora
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.quickBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {actions.map((action) => {
            if (action.type === 'tips') {
              return (
                <Pressable
                  key="tips"
                  disabled={isAiLoading}
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.tint, opacity: isAiLoading ? 0.55 : 1 }]}
                  onPress={askTips}>
                  <Text style={[styles.chipText, { color: colors.tint }]}>Pedir dicas</Text>
                </Pressable>
              );
            }

            if (action.type === 'help') {
              return (
                <Pressable
                  key="help"
                  disabled={isAiLoading}
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.tint, opacity: isAiLoading ? 0.55 : 1 }]}
                  onPress={askHelp}>
                  <Text style={[styles.chipText, { color: colors.tint }]}>Pedir ajuda</Text>
                </Pressable>
              );
            }

            if (action.type === 'stage') {
              return (
                <Pressable
                  key={action.stage.id}
                  disabled={isAiLoading}
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.tint, opacity: isAiLoading ? 0.55 : 1 }]}
                  onPress={() => chooseStage(action.stage)}>
                  <Text style={[styles.chipText, { color: colors.tint }]}>{action.stage.label}</Text>
                </Pressable>
              );
            }

            if (action.type === 'restart') {
              return (
                <Pressable
                  key="restart"
                  style={[styles.chip, { backgroundColor: colors.tint, borderColor: colors.tint }]}
                  onPress={restartFlow}>
                  <Text style={[styles.chipText, { color: '#FFFFFF' }]}>Refazer perfil</Text>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={`${action.question.id}-${action.value}`}
                disabled={isAiLoading}
                style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.tint, opacity: isAiLoading ? 0.55 : 1 }]}
                onPress={() => chooseAnswer(action.question, action.value, action.label)}>
                <Text style={[styles.chipText, { color: colors.tint }]}>{action.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 24,
    paddingBottom: 13,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D6EBD5',
  },
  brand: {
    fontSize: 23,
    fontWeight: '800',
  },
  themeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 96,
    gap: 22,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    transform: [{ rotate: '4deg' }],
  },
  intro: {
    alignItems: 'center',
    gap: 12,
  },
  introTitle: {
    maxWidth: 300,
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  introText: {
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  messageList: {
    gap: 16,
  },
  messageBlock: {
    gap: 6,
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 17,
    lineHeight: 26,
  },
  meta: {
    fontSize: 12,
  },
  assistantMeta: {
    alignSelf: 'flex-start',
    paddingLeft: 4,
  },
  userMeta: {
    alignSelf: 'flex-end',
    paddingRight: 4,
  },
  quickBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 8,
  },
  chips: {
    gap: 10,
    paddingHorizontal: 26,
  },
  chip: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  questionChip: {
    width: 230,
    minHeight: 62,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 3,
  },
  questionTheme: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
