import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-context';
import { apiFetch } from '@/lib/api';

type Message = {
  id: number;
  author: 'assistant' | 'user';
  text: string;
  time: string;
};

type MessageDraft = Omit<Message, 'id' | 'time'>;

type AgentRequest = {
  intent: string;
  userMessage?: string;
  history: Message[];
};

type AgentResponse = {
  reply?: string;
  quickReplies?: string[];
};

const maxHistoryMessages = 10;

function normalizeQuickReplies(replies?: string[]) {
  if (!Array.isArray(replies)) {
    return [];
  }

  return replies
    .filter((reply) => typeof reply === 'string' && reply.trim().length > 0)
    .map((reply) => reply.trim())
    .slice(0, 4);
}

function serializeHistory(history: Message[]) {
  return history.slice(-maxHistoryMessages).map(({ author, text }) => ({ author, text }));
}

export default function ChatIa() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const nextMessageId = useRef(1);
  const hasStarted = useRef(false);
  const lastRequest = useRef<AgentRequest | null>(null);

  const makeMessages = useCallback((nextMessages: MessageDraft[]) => {
    return nextMessages.map((message) => ({
      ...message,
      id: nextMessageId.current++,
      time: 'Agora',
    }));
  }, []);

  const appendMessages = useCallback(
    (nextMessages: MessageDraft[]) => {
      const preparedMessages = makeMessages(nextMessages);

      setMessages((current) => [...current, ...preparedMessages]);

      return preparedMessages;
    },
    [makeMessages]
  );

  const getAiErrorMessage = useCallback((error: unknown) => {
    const details = error instanceof Error ? error.message : 'Erro inesperado.';

    return `Nao consegui consultar a IA agora.\n\nDetalhes: ${details}`;
  }, []);

  const askAgent = useCallback(async (request: AgentRequest) => {
    try {
      setIsAiLoading(true);
      lastRequest.current = request;

      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          intent: request.intent,
          userMessage: request.userMessage,
          history: serializeHistory(request.history),
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

      const data = (await response.json()) as AgentResponse;
      const reply = data.reply?.trim();
      const agentQuickReplies = normalizeQuickReplies(data.quickReplies);

      if (!reply || agentQuickReplies.length === 0) {
        throw new Error('A IA retornou uma resposta incompleta.');
      }

      return {
        reply,
        quickReplies: agentQuickReplies,
      };
    } catch (error) {
      console.error('Erro ao consultar agente IA', error);
      throw error;
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const runAgentRequest = useCallback(
    async (request: AgentRequest) => {
      try {
        const agentResponse = await askAgent(request);

        appendMessages([
          {
            author: 'assistant',
            text: agentResponse.reply,
          },
        ]);
        setQuickReplies(agentResponse.quickReplies);
      } catch (error) {
        appendMessages([
          {
            author: 'assistant',
            text: getAiErrorMessage(error),
          },
        ]);
        setQuickReplies([]);
      }
    },
    [appendMessages, askAgent, getAiErrorMessage]
  );

  const startConversation = useCallback(async () => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    setQuickReplies([]);

    await runAgentRequest({
      intent: 'start',
      userMessage: 'Iniciar conversa',
      history: [],
    });
  }, [runAgentRequest]);

  useEffect(() => {
    void startConversation();
  }, [startConversation]);

  const sendQuickReply = useCallback(
    async (reply: string) => {
      const userMessages = makeMessages([
        {
          author: 'user',
          text: reply,
        },
      ]);
      const nextHistory = [...messages, ...userMessages];

      setMessages((current) => [...current, ...userMessages]);
      setQuickReplies([]);

      await runAgentRequest({
        intent: 'conversation',
        userMessage: reply,
        history: nextHistory,
      });
    },
    [makeMessages, messages, runAgentRequest]
  );

  const retryLastRequest = useCallback(async () => {
    const request = lastRequest.current;

    if (!request) {
      hasStarted.current = false;
      nextMessageId.current = 1;
      setMessages([]);
      setQuickReplies([]);
      await startConversation();
      return;
    }

    setQuickReplies([]);
    await runAgentRequest(request);
  }, [runAgentRequest, startConversation]);

  const showRetryButton = !isAiLoading && quickReplies.length === 0 && lastRequest.current;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.brandGroup}>
          <Pressable onPress={() => router.push('/profile')}>
            <Image
              source={user?.profilePhotoUri ? { uri: user.profilePhotoUri } : require('@/assets/images/icon.png')}
              style={styles.avatar}
              contentFit="cover"
            />
          </Pressable>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.heroIcon, { backgroundColor: colors.tint }]}>
          <Ionicons name="hardware-chip-outline" size={36} color="#FFFFFF" />
        </View>

        <View style={styles.intro}>
          <Text style={[styles.introTitle, { color: colors.text }]}>
            Como posso ajudar sua horta hoje?
          </Text>
          <Text style={[styles.introText, { color: colors.muted }]}>
            A IA cria as perguntas e opcoes conforme a conversa avanca.
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {quickReplies.map((reply, index) => (
            <Pressable
              key={`${reply}-${index}`}
              disabled={isAiLoading}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.tint,
                  opacity: isAiLoading ? 0.55 : 1,
                },
              ]}
              onPress={() => sendQuickReply(reply)}>
              <Text style={[styles.chipText, { color: colors.tint }]}>{reply}</Text>
            </Pressable>
          ))}

          {showRetryButton ? (
            <Pressable
              style={[styles.chip, { backgroundColor: colors.tint, borderColor: colors.tint }]}
              onPress={retryLastRequest}>
              <Text style={[styles.chipText, { color: '#FFFFFF' }]}>Tentar novamente</Text>
            </Pressable>
          ) : null}
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
    paddingBottom: 108,
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
  chipText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
