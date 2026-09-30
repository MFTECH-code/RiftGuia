export const TERMS = [
  {
    en: 'Draw',
    pt: 'Comprar carta',
    group: 'Comece por aqui',
    body: 'Pegue a carta do topo do seu baralho principal e coloque na sua mão. Comprar é o nome dessa ação no jogo.',
    example: 'Draw 1: pegue uma carta. Ela fica na sua mão até você jogar, descartar ou outro efeito mover essa carta.',
  },
  {
    en: 'Discard',
    pt: 'Descartar carta',
    group: 'Comece por aqui',
    body: 'Mova uma carta da sua mão para a pilha de descarte, chamada Trash. Alguns efeitos pedem isso como custo; outros recompensam você por descartar.',
    example: 'Se você tem quatro cartas na mão e descarta uma, fica com três. Leia o efeito para saber quem escolhe a carta.',
  },
  {
    en: 'Unit',
    pt: 'Unidade',
    group: 'As peças do jogo',
    body: 'Uma peça que fica na mesa para lutar e disputar campos. Campeões também são unidades.',
    example: 'Você joga uma unidade para colocá-la na mesa. Depois, ela pode disputar campos conforme as regras de movimento e combate.',
  },
  {
    en: 'Spell',
    pt: 'Feitiço',
    group: 'As peças do jogo',
    body: 'Uma carta que executa suas instruções e depois segue o destino indicado pelas regras. Pode causar dano, ajudar uma unidade ou comprar cartas.',
    example: 'Um feitiço que dá força a uma unidade por um turno ajuda naquele período. Leia a duração para saber quando o bônus acaba.',
  },
  {
    en: 'Battlefield',
    pt: 'Campo de batalha',
    group: 'As peças do jogo',
    body: 'Uma localização disputada pelos jogadores. Suas unidades vão até ela para tentar conquistá-la ou defendê-la.',
    example: 'Você pode enviar unidades para disputar um campo ocupado pelo adversário. Ter força e usar efeitos ajuda a vencer.',
  },
  {
    en: 'Might',
    pt: 'Força',
    group: 'As peças do jogo',
    body: 'O número que representa a capacidade de combate de uma unidade. Efeitos podem aumentar ou reduzir esse valor.',
    example: 'Uma unidade de força 3 que recebe +2 fica com força 5 enquanto o bônus estiver ativo.',
  },
  {
    en: 'Ready',
    pt: 'Pronto / preparar',
    group: 'Usando suas cartas',
    body: 'Uma carta pronta fica vertical. Preparar significa colocá-la nessa posição.',
    example: 'Depois de preparar uma runa, você pode exauri-la para obter energia se a regra permitir naquele momento.',
  },
  {
    en: 'Exhaust',
    pt: 'Exaurir',
    group: 'Usando suas cartas',
    body: 'Vire a carta de lado para indicar que ela foi usada para pagar um custo ou executar uma ação.',
    example: 'Para gerar energia com uma runa pronta, vire-a de lado. Ela continua na mesa.',
  },
  {
    en: 'Recycle',
    pt: 'Reciclar',
    group: 'Usando suas cartas',
    body: 'Coloque a carta no fundo do baralho correspondente, virada para baixo.',
    example: 'Ao reciclar uma runa para gerar poder, você tira essa runa da mesa e a coloca no fundo do baralho de runas.',
  },
  {
    en: 'Empower',
    pt: 'Potencializar',
    group: 'Palavras-chave',
    body: 'Permite pagar o custo indicado para deixar a carta Empowered. O estado sozinho não aumenta a força; leia a habilidade ligada a ele.',
    example: 'Depois de potencializar, aplique o trecho marcado como Empowered na carta.',
  },
  {
    en: 'Flow',
    pt: 'Fluxo',
    group: 'Palavras-chave',
    body: 'Permite jogar um feitiço do descarte pagando o custo de Flow. Depois, o feitiço costuma ser banido.',
    example: 'Um feitiço com Flow no descarte pode ser usado novamente se você pagar o custo indicado.',
  },
  {
    en: 'Burn',
    pt: 'Queimar cartas',
    group: 'Palavras-chave',
    body: 'Burn X manda colocar X cartas do topo do baralho principal no descarte. Não representa dano.',
    example: 'Burn 2: mova as duas cartas do topo para o descarte. Elas não passam pela sua mão.',
  },
  {
    en: 'Copy',
    pt: 'Copiar',
    group: 'Palavras-chave',
    body: 'O efeito usa as características copiáveis do objeto indicado. Leia o texto para saber o que vira cópia e por quanto tempo.',
    example: 'Copiar uma unidade potencializada não transfere automaticamente o estado Empowered.',
  },
  {
    en: 'Token Unit',
    pt: 'Unidade-ficha',
    group: 'Palavras-chave',
    body: 'Uma unidade produzida por um efeito durante a partida. Ela tem as características informadas pela carta ou ficha.',
    example: 'Uma Sprite e uma ficha com suas próprias características. Confira se ela possui Temporary.',
  },
  {
    en: 'Temporary',
    pt: 'Temporário',
    group: 'Palavras-chave',
    body: 'Essa habilidade manda abater o objeto no início da fase Beginning de seu controlador, antes de certas etapas de pontuação.',
    example: 'Não conte com uma unidade Temporary para permanecer no campo nesse início de turno, salvo se outro efeito mudar isso.',
  },
] as const;

export const GUIDE_SOURCE = 'https://playriftbound.com/en-us/news/rules-and-releases/deckbuilding-primer/';

export const DECK_GUIDES = [
  {
    id: 'jinx',
    name: 'Jinx - pressão e descarte',
    text: 'Desenvolva ameaças e transforme descartes em custos úteis. A compra da lenda recompensa a mão quase vazia; busque pressão sobre os campos sem gastar cartas sem propósito.',
  },
  {
    id: 'viktor',
    name: 'Viktor - muitas unidades',
    text: 'Construa um grupo de unidades pequenas e Recrutas para disputar campos. Siphon Power pode transformar vantagem numérica em vantagem no combate.',
  },
  {
    id: 'lee-centered',
    name: 'Lee Sin, Centered - fortalecer o grupo',
    text: 'Distribua buffs para fortalecer várias unidades. Centered recompensa o grupo fortalecido; cartas de apoio ajudam a ganhar combates.',
  },
  {
    id: 'lee-ascetic',
    name: 'Lee Sin, Ascetic - ameaça concentrada',
    text: 'Concentre buffs em Ascetic para criar uma ameaça grande. A escolha do campeão altera o plano: aqui, a lenda tende a fortalecer essa unidade.',
  },
] as const;
