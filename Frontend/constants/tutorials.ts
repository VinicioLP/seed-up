export type Tutorial = {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  views: string;
  description: string;
  image: string;
  intro: string;
  materials: string[];
  steps: string[];
  tips: string[];
};

export const tutorialCategories = ['Todos', 'Horta', 'Irrigacao', 'Solo', 'Pragas'];

export const tutorials: Tutorial[] = [
  {
    id: 'hidroponia-iniciantes',
    title: 'Hidroponia para Iniciantes',
    category: 'Horta',
    level: 'Avancado',
    duration: '25 min',
    views: '2.4k views',
    description: 'Descubra como cultivar vegetais frescos sem solo, usando apenas agua e nutrientes.',
    image:
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=900&q=80',
    intro:
      'A hidroponia permite cultivar folhas e ervas em pouco espaco, com controle maior de agua e nutrientes.',
    materials: [
      'Recipiente limpo com tampa',
      'Mudas de folhas ou ervas',
      'Solucao nutritiva para hidroponia',
      'Argila expandida ou espuma fenolica',
      'Agua limpa',
    ],
    steps: [
      'Escolha uma planta de ciclo curto, como alface, manjericao ou rucula.',
      'Separe um recipiente limpo, uma tampa de suporte e uma solucao nutritiva propria para hidroponia.',
      'Mantenha as raizes em contato com a solucao, mas deixe espaco para oxigenacao.',
      'Coloque o sistema em local com boa luz indireta ou algumas horas de sol fraco.',
      'Troque ou complete a solucao quando o nivel baixar e observe a cor das folhas.',
    ],
    tips: [
      'Comece com poucas mudas para aprender o ritmo do sistema.',
      'Evite sol muito forte na agua para reduzir algas.',
      'Use recipientes escuros sempre que possivel.',
    ],
  },
  {
    id: 'horta-simples',
    title: 'Horta Simples',
    category: 'Horta',
    level: 'Iniciante',
    duration: '18 min',
    views: '1.8k views',
    description: 'Aprenda a escolher os vasos certos e o solo ideal para sua primeira horta.',
    image:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
    intro:
      'Uma horta simples funciona melhor quando comeca pequena, com especies resistentes e uma rotina facil.',
    materials: [
      'Vasos com furos',
      'Substrato leve',
      'Composto organico',
      'Mudas ou sementes de temperos',
      'Regador pequeno',
    ],
    steps: [
      'Escolha um local que receba luz por algumas horas ao dia.',
      'Use vasos com furos e um prato que possa ser esvaziado depois da rega.',
      'Preencha com substrato leve e misture um pouco de composto organico.',
      'Plante mudas de temperos faceis, como cebolinha, hortela ou manjericao.',
      'Regue quando os primeiros centimetros do solo estiverem secos.',
    ],
    tips: [
      'Nao plante muitas especies no mesmo vaso no inicio.',
      'Observe a horta por uma semana antes de adubar.',
      'Gire os vasos se a luz vier apenas de um lado.',
    ],
  },
  {
    id: 'irrigacao-correta',
    title: 'Irrigacao Correta',
    category: 'Irrigacao',
    level: 'Essencial',
    duration: '12 min',
    views: '3.1k views',
    description: 'Quanto e quando molhar? O guia definitivo para nao afogar suas plantas.',
    image:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    intro:
      'A rega correta depende do clima, vaso, solo e especie. O segredo e observar antes de molhar.',
    materials: [
      'Regador ou borrifador',
      'Palito de madeira',
      'Prato para vaso',
      'Agua em temperatura ambiente',
    ],
    steps: [
      'Toque o solo antes de regar, colocando o dedo 2 a 3 cm na terra.',
      'Se o dedo sair com terra grudada, espere mais um pouco.',
      'Regue devagar, em volta da planta, ate a agua sair pelos furos.',
      'Retire agua parada do prato para evitar raizes encharcadas.',
      'Ajuste a frequencia em dias muito quentes, frios ou chuvosos.',
    ],
    tips: [
      'Folhas amarelas podem indicar excesso de agua.',
      'Folhas murchas com solo seco indicam falta de agua.',
      'Vasos pequenos secam mais rapido.',
    ],
  },
  {
    id: 'solo-nutrientes',
    title: 'Solo e Nutrientes',
    category: 'Solo',
    level: 'Intermediario',
    duration: '20 min',
    views: '950 views',
    description: 'Entenda os segredos da compostagem e como alimentar suas plantas.',
    image:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80',
    intro:
      'Um solo saudavel segura umidade na medida certa, permite respiracao das raizes e fornece nutrientes.',
    materials: [
      'Substrato ou terra vegetal',
      'Composto organico bem curtido',
      'Folhas secas ou palha',
      'Pazinha de jardinagem',
      'Vaso com drenagem',
    ],
    steps: [
      'Use uma mistura leve, sem compactar demais o vaso.',
      'Adicione composto organico bem curtido em pequenas quantidades.',
      'Evite exagerar no adubo, principalmente em mudas jovens.',
      'Cubra o solo com folhas secas ou palha para reduzir perda de umidade.',
      'Renove parte do substrato quando a planta perder vigor.',
    ],
    tips: [
      'Cheiro ruim pode indicar excesso de umidade.',
      'Terra muito dura dificulta o crescimento das raizes.',
      'Adubo em excesso pode queimar folhas.',
    ],
  },
];
