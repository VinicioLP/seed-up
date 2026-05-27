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
  respostas_personalizadas?: Record<string, { mensagem?: string; acao_sugerida?: string }>;
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
  answer: string;
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
    answer:
      'Claro. Passo a passo para planejar sua horta:\n\n1. Escolha o local com mais luz disponivel. O ideal e observar por um dia e contar quantas horas de sol chegam ali.\n2. Defina o tamanho. Comece pequeno: 1 vaso, 1 jardineira ou um canto de canteiro.\n3. Escolha plantas compativeis com sua rotina. Se voce tem pouco tempo, prefira temperos resistentes como cebolinha, hortela, alecrim ou manjericao.\n4. Separe os materiais: recipiente com furos, substrato leve, composto organico e uma pazinha.\n5. Planeje a rega. Antes de plantar, decida quando voce consegue verificar o solo durante a semana.\n6. Comece com poucas especies. Depois que entender luz e rega do local, aumente a variedade.',
  },
  {
    id: 'plantio',
    label: 'Plantio',
    userText: 'Preciso de ajuda no plantio',
    answer:
      'Vamos plantar com calma:\n\n1. Confira se o vaso tem furos no fundo. Sem drenagem, a raiz pode apodrecer.\n2. Coloque uma camada leve de drenagem se tiver argila expandida ou pedras pequenas.\n3. Preencha com substrato solto e nutritivo, sem compactar demais.\n4. Abra uma cova pequena, coloque a muda ou semente e cubra com terra fina.\n5. Regue devagar na primeira vez, apenas ate o solo ficar umido.\n6. Deixe a planta em local protegido no primeiro dia, principalmente se ela veio de viveiro.\n7. Nos proximos dias, observe folhas murchas, solo seco ou excesso de agua no prato.',
  },
  {
    id: 'rega',
    label: 'Rega',
    userText: 'Preciso de ajuda com rega',
    answer:
      'Passo a passo para acertar a rega:\n\n1. Toque o solo antes de regar. Coloque o dedo 2 a 3 cm na terra.\n2. Se sair com terra grudada, espere mais. Se sair quase limpo, pode regar.\n3. Regue devagar, em volta da planta, ate a agua comecar a sair por baixo.\n4. Nunca deixe agua parada no pratinho por muito tempo.\n5. Em dias quentes, verifique mais vezes; em dias frios ou chuvosos, reduza.\n6. Se as folhas amarelam e o solo vive molhado, provavelmente ha excesso.\n7. Se as folhas murcham e o solo esta seco, aumente um pouco a frequencia.',
  },
  {
    id: 'pragas',
    label: 'Pragas',
    userText: 'Preciso de ajuda com pragas',
    answer:
      'Vamos lidar com pragas sem exagero:\n\n1. Isole a planta afetada para evitar que o problema passe para outras.\n2. Observe embaixo das folhas, nos brotos e perto do caule.\n3. Remova insetos visiveis com pano umido ou jato leve de agua.\n4. Corte folhas muito comprometidas, mas evite podar demais de uma vez.\n5. Melhore ventilacao e evite excesso de umidade parada.\n6. Acompanhe por 3 dias. Se voltar rapido, repita a limpeza.\n7. So use produtos quando identificar melhor a praga e sempre com cuidado nas plantas comestiveis.',
  },
  {
    id: 'colheita',
    label: 'Colheita',
    userText: 'Preciso de ajuda na colheita',
    answer:
      'Passo a passo para colher sem enfraquecer a planta:\n\n1. Colha pela manha ou no fim da tarde, quando a planta esta menos estressada.\n2. Use tesoura limpa ou os dedos com cuidado, sem puxar a raiz.\n3. Em temperos, retire folhas externas e deixe o centro crescer.\n4. Evite colher mais de um terco da planta de uma vez.\n5. Depois da colheita, observe se a planta continua firme e hidratada.\n6. Se a planta florir e voce quer folhas, pode retirar algumas flores para prolongar a producao.\n7. Mantenha rega e luz estaveis depois da colheita.',
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

function makeAssistantAnswer(question: HortaQuestion, value: string) {
  const personalized = question.respostas_personalizadas?.[value]?.mensagem;
  const fallback =
    'Entendi. Vou usar essa resposta para deixar a recomendacao mais adequada para sua horta.';

  return personalized ?? fallback;
}

export default function ChatIa() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [messages, setMessages] = useState<Message[]>(startMessages);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mode, setMode] = useState<ChatMode>('profile');
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

  function chooseAnswer(question: HortaQuestion, value: string, label: string) {
    const nextQuestion = initialQuestions[currentQuestionIndex + 1] ?? null;
    const answerText = makeAssistantAnswer(question, value);

    appendMessages([
      {
        author: 'user',
        text: label,
      },
      {
        author: 'assistant',
        text: nextQuestion
          ? `${answerText}\n\n${nextQuestion.pergunta}`
          : `${answerText}\n\nPronto. Com esse perfil eu ja consigo adaptar melhor as proximas recomendacoes para sua horta.`,
      },
    ]);
    if (nextQuestion) {
      setCurrentQuestionIndex((current) => current + 1);
      return;
    }

    setCurrentQuestionIndex((current) => current + 1);
    setMode('menu');
  }

  function askTips() {
    appendMessages([
      {
        author: 'user',
        text: 'Quero dicas para minha horta',
      },
      {
        author: 'assistant',
        text:
          'Com base no seu perfil, aqui vao dicas praticas:\n\n1. Mantenha uma rotina simples: observe solo e folhas antes de qualquer mudanca.\n2. Regue apenas quando o solo indicar necessidade. Isso evita excesso de agua.\n3. Escolha poucas plantas no comeco e acompanhe como elas reagem ao local.\n4. Prefira ajustes pequenos: mudar luz, rega e adubo tudo ao mesmo tempo dificulta entender o que funcionou.\n5. Tire uma foto da horta uma vez por semana. Isso ajuda a perceber crescimento, manchas ou sinais de pragas.',
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

  function chooseStage(stage: HelpStage) {
    appendMessages([
      {
        author: 'user',
        text: stage.userText,
      },
      {
        author: 'assistant',
        text: stage.answer,
      },
    ]);
    setMode('menu');
  }

  function restartFlow() {
    setMessages(startMessages);
    setCurrentQuestionIndex(0);
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
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.tint }]}
                  onPress={askTips}>
                  <Text style={[styles.chipText, { color: colors.tint }]}>Pedir dicas</Text>
                </Pressable>
              );
            }

            if (action.type === 'help') {
              return (
                <Pressable
                  key="help"
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.tint }]}
                  onPress={askHelp}>
                  <Text style={[styles.chipText, { color: colors.tint }]}>Pedir ajuda</Text>
                </Pressable>
              );
            }

            if (action.type === 'stage') {
              return (
                <Pressable
                  key={action.stage.id}
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.tint }]}
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
                style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.tint }]}
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
