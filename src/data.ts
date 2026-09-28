export const TERMS = [
  {
    en: 'Draw',
    pt: 'Comprar carta',
    group: 'Comece por aqui',
    body: 'Pegue a carta do topo do seu baralho principal e coloque na sua mao. Comprar e o nome dessa acao no jogo.',
    example: 'Draw 1: pegue uma carta. Ela fica na sua mao ate voce jogar, descartar ou outro efeito mover essa carta.',
  },
  {
    en: 'Discard',
    pt: 'Descartar carta',
    group: 'Comece por aqui',
    body: 'Mova uma carta da sua mao para a pilha de descarte, chamada Trash. Alguns efeitos pedem isso como custo; outros recompensam voce por descartar.',
    example: 'Se voce tem quatro cartas na mao e descarta uma, fica com tres. Leia o efeito para saber quem escolhe a carta.',
  },
  {
    en: 'Unit',
    pt: 'Unidade',
    group: 'As pecas do jogo',
    body: 'Uma peca que fica na mesa para lutar e disputar campos. Campeoes tambem sao unidades.',
    example: 'Voce joga uma unidade para coloca-la na mesa. Depois, ela pode disputar campos conforme as regras de movimento e combate.',
  },
  {
    en: 'Spell',
    pt: 'Feitico',
    group: 'As pecas do jogo',
    body: 'Uma carta que executa suas instrucoes e depois segue o destino indicado pelas regras. Pode causar dano, ajudar uma unidade ou comprar cartas.',
    example: 'Um feitico que da forca a uma unidade por um turno ajuda naquele periodo. Leia a duracao para saber quando o bonus acaba.',
  },
  {
    en: 'Battlefield',
    pt: 'Campo de batalha',
    group: 'As pecas do jogo',
    body: 'Uma localizacao disputada pelos jogadores. Suas unidades vao ate ela para tentar conquista-la ou defende-la.',
    example: 'Voce pode enviar unidades para disputar um campo ocupado pelo adversario. Ter forca e usar efeitos ajuda a vencer.',
  },
  {
    en: 'Might',
    pt: 'Forca',
    group: 'As pecas do jogo',
    body: 'O numero que representa a capacidade de combate de uma unidade. Efeitos podem aumentar ou reduzir esse valor.',
    example: 'Uma unidade de forca 3 que recebe +2 fica com forca 5 enquanto o bonus estiver ativo.',
  },
  {
    en: 'Ready',
    pt: 'Pronto / preparar',
    group: 'Usando suas cartas',
    body: 'Uma carta pronta fica vertical. Preparar significa coloca-la nessa posicao.',
    example: 'Depois de preparar uma runa, voce pode exauri-la para obter energia se a regra permitir naquele momento.',
  },
  {
    en: 'Exhaust',
    pt: 'Exaurir',
    group: 'Usando suas cartas',
    body: 'Vire a carta de lado para indicar que ela foi usada para pagar um custo ou executar uma acao.',
    example: 'Para gerar energia com uma runa pronta, vire-a de lado. Ela continua na mesa.',
  },
  {
    en: 'Recycle',
    pt: 'Reciclar',
    group: 'Usando suas cartas',
    body: 'Coloque a carta no fundo do baralho correspondente, virada para baixo.',
    example: 'Ao reciclar uma runa para gerar poder, voce tira essa runa da mesa e a coloca no fundo do baralho de runas.',
  },
  {
    en: 'Empower',
    pt: 'Potencializar',
    group: 'Palavras-chave',
    body: 'Permite pagar o custo indicado para deixar a carta Empowered. O estado sozinho nao aumenta a forca; leia a habilidade ligada a ele.',
    example: 'Depois de potencializar, aplique o trecho marcado como Empowered na carta.',
  },
  {
    en: 'Flow',
    pt: 'Fluxo',
    group: 'Palavras-chave',
    body: 'Permite jogar um feitico do descarte pagando o custo de Flow. Depois, o feitico costuma ser banido.',
    example: 'Um feitico com Flow no descarte pode ser usado novamente se voce pagar o custo indicado.',
  },
  {
    en: 'Burn',
    pt: 'Queimar cartas',
    group: 'Palavras-chave',
    body: 'Burn X manda colocar X cartas do topo do baralho principal no descarte. Nao representa dano.',
    example: 'Burn 2: mova as duas cartas do topo para o descarte. Elas nao passam pela sua mao.',
  },
  {
    en: 'Copy',
    pt: 'Copiar',
    group: 'Palavras-chave',
    body: 'O efeito usa as caracteristicas copiaveis do objeto indicado. Leia o texto para saber o que vira copia e por quanto tempo.',
    example: 'Copiar uma unidade potencializada nao transfere automaticamente o estado Empowered.',
  },
  {
    en: 'Token Unit',
    pt: 'Unidade-ficha',
    group: 'Palavras-chave',
    body: 'Uma unidade produzida por um efeito durante a partida. Ela tem as caracteristicas informadas pela carta ou ficha.',
    example: 'Uma Sprite e uma ficha com suas proprias caracteristicas. Confira se ela possui Temporary.',
  },
  {
    en: 'Temporary',
    pt: 'Temporario',
    group: 'Palavras-chave',
    body: 'Essa habilidade manda abater o objeto no inicio da fase Beginning de seu controlador, antes de certas etapas de pontuacao.',
    example: 'Nao conte com uma unidade Temporary para permanecer no campo nesse inicio de turno, salvo se outro efeito mudar isso.',
  },
] as const;

export const GUIDE_SOURCE = 'https://playriftbound.com/en-us/news/rules-and-releases/deckbuilding-primer/';

export const DECK_GUIDES = [
  {
    id: 'jinx',
    name: 'Jinx - pressao e descarte',
    text: 'Desenvolva ameacas e transforme descartes em custos uteis. A compra da lenda recompensa a mao quase vazia; busque pressao sobre os campos sem gastar cartas sem proposito.',
  },
  {
    id: 'viktor',
    name: 'Viktor - muitas unidades',
    text: 'Construa um grupo de unidades pequenas e Recrutas para disputar campos. Siphon Power pode transformar vantagem numerica em vantagem no combate.',
  },
  {
    id: 'lee-centered',
    name: 'Lee Sin, Centered - fortalecer o grupo',
    text: 'Distribua buffs para fortalecer varias unidades. Centered recompensa o grupo fortalecido; cartas de apoio ajudam a ganhar combates.',
  },
  {
    id: 'lee-ascetic',
    name: 'Lee Sin, Ascetic - ameaca concentrada',
    text: 'Concentre buffs em Ascetic para criar uma ameaca grande. A escolha do campeao altera o plano: aqui, a lenda tende a fortalecer essa unidade.',
  },
] as const;
