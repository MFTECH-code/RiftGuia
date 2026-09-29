import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const cardsPath = resolve(root, 'public/data/cards.json');
const translationsPath = resolve(root, 'public/data/translations.pt-BR.json');
const outputPath = resolve(root, 'public/data/legend-suggestions.pt-BR.json');

const snapshot = JSON.parse(await readFile(cardsPath, 'utf8'));
const translations = JSON.parse(await readFile(translationsPath, 'utf8')).translations || {};

const cosmeticSuffix = /\s+\((Metal|Overnumbered|Signature|Starter|Alternate Art|Foil|Numericamente Superior|Supernumer[aá]rio|Assinatura|Inicial|Arte Alternativa)\)$/gi;
const aliasNames = new Map([
  ['Butcher of the Sands', 'Renekton - Butcher of the Sands'],
  ['Curator of the Sands', 'Nasus - Curator of the Sands'],
  ['Defender of Tomorrow', 'Jayce - Defender of Tomorrow'],
  ['Eye of Twilight', 'Shen - Eye of Twilight'],
  ['Heart of the Tempest', 'Kennen - Heart of the Tempest'],
  ['Matriarch of War', 'Ambessa - Matriarch of War'],
  ['Master of Shadows', 'Zed - Master of Shadows'],
  ['Rogue Assassin', 'Akali - Rogue Assassin'],
  ["Soul's Reflection", "Mel - Soul's Reflection"],
  ['Yordle, Kennen - Heart of the Tempest', 'Kennen - Heart of the Tempest'],
]);

function baseName(name) {
  const cleaned = String(name).replace(cosmeticSuffix, '').trim();
  return aliasNames.get(cleaned) || cleaned;
}

function cleanTranslation(value) {
  return String(value || '').replace(cosmeticSuffix, '').trim();
}

function legendTranslation(canonicalName, translatedName) {
  const translated = cleanTranslation(translatedName);
  const champion = canonicalName.split(/\s+-\s+/)[0]?.trim();
  if (!translated || !champion || !canonicalName.includes(' - ')) return translated || canonicalName;
  return translated.toLowerCase().startsWith(champion.toLowerCase()) ? translated : `${champion} - ${translated}`;
}

function tip(archetype, gamePlan, mulligan, synergyPackages, deckbuildingTips, weakness) {
  return { archetype, gamePlan, mulligan, synergyPackages, deckbuildingTips, weakness };
}

function battlefield(name, reason, source = 'Heuristica por plano de jogo + texto do battlefield') {
  return { name, reason, source };
}

const riftAtlasSource = 'RiftAtlas meta decklists pesquisadas';

const battlefieldRecommendations = new Map(Object.entries({
  'Ahri - Nine-Tailed Fox': [
    battlefield('Grove of the God-Willow', 'Recompensa segurar campo, exatamente o plano defensivo de Ahri.', riftAtlasSource),
    battlefield('Ravenbloom Conservatory', 'Valor ao defender com spells, comum em listas Mind/Calm de controle.', riftAtlasSource),
    battlefield('Startipped Peak', 'Ajuda a manter recursos para respostas depois de segurar campo.', riftAtlasSource),
  ],
  'Akali - Rogue Assassin': [
    battlefield("Ripper's Bay", 'Premia retorno de unidades para a mao, combinando com Retreat e reposicionamento.'),
    battlefield('Back-Alley Bar', 'Transforma movimento em bonus de Might para viradas de tempo.'),
    battlefield('Star Spring', 'Permite reposicionar outra unidade para a base quando uma unidade entra aqui.'),
  ],
  'Ambessa - Matriarch of War': [
    battlefield('Risen Altar', 'Reduz custos de Empower e acelera a condicao principal da lenda.'),
    battlefield('Valley of Idols', 'Buff permanente ajuda a criar unidades que valem preparar de novo.'),
    battlefield('Trifarian War Camp', 'Aumenta Might e melhora turnos com ataques repetidos.'),
  ],
  'Annie - Dark Child': [
    battlefield("Targon's Peak", 'Deixa runas prontas depois de conquistar, reforcando turnos de spells.'),
    battlefield('The Academy', 'Recompensa segurar campo com Repeat em spells.'),
    battlefield('Ravenbloom Conservatory', 'Ajuda decks de spells a transformar defesa em compra.'),
  ],
  'Azir - Emperor of the Sands': [
    battlefield("Ornn's Forge", 'Reduz equipamentos nao-ficha e aparece em listas competitivas de Azir.', riftAtlasSource),
    battlefield('Trifarian War Camp', 'Faz fichas e unidades equipadas atacarem melhor.', riftAtlasSource),
    battlefield("Vilemaw's Lair", 'Prende unidades no campo e favorece investimento em equipamento.', riftAtlasSource),
  ],
  'Darius - Hand of Noxus': [
    battlefield('Trifarian War Camp', 'Aumenta Might e melhora o plano Legion de combate.'),
    battlefield("The Arena's Greatest", 'Acelera a corrida de pontos para decks agressivos.'),
    battlefield("Reckoner's Arena", 'Reativa efeitos de conquista de unidades em campo de combate.'),
  ],
  'Diana - Scorn of the Moon': [
    battlefield('Abandoned Hall', 'Aparece repetidamente em listas de Diana como campo flexivel de spells.', riftAtlasSource),
    battlefield('Ravenbloom Conservatory', 'Premia defesa revelando spells, comum no shell Mind/Chaos.', riftAtlasSource),
    battlefield("Targon's Peak", 'Recupera runas apos conquista e sustenta turnos reativos.', riftAtlasSource),
  ],
  'Draven - Glorious Executioner': [
    battlefield('Minefield', 'Alimenta descarte/lixo e aparece em lista Draven meta.', riftAtlasSource),
    battlefield("Targon's Peak", 'Mantem recursos apos conquistar em turnos agressivos.', riftAtlasSource),
    battlefield('Zaun Warrens', 'Descarta e compra, melhorando maos agressivas.', riftAtlasSource),
  ],
  'Ezreal - Prodigal Explorer': [
    battlefield('Ravenbloom Conservatory', 'Valor ao defender com spells e manter respostas na mao.'),
    battlefield('Void Gate', 'Aumenta dano de spells/habilidades que afetam unidades no campo.'),
    battlefield('The Candlelit Sanctum', 'Filtra topo em conquistas e ajuda a achar interacoes.'),
  ],
  'Fiora - Grand Duelist': [
    battlefield('Sunken Temple', 'Compra ao conquistar com unidades Mighty.'),
    battlefield('Valley of Idols', 'Buff permanente ajuda unidades a chegarem a 5+ Might.'),
    battlefield('Trifarian War Camp', 'Might extra simplifica conquistas com unidades grandes.'),
  ],
  'Garen - Might of Demacia': [
    battlefield('Altar to Unity', 'Gera Recruit e reforca plano de mesa larga.'),
    battlefield('The Grand Plaza', 'Conecta diretamente com ter muitas unidades no mesmo campo.'),
    battlefield('Seat of Power', 'Compra por outros campos controlados, bom para decks go-wide.'),
  ],
  'Irelia - Blade Dancer': [
    battlefield("Aspirant's Climb", 'Usado em lista meta e alonga jogo para engines de tempo.', riftAtlasSource),
    battlefield('The Dreaming Tree', 'Compra quando spells escolhem unidades amigas.', riftAtlasSource),
    battlefield('Ravenbloom Conservatory', 'Ajuda a encontrar spells enquanto defende.', riftAtlasSource),
  ],
  'Ivern - Green Father': [
    battlefield('Grove of the God-Willow', 'Recompensa hold, plano natural de controle de campos.'),
    battlefield('Altar to Unity', 'Cria unidade para aproveitar buffs de campo.'),
    battlefield('Fortified Position', 'Facilita segurar campo com unidades defensivas.'),
  ],
  'Jax - Grandmaster At Arms': [
    battlefield('Forge of the Fluft', 'Permite anexar equipamentos usando a lenda.'),
    battlefield('Veiled Temple', 'Deixa equipamento pronto ao conquistar.'),
    battlefield('Piltovan Forge', 'Reduz primeira habilidade ativada de equipamento ao controlar.'),
  ],
  'Jayce - Defender of Tomorrow': [
    battlefield('Piltovan Forge', 'Melhora habilidades ativadas de equipamentos, o motor de Jayce.'),
    battlefield('Veiled Temple', 'Prepara equipamentos em conquistas.'),
    battlefield("Ornn's Forge", 'Reduz o primeiro equipamento nao-ficha do turno.'),
  ],
  'Jhin - Virtuoso': [
    battlefield('The Academy', 'Dobra spells em decks que querem jogar magias relevantes.'),
    battlefield('Forgotten Library', 'Premia spells de custo 4+ com Predict.'),
    battlefield("Targon's Peak", 'Ajuda a recuperar runas apos conquistar com spells caros.'),
  ],
  'Jinx - Loose Cannon': [
    battlefield('Zaun Warrens', 'Descarta e compra, apoiando maos vazias e descarte.', riftAtlasSource),
    battlefield('Minefield', 'Coloca cartas no lixo e aumenta combustivel de estrategias agressivas.', riftAtlasSource),
    battlefield("The Arena's Greatest", 'Acelera a corrida de pontos para aggro.', riftAtlasSource),
  ],
  "Kai'Sa - Daughter of the Void": [
    battlefield('Amateur Recital', 'Usado em listas Kai’Sa e ajuda reposicionamento defensivo.', riftAtlasSource),
    battlefield('Startipped Peak', 'Canaliza runa exaurida ao controlar e sustenta spells.', riftAtlasSource),
    battlefield('Void Gate', 'Amplifica efeitos que causam dano a unidades.', riftAtlasSource),
  ],
  'Kennen - Heart of the Tempest': [
    battlefield('Bandle Tree', 'Usado em lista meta e favorece cartas escondidas/linhas alternativas.', riftAtlasSource),
    battlefield('The Candlelit Sanctum', 'Filtra topo apos conquistas para achar pecas de combo.', riftAtlasSource),
    battlefield('Zaun Warrens', 'Descarta/compra para encontrar ativadores e payoffs.', riftAtlasSource),
  ],
  "Kha'Zix - Voidreaver": [
    battlefield('Gardens of Becoming', 'XP adicional combina com plano de crescimento por combate.'),
    battlefield('Trapping Grounds', 'Recompensa dano excedente e combate favoravel.'),
    battlefield("Reckoner's Arena", 'Reativa efeitos de conquista de unidades que vencem duelos.'),
  ],
  'LeBlanc - Deceiver': [
    battlefield('Dusk Rose Lab', 'Sacrifica unidade para comprar e aparece em listas LeBlanc.', riftAtlasSource),
    battlefield('Forbidding Waste', 'Altera lutas de unidades sozinhas e cria bons alvos de copia.', riftAtlasSource),
    battlefield('Windswept Hillock', 'Ganking melhora posicionamento de copias temporarias.', riftAtlasSource),
  ],
  'Lee Sin - Blind Monk': [
    battlefield('Monastery of Hirana', 'Converte buffs/Empower em compra ao conquistar.'),
    battlefield('Navori Fighting Pit', 'Buffa unidade ao controlar e fortalece mesa.'),
    battlefield('The Dreaming Tree', 'Premia spells que escolhem unidades amigas.'),
  ],
  'Leona - Radiant Dawn': [
    battlefield('Fortified Position', 'Ajuda o plano defensivo de stun e combate.'),
    battlefield('Kinkou Temple', 'Fortalece unidades com Tank.'),
    battlefield('Sunken Temple', 'Compra quando unidades Mighty conquistam.'),
  ],
  'Lillia - Bashful Bloom': [
    battlefield('Altar of Blood', 'Aparece em lista Lillia e protege unidades em combate.', riftAtlasSource),
    battlefield('Black Flame Altar', 'Valoriza unidades Temporary com Shield.', riftAtlasSource),
    battlefield('Dusk Rose Lab', 'Transforma unidades em compra, comum em shells de valor.', riftAtlasSource),
  ],
  'Lucian - Purifier': [
    battlefield('Trifarian War Camp', 'Aumenta pressao e troca de combate.'),
    battlefield("The Arena's Greatest", 'Acelera decks que querem pontuar cedo.'),
    battlefield('Trapping Grounds', 'Recompensa excesso de dano e ataques fortes.'),
  ],
  'Lux - Lady of Luminosity': [
    battlefield('Forgotten Library', 'Premia spells de custo alto com Predict.'),
    battlefield('Ravenbloom Conservatory', 'Compra/recicla ao defender revelando spells.'),
    battlefield('The Academy', 'Repeat para spells enquanto controla o campo.'),
  ],
  'Master Yi - Wuju Bladesman': [
    battlefield('Monastery of Hirana', 'Transforma buffs em compra ao conquistar.'),
    battlefield('Navori Fighting Pit', 'Buffa unidade no controle do campo.'),
    battlefield('Trifarian War Camp', 'Might extra ajuda duelos e defesas isoladas.'),
  ],
  'Master Yi - Wuju Master': [
    battlefield('Navori Fighting Pit', 'Buffs constantes para o plano de unidade grande.'),
    battlefield('Valley of Idols', 'Buff permanente em unidades jogadas no campo.'),
    battlefield('Sunken Temple', 'Compra com unidades Mighty.'),
  ],
  "Mel - Soul's Reflection": [
    battlefield('Heisho, Shell of the World', 'Ajuda spells/habilidades que escolhem alvos no campo.'),
    battlefield('Ravenbloom Conservatory', 'Valor defensivo para decks cheios de spells.'),
    battlefield('Void Gate', 'Aumenta dano de efeitos que escolhem unidades.'),
  ],
  'Miss Fortune - Bounty Hunter': [
    battlefield('Trifarian War Camp', 'Might extra ajuda ataques largos.'),
    battlefield('Zaun Warrens', 'Filtra mao em decks agressivos.'),
    battlefield('Minefield', 'Alimenta lixo e pressao em conquistas.'),
  ],
  'Nasus - Curator of the Sands': [
    battlefield('Shadow Temple', 'Burn 3 ao manter, excelente para Flow e descarte.'),
    battlefield('Minefield', 'Coloca cartas no lixo ao conquistar.'),
    battlefield('The Papertree', 'Ajuda a canalizar runas para jogo mais longo.'),
  ],
  'Ornn - Fire Below the Mountain': [
    battlefield("Ornn's Forge", 'Reduz equipamentos e combina diretamente com Ornn.'),
    battlefield('Piltovan Forge', 'Barateia habilidades de equipamento.'),
    battlefield('Treasure Hoard', 'Cria Gold para acelerar jogadas.'),
  ],
  'Poppy - Keeper of the Hammer': [
    battlefield('Fortified Position', 'Melhora defesa e seguranca de unidades.'),
    battlefield('Kinkou Temple', 'Recompensa Tank, comum em plano defensivo.'),
    battlefield('Altar of Blood', 'Permite preservar unidade chave em combate.'),
  ],
  'Pyke - Bloodharbor Ripper': [
    battlefield("Ripper's Bay", 'Interage com retorno para mao e linhas de tempo.'),
    battlefield('Minefield', 'Alimenta lixo para planos de Chaos/Fury.'),
    battlefield('Zaun Warrens', 'Filtra mao e sustenta agressao.'),
  ],
  "Rek'sai - Void Burrower": [
    battlefield('Trapping Grounds', 'Recompensa dano excedente, plano natural de Rek’Sai.'),
    battlefield("The Arena's Greatest", 'Acelera pressao de campo.'),
    battlefield('Trifarian War Camp', 'Might extra para conquistar com margem.'),
  ],
  'Renata Glasc - Chem-Baroness': [
    battlefield('Dusk Rose Lab', 'Converte unidades em compra e apoia estrategias de valor.'),
    battlefield('Piltovan Forge', 'Apoia equipamentos e pecas de engine.'),
    battlefield('Zaun Warrens', 'Descarta/compra para achar motores.'),
  ],
  'Renekton - Butcher of the Sands': [
    battlefield('Trifarian War Camp', 'Might extra para agressao de Body/Fury.'),
    battlefield('Sunken Temple', 'Compra com unidades Mighty.'),
    battlefield("The Arena's Greatest", 'Acelera a corrida de pontos.'),
  ],
  'Rengar - Pridestalker': [
    battlefield('Trapping Grounds', 'Recompensa overkill e duelos.'),
    battlefield('Navori Fighting Pit', 'Buffa unidade para cacar combates.'),
    battlefield("Reckoner's Arena", 'Aproveita conquistas e unidades agressivas.'),
  ],
  'Rumble - Mechanized Menace': [
    battlefield('Piltovan Forge', 'Apoia equipamentos e habilidades ativadas.'),
    battlefield('Minefield', 'Alimenta lixo e linhas de recurso.'),
    battlefield("The Arena's Greatest", 'Pressiona pontuacao enquanto monta engine.'),
  ],
  'Sett - The Boss': [
    battlefield('Monastery of Hirana', 'Aparece em lista Sett e transforma buffs em compra.', riftAtlasSource),
    battlefield("The Arena's Greatest", 'Usado em lista Sett para acelerar o jogo.', riftAtlasSource),
    battlefield('Windswept Hillock', 'Ganking ajuda reposicionar unidades fortes.', riftAtlasSource),
  ],
  'Shen - Eye of Twilight': [
    battlefield('Fortified Position', 'Fortalece defesa, ponto central de Shen.'),
    battlefield('Kinkou Temple', 'Recompensa Tank e combinacoes defensivas.'),
    battlefield('Star Spring', 'Reposiciona unidades para base e protege pecas.'),
  ],
  'Sivir - Battle Mistress': [
    battlefield('The Grand Plaza', 'Premia mesa muito larga.'),
    battlefield('Seat of Power', 'Compra por controlar outros campos.'),
    battlefield('Trifarian War Camp', 'Buff global de Might para ataques largos.'),
  ],
  'Teemo - Swift Scout': [
    battlefield('Bandle Tree', 'Mais espaco para Hidden e jogo de armadilhas.'),
    battlefield('The Candlelit Sanctum', 'Filtra topo e ajuda encontrar pecas.'),
    battlefield('Zaun Warrens', 'Descarta/compra para manter pressao e achar tricks.'),
  ],
  'Vex - Gloomist': [
    battlefield('Fortified Position', 'Recorrente em listas Vex e melhora defesa.', riftAtlasSource),
    battlefield('Star Spring', 'Aparece em listas de hold/controle de Vex.', riftAtlasSource),
    battlefield('Startipped Peak', 'Canaliza runa exaurida ao controlar, ajudando jogo longo.', riftAtlasSource),
  ],
  'Vi - Piltover Enforcer': [
    battlefield('Trapping Grounds', 'Recompensa 3+ dano excedente, exatamente o plano de Vi.'),
    battlefield('Trifarian War Camp', 'Might extra ajuda passar dano excedente.'),
    battlefield('Sunken Temple', 'Compra com unidades Mighty em conquistas.'),
  ],
  'Viktor - Herald of the Arcane': [
    battlefield('Forbidding Waste', 'Aparece em lista Viktor e mexe com combates isolados.', riftAtlasSource),
    battlefield('Veiled Temple', 'Prepara equipamento em conquista e apoia tokens/equipamentos.', riftAtlasSource),
    battlefield('Void Gate', 'Aumenta dano de spells/habilidades no campo.', riftAtlasSource),
  ],
  'Volibear - Relentless Storm': [
    battlefield('Sunken Temple', 'Compra com unidades Mighty.'),
    battlefield('Startipped Peak', 'Canaliza runa exaurida para acelerar cartas grandes.'),
    battlefield("Targon's Peak", 'Deixa runas prontas depois de conquistar.'),
  ],
  'Yasuo - Unforgiven': [
    battlefield('Amateur Recital', 'Move unidade para base ao segurar.'),
    battlefield('Back-Alley Bar', 'Premia movimento com Might.'),
    battlefield('Windswept Hillock', 'Ganking facilita reposicionamento entre campos.'),
  ],
  'Zed - Master of Shadows': [
    battlefield('Shadow Temple', 'Burn 3 alimenta o plano de banish/lixo.'),
    battlefield('Zaun Warrens', 'Descarta e compra para achar ameacas.'),
    battlefield('The Candlelit Sanctum', 'Filtra topo em conquistas para manter pressao.'),
  ],
}));

const tips = new Map(Object.entries({
  'Ahri - Nine-Tailed Fox': tip(
    'Tempo defensivo / controle de campo',
    'Segure campos conquistados e puna ataques adversarios reduzindo a forca das unidades inimigas. Ahri gosta de vencer por bons bloqueios, trades favoraveis e controle de combate.',
    'Procure unidades eficientes para defender cedo, efeitos de stun/movimento e cartas que protejam campos ja conquistados.',
    ['Debuffs de Might para tornar ataques ruins para o oponente.', 'Stun, recall ou movimento para negar combates importantes.', 'Unidades resistentes que aproveitam o -1 de Might para sobreviver.'],
    ['Nao construa como aggro puro; Ahri precisa de tempo para transformar defesa em vantagem.', 'Priorize cartas que funcionam bem quando voce ja controla um battlefield.', 'Inclua compra ou filtros para nao ficar sem resposta no meio do jogo.'],
    'Pode ter dificuldade se ficar atras cedo e nao tiver campos para defender.'
  ),
  'Akali - Rogue Assassin': tip(
    'Tempo / Retreat',
    'Force o oponente a se comprometer em um showdown, retire sua unidade para base e, quando Akali estiver Empowered, prepare a unidade para reutilizar ataques, defesas ou habilidades.',
    'Procure unidades com bons efeitos ao entrar, cartas de movimento/retreat e formas seguras de Empower.',
    ['Retreat de unidade em showdown para negar dano e reposicionar.', 'Ready em unidade importante depois de Empower.', 'Truques baratos que fazem o oponente errar o calculo de combate.'],
    ['Use unidades que continuam boas se voltarem para base.', 'Inclua pressao barata para obrigar o oponente a agir primeiro.', 'Nao dependa de uma unica unidade; Akali vence por tempo e sequenciamento.'],
    'Se gastar movimento sem ganhar campo, o deck fica sem pressao.'
  ),
  'Ambessa - Matriarch of War': tip(
    'Empower midrange',
    'Empower outras cartas para ligar Ambessa automaticamente, depois use Disempower para preparar unidades e ganhar combates extras.',
    'Procure cartas com Empower, unidades que atacam bem duas vezes e buffs permanentes.',
    ['Empower em qualquer outra peca para ligar Ambessa sem gastar carta extra.', 'Ready em unidade grande para atacar, defender ou trocar de campo.', 'Buffs que tornam uma unidade preparada novamente muito dificil de combater.'],
    ['Mantenha uma massa boa de cartas com Empower.', 'Use unidades de Might alto ou efeitos ao atacar.', 'Inclua interacao barata para proteger a unidade que sera preparada.'],
    'Fica inconsistente se o deck tiver poucas cartas que Empower.'
  ),
  'Annie - Dark Child': tip(
    'Spell tempo / pressao de runas',
    'Use a preparacao de runas no fim do turno para jogar spells e habilidades com mais liberdade. Annie quer gastar recursos agressivamente sem ficar sem poder no turno seguinte.',
    'Procure spells baratos, unidades que recompensam spells e cartas que usam runas de Fury/Chaos com frequencia.',
    ['Pronto em 2 runas para transformar turno agressivo em continuidade.', 'Spells que causam dano ou buffam unidades antes do combate.', 'Unidades que ficam melhores quando voce joga spells.'],
    ['Baixe a curva para aproveitar recursos extras cedo.', 'Inclua dano direto ou remocoes para abrir caminho.', 'Nao encha o deck so de cartas caras; Annie quer sequenciar varias acoes.'],
    'Pode perder valor se comprar muitas cartas sem uso de runa ou sem spells relevantes.'
  ),
  'Azir - Emperor of the Sands': tip(
    'Midrange de equipamentos / tokens',
    'Jogue equipamentos para criar Sand Soldiers e transformar presenca de mesa em valor. O plano e ocupar campos com fichas que carregam equipamentos melhor do que unidades comuns.',
    'Procure equipamentos baratos, formas de proteger fichas equipadas e interacoes Calm/Order.',
    ['Equipamento jogado ativa a lenda e gera Sand Soldier.', 'Weaponmaster reduz o custo de equipar e melhora a troca de recursos.', 'Fichas pequenas viram ameacas reais quando carregam equipamento.'],
    ['Use muitos equipamentos baratos para ativar Azir todo turno.', 'Inclua protecao para nao perder todo o investimento em uma unidade.', 'Tenha formas de reconstruir mesa depois de remocao.'],
    'Pode sofrer contra decks que removem equipamentos ou limpam varias unidades pequenas.'
  ),
  'Darius - Hand of Noxus': tip(
    'Legion tempo / recursos reativos',
    'Jogue cartas no turno para ligar Legion e use a energia extra de Darius em momentos de combate. O plano e pressionar com unidades eficientes e vencer showdowns com recursos inesperados.',
    'Procure unidades Legion, truques de combate e cartas baratas para ativar a condicao todo turno.',
    ['Legion transforma cartas jogadas em energia flexivel.', 'Truques de combate ficam melhores quando o oponente nao conta com energia extra.', 'Fury/Order combina pressao e board sólido.'],
    ['Mantenha custo baixo o bastante para ativar Legion cedo.', 'Use cartas que continuam boas quando compradas tarde.', 'Nao dependa so da habilidade; Darius precisa de mesa.'],
    'Fica pior em turnos nos quais voce nao consegue jogar carta antes do combate.'
  ),
  'Diana - Scorn of the Moon': tip(
    'Showdown tempo',
    'Guarde energia para showdowns e vença combates que pareciam empatados. Diana quer unidades que entram em lutas importantes e usam recursos extras no momento certo.',
    'Procure truques de combate, spells de showdown e unidades que escalam com recursos durante a luta.',
    ['Energia durante showdown muda matematica de combate.', 'Mind/Chaos permite truques, dano e interacao flexivel.', 'Cartas reativas punem ataques mal calculados.'],
    ['Inclua interacoes que podem ser usadas no combate.', 'Use unidades que forcem oponente a disputar campos.', 'Tenha plano para pontuar; vencer combate sem conquistar nao basta.'],
    'Pode parecer passiva se nao tiver unidades pressionando campos.'
  ),
  'Draven - Glorious Executioner': tip(
    'Aggro de combate',
    'Monte combates favoraveis e compre cartas quando suas unidades vencem. Draven quer atacar com vantagem de Might, remover bloqueadores e transformar cada vitoria em gas.',
    'Procure unidades agressivas, buffs baratos e remocoes que garantam vitorias de combate.',
    ['Buffs antes do combate para vencer e comprar.', 'Remocao pequena que deixa so suas unidades no campo.', 'Assault e dano ajudam a transformar vantagem em pontuacao.'],
    ['Priorize cartas que melhoram combate imediatamente.', 'Nao jogue unidades pequenas sem suporte; elas precisam vencer, nao so participar.', 'Inclua formas de comprar ou filtrar para manter pressao.'],
    'Se o oponente evita combates ou remove suas unidades antes deles, Draven perde valor.'
  ),
  'Ezreal - Prodigal Explorer': tip(
    'Spell control / alvo duplo',
    'Escolha unidades ou equipamentos inimigos duas vezes no turno para habilitar compra com Ezreal. O plano e responder ao oponente enquanto compra cartas e mantem a mao cheia.',
    'Procure spells e habilidades que miram inimigos, remocoes pequenas e efeitos que podem escolher mais de um alvo.',
    ['Dois alvos no mesmo turno ativam compra.', 'Mind/Chaos oferece remocao, dano e truques.', 'Equipamentos inimigos tambem contam como alvo.'],
    ['Inclua interacoes baratas para completar a condicao.', 'Use unidades que tambem tenham habilidades de alvo.', 'Nao encha o deck so de respostas caras.'],
    'Pode ficar lento se o oponente jogar poucas pecas alvo ou se voce nao encontrar interacao.'
  ),
  'Fiora - Grand Duelist': tip(
    'Mighty midrange',
    'Transforme unidades em Mighty para canalizar runas e acelerar jogadas. Fiora quer unidades com 5+ Might, buffs permanentes e combates onde uma unidade grande domina.',
    'Procure unidades perto de 5 Might, buffs eficientes e cartas que recompensam Might alto.',
    ['Mighty ativa canal de runa.', 'Buffs tornam unidades medias em ameacas grandes.', 'Body/Order sustenta mesa forte e combate limpo.'],
    ['Escolha buffs que fiquem na unidade, nao apenas temporarios.', 'Use algumas unidades naturalmente grandes.', 'Inclua protecao para nao perder a unidade investida.'],
    'Pode sofrer contra remocao eficiente em alvo unico.'
  ),
  'Garen - Might of Demacia': tip(
    'Go-wide conquista',
    'Conquiste campos com 4 ou mais unidades para comprar 2. Garen quer muitas unidades, buffs de grupo e formas de concentrar mesa no campo certo.',
    'Procure unidades baratas, efeitos de preparar/mover e cartas que aumentem Might coletivo.',
    ['Quatro unidades no mesmo battlefield transformam conquista em compra.', 'Buffs de time tornam ataques em massa mais seguros.', 'Order ajuda a organizar mesa e defender.'],
    ['Tenha muitas unidades de custo baixo e medio.', 'Nao espalhe demais a mesa quando precisa comprar.', 'Use campos que recompensem presenca numerosa.'],
    'Pode perder para efeitos que punem mesa larga ou removem varias unidades.'
  ),
  'Irelia - Blade Dancer': tip(
    'Tempo de ready / alvo aliado',
    'Escolha suas proprias unidades para prepara-las com Irelia, ganhando ataques, defesas e habilidades extras. Conquistar prepara a lenda para repetir o ciclo.',
    'Procure cartas que escolhem unidades aliadas, unidades com habilidade de exaurir e efeitos de conquista.',
    ['Escolher unidade aliada pode virar ready.', 'Conquistar reseta Irelia e permite novo ready.', 'Unidades com efeitos de exhaust aproveitam usos extras.'],
    ['Inclua muitos efeitos que escolhem friendly units.', 'Use unidades que ficam excelentes quando prontas de novo.', 'Sequencie conquistas para reusar Irelia no mesmo turno.'],
    'Exige bom sequenciamento; se nao houver alvos aliados, a lenda nao gera valor.'
  ),
  'Ivern - Green Father': tip(
    'Battlefield control / tribo',
    'Transforme campos conquistados ou segurados em Brush para fortalecer tipos específicos e alterar a matematica do campo. Ivern prefere decks que vencem por controle de local.',
    'Procure unidades beneficiadas por Brush, formas de hold/conquer e cartas que protegem battlefield.',
    ['Brush muda o campo depois de conquer/hold.', 'Buff de campo transforma unidades pequenas em ameacas melhores.', 'Calm/Order favorece controle e defesa.'],
    ['Escolha battlefields que voce consiga segurar.', 'Inclua unidades que se beneficiem diretamente do Brush.', 'Nao dependa so do bonus; ainda precisa de plano de pontuacao.'],
    'Pode ser lento se nao conseguir conquer ou hold cedo.'
  ),
  'Jax - Grandmaster At Arms': tip(
    'Equipamento midrange',
    'Reposicione equipamentos para sempre deixar a melhor unidade ameaçadora. Jax permite reaproveitar gear e mudar quem carrega a pressao conforme o combate.',
    'Procure equipamentos fortes, unidades evasivas/resistentes e formas de proteger o portador.',
    ['Mover equipamento evita perder valor quando a unidade certa muda.', 'Equipamentos desanexados voltam a influenciar a mesa.', 'Calm/Body combina protecao e unidades robustas.'],
    ['Use equipamentos que valem a acao de mover.', 'Tenha unidades suficientes para sempre ter bom portador.', 'Inclua resposta contra remocao de gear.'],
    'Pode ficar travado se comprar equipamentos sem unidades ou unidades sem equipamentos.'
  ),
  'Jayce - Defender of Tomorrow': tip(
    'Gear engine / Empower',
    'Prepare gear uma ou duas vezes por turno para gerar recursos extras. Jayce quer equipamentos com habilidades de exaurir e cartas que Empower com segurança.',
    'Procure gear com habilidades ativas, formas de Empower e unidades que protejam o motor.',
    ['Ready de gear permite repetir habilidades.', 'Empowered dobra o teto da lenda.', 'Mind/Body favorece peças de engine e sobrevivencia.'],
    ['Priorize gears que fazem algo relevante ao exaurir.', 'Inclua defesa para nao perder tempo montando engine.', 'Nao use gear demais sem payoff claro.'],
    'A montagem inicial pode ser lenta contra pressao.'
  ),
  'Jhin - Virtuoso': tip(
    'Spells caros / engine de quatro',
    'Jogue spells de custo 4+ para acumular quatro banidos com Jhin, depois converta isso em runas canalizadas e compra. O plano e controlar ate o quarto spell resolver.',
    'Procure spells de custo 4+, controle barato para sobreviver e formas de comprar.',
    ['Spells caros alimentam o contador de Jhin.', 'O quarto spell converte em burst de recursos.', 'Fury/Mind mistura dano e compra.'],
    ['Nao exagere em custo alto; precisa chegar vivo ao engine.', 'Use spells que ja seriam boas sem Jhin.', 'Tenha unidades suficientes para disputar campos.'],
    'Pode comprar maos pesadas e perder para decks muito rapidos.'
  ),
  'Jinx - Loose Cannon': tip(
    'Discard aggro',
    'Esvazie a mao com cartas baratas e descarte para comprar no inicio do turno. Jinx quer transformar agressao e mao baixa em combustivel constante.',
    'Procure unidades baratas, custos de descarte, dano direto e cartas que podem ser jogadas sem depender de muito setup.',
    ['Mao com uma ou menos cartas ativa compra.', 'Descarte deixa a mao baixa sem perder ritmo.', 'Fury/Chaos favorece dano, pressao e trucos agressivos.'],
    ['Baixe bastante a curva.', 'Use descarte que tambem gere mesa ou dano.', 'Tenha cuidado para nao ficar sem acao se Jinx nao comprar.'],
    'Se a mao esvazia mas nao pressiona, o deck fica no topdeck cedo demais.'
  ),
  "Kai'Sa - Daughter of the Void": tip(
    'Spell tempo',
    'Use a runa rainbow de Kai’Sa para spells e mantenha flexibilidade nos turnos de combate. O plano e jogar spells-chave com menos restricao de dominio.',
    'Procure spells impactantes, unidades que recompensam spells e cartas que protegem campeao/unidades centrais.',
    ['Rainbow para spells suaviza custos.', 'Fury/Mind combina dano e compra.', 'Spells certos permitem virar showdowns.'],
    ['Escolha spells realmente impactantes para justificar a lenda.', 'Inclua unidades que pressionem enquanto voce segura interacao.', 'Nao coloque spells demais sem mesa.'],
    'Pode ficar reativa demais se nao tiver unidades para disputar campos.'
  ),
  "Kha'Zix - Voidreaver": tip(
    'XP combat / pickoff',
    'Ganhe combates para acumular XP e transformar isso em buffs ou recuos de unidades. Kha’Zix quer lutas escolhidas, abates e unidades que vencem duelos.',
    'Procure buffs, remocoes pequenas e unidades que sobrevivem a combate.',
    ['Vencer combate gera XP.', 'XP vira buff ou movimento para base.', 'Body/Chaos ajuda em combate e truques.'],
    ['Monte para ganhar combates pontuais, nao para brigar em todos os campos.', 'Use buffs que protegem unidades-chave.', 'Inclua formas de forcar lutas favoraveis.'],
    'Se nao ganhar combates cedo, a engine de XP demora a ligar.'
  ),
  'Kennen - Heart of the Tempest': tip(
    'Play-from-not-hand / Assault tempo',
    'Jogue cartas de fora da mao para Empower Kennen, depois transforme isso em Assault para finalizar combates. Kennen gosta de Flow, banish/play e efeitos que criam jogadas alternativas.',
    'Procure cartas jogadas do descarte, banidas ou por efeitos, alem de unidades que usam Assault bem.',
    ['Cartas fora da mao ligam Empower.', 'Disempower converte em Assault 2.', 'Order/Chaos favorece truques e linhas explosivas.'],
    ['Inclua fontes confiaveis de jogar carta fora da mao.', 'Use unidades que atacam bem com Assault.', 'Nao dependa de Kennen sem payoff de dano.'],
    'Pode ser inconsistente se nao encontrar cartas que ativem a lenda.'
  ),
  'LeBlanc - Deceiver': tip(
    'Clone tempo / valor',
    'Ao conquistar ou segurar, descarte para criar Reflection copiando uma unidade do campo. LeBlanc vence duplicando a melhor peça no momento certo.',
    'Procure unidades com bons textos copiaveis, efeitos de descarte aproveitaveis e formas de conquer/hold.',
    ['Reflection copia unidade relevante no battlefield.', 'Temporary exige usar o valor imediatamente.', 'Discard pode alimentar outras sinergias.'],
    ['Inclua bons alvos para copiar dos dois lados da mesa.', 'Use cartas que gostam de descarte.', 'Planeje campos onde uma copia temporaria decide combate ou pontuacao.'],
    'Pode perder valor se os campos tiverem poucas unidades boas para copiar.'
  ),
  'Lee Sin - Blind Monk': tip(
    'Buff midrange',
    'Use a habilidade para colocar buff em unidades e transformar mesa comum em ameacas crescentes. Lee Sin quer combates repetidos onde seus buffs acumulam vantagem.',
    'Procure unidades eficientes, cartas que recompensam buff/Mighty e protecao.',
    ['Buff constante melhora trades.', 'Unidades defendendo ou atacando ficam fora do alcance de remocoes pequenas.', 'Calm/Body sustenta combate prolongado.'],
    ['Use unidades que sobrevivem para carregar buffs.', 'Nao concentre tudo em uma peca sem protecao.', 'Inclua algumas cartas de movimento para aplicar o buff onde importa.'],
    'Pode ser lento se o oponente remover a unidade buffada antes de ela gerar valor.'
  ),
  'Leona - Radiant Dawn': tip(
    'Stun midrange',
    'Stun inimigos para ativar buffs em suas unidades. Leona transforma controle de combate em crescimento de mesa.',
    'Procure cartas de stun, unidades que atacam bem buffadas e ferramentas de defesa.',
    ['Stun ativa buff friendly.', 'Buffs tornam showdowns futuros melhores.', 'Calm/Order oferece defesa e controle de campo.'],
    ['Use stun que tambem atrapalha pontuacao inimiga.', 'Tenha unidades para receber os buffs.', 'Nao jogue stuns sem aproveitar o buff gerado.'],
    'Sem cartas de stun suficientes, Leona vira apenas uma lenda lenta.'
  ),
  'Lillia - Bashful Bloom': tip(
    'Temporary token combo',
    'Reduza o custo da habilidade com unidades Temporary e produza Sprites prontos para pressionar ou defender. Lillia quer criar turnos largos com fichas temporarias.',
    'Procure geradores de Temporary, cartas que aproveitam unidades entrando e buffs de grupo.',
    ['Temporary reduz custo da habilidade.', 'Sprites prontos criam presenca imediata.', 'Calm/Mind ajuda a comprar e controlar ritmo.'],
    ['Tenha formas de usar as fichas antes que sumam.', 'Inclua payoff para mesa larga.', 'Nao dependa de fichas temporarias para segurar campo no longo prazo.'],
    'Pode perder valor se as fichas expirarem sem conquistar ou trocar bem.'
  ),
  'Lucian - Purifier': tip(
    'Equipment assault',
    'Transforme cada equipamento em pressao ofensiva com Assault. Lucian quer unidades equipadas atacando com Might extra e mantendo o oponente na defesa.',
    'Procure equipamentos baratos, unidades evasivas/agressivas e protecao contra remocao.',
    ['Todo equipamento concede Assault.', 'Unidades pequenas equipadas passam a ameaçar conquista.', 'Fury/Body favorece ataques fortes.'],
    ['Use equipamentos de baixo custo para curvar bem.', 'Tenha unidades suficientes para carregar gear.', 'Inclua formas de recuperar valor se a unidade equipada morrer.'],
    'Pode ficar vulneravel se comprar gear sem unidade ou perder o portador.'
  ),
  'Lux - Lady of Luminosity': tip(
    'Big spells value',
    'Jogue spells de custo 5+ para comprar e manter recursos. Lux quer controlar a partida ate spells grandes decidirem campos ou comprarem mais cartas.',
    'Procure spells caros que afetam mesa, reducao/geracao de recursos e defesa inicial.',
    ['Spells 5+ substituem a si mesmos com compra.', 'Mind/Order favorece controle e valor.', 'Cartas caras precisam impactar campo imediatamente.'],
    ['Tenha early game defensivo.', 'Use spells caros que ja sejam bons sem Lux.', 'Inclua compra menor para encontrar os payoffs.'],
    'Pode morrer antes dos spells grandes se o deck nao tiver interacao cedo.'
  ),
  'Master Yi - Wuju Bladesman': tip(
    'Solo defender buff',
    'Defenda com uma unidade de cada vez para ganhar +2 Might e fazer trades eficientes. Esse Yi favorece unidades resistentes e combate limpo.',
    'Procure unidades defensivas, buffs e cartas que protegem uma unidade isolada.',
    ['Defender sozinho recebe Might extra.', 'Buffs tornam uma unidade quase imbatível no campo.', 'Calm/Body permite combate eficiente.'],
    ['Nao espalhe defesa sem necessidade.', 'Escolha unidades que sobrevivem depois do combate.', 'Tenha respostas para evasao ou remocao direta.'],
    'Pode sofrer contra decks que atacam varios campos ao mesmo tempo.'
  ),
  'Master Yi - Wuju Master': tip(
    'XP scaling midrange',
    'Acumule XP para liberar bonus de Might e unidades entrando prontas. O plano e sobreviver ate os niveis e depois dominar combates com mesa superior.',
    'Procure formas de ganhar XP, unidades de custo medio e cartas que aproveitam ready.',
    ['Level 6 melhora toda a mesa.', 'Level 11 acelera unidades entrando prontas.', 'Calm/Body sustenta jogo longo.'],
    ['Inclua early game suficiente para nao ficar atras.', 'Use cartas que ganham XP naturalmente.', 'Quando chegar ao Level 11, priorize unidades que impactam imediatamente.'],
    'Pode ser lento se o deck nao ganhar XP em ritmo constante.'
  ),
  "Mel - Soul's Reflection": tip(
    'Empower control',
    'Empower outras cartas para ligar Mel e use Disempower para reduzir Might inimigo em combate. Mel joga para manipular lutas e punir ataques.',
    'Procure cartas com Empower, debuffs, truques de combate e unidades que vencem por margem pequena.',
    ['Empower em outra carta liga Mel.', '-2 Might decide showdowns.', 'Mind/Chaos combina debuff e truques.'],
    ['Tenha uma massa boa de Empower.', 'Use a habilidade no combate onde muda a pontuacao.', 'Inclua cartas que compram para manter recursos.'],
    'Sem Empower frequente, a habilidade fica presa.'
  ),
  'Miss Fortune - Bounty Hunter': tip(
    'Ganking tempo',
    'Dê Ganking a unidades para mudar de battlefield e atacar onde o oponente esta fraco. Miss Fortune vence por mobilidade e ataques inesperados.',
    'Procure unidades com bons ataques, buffs temporarios e cartas que punem posicionamento ruim.',
    ['Ganking permite mover entre campos.', 'Ataques surpresa quebram defesas planejadas.', 'Body/Chaos favorece combate e truques.'],
    ['Use unidades que ameaçam varios campos.', 'Nao gaste Ganking sem objetivo de pontuar.', 'Inclua buffs para transformar mobilidade em conquista.'],
    'Pode perder eficiencia contra oponentes que espalham defesa bem.'
  ),
  'Nasus - Curator of the Sands': tip(
    'Late game ramp / big energy',
    'Jogue cartas ou habilidades de custo 7+ para preparar runas e encadear turnos grandes. Nasus quer paciencia, defesa e payoffs caros.',
    'Procure defesa inicial, cartas de custo alto realmente fortes e formas de chegar ao late game.',
    ['Custos 7+ preparam runas.', 'Ready de runas permite continuar jogando no mesmo turno.', 'Calm/Mind ajuda a comprar e controlar.'],
    ['Use uma curva incomum, mas nao ignore early game.', 'Escolha payoffs caros que vencem campo, nao apenas compram valor.', 'Inclua controle para ganhar tempo.'],
    'Pode ser atropelado por pressao se o early game for leve demais.'
  ),
  'Ornn - Fire Below the Mountain': tip(
    'Gear ramp',
    'Use a runa rainbow de Ornn para jogar equipamentos ou ativar habilidades de gear. O plano e transformar equipamentos em vantagem repetida.',
    'Procure equipamentos com habilidades relevantes, unidades boas portadoras e cartas de protecao.',
    ['Runa para gear suaviza custos.', 'Equipamentos ativos ficam mais faceis de usar.', 'Calm/Mind favorece controle e compra.'],
    ['Tenha quantidade alta de gear, mas nao esqueça unidades.', 'Priorize equipamentos que impactam combate ou recursos.', 'Inclua resposta para remocao de gear.'],
    'Pode comprar pecas erradas: equipamento sem unidade ou unidade sem equipamento.'
  ),
  'Poppy - Keeper of the Hammer': tip(
    'Hold XP value',
    'Segure campos para ganhar XP e depois compre cartas com a habilidade. Poppy quer defesa, resistencia e controle de battlefield.',
    'Procure unidades resistentes, Tank/Shield, buffs defensivos e cartas que ajudam a hold.',
    ['Hold gera XP.', '3 XP viram compra.', 'Body/Order protege mesa e cria valor longo.'],
    ['Escolha battlefields que voce consegue defender.', 'Use unidades que sobrevivem a combates.', 'Nao jogue so defesa; precisa pontuar tambem.'],
    'Pode ficar atras se o oponente contornar seus campos defendidos.'
  ),
  'Pyke - Bloodharbor Ripper': tip(
    'Bounce / Gold tempo',
    'Retorne uma unidade amiga de battlefield para a mao e crie Gold. Pyke transforma recuo em recurso e reutiliza efeitos de entrada ou evita perdas ruins.',
    'Procure unidades com efeitos ao entrar, cartas que gostam de Gold e ameacas baratas.',
    ['Bounce salva unidade ou reutiliza efeito.', 'Gold acelera turnos futuros.', 'Fury/Chaos favorece linhas agressivas e truques.'],
    ['Use unidades que valem ser jogadas de novo.', 'Planeje quando voltar para mao nao custa campo demais.', 'Inclua payoff para Gold.'],
    'Pode perder tempo se devolver unidade sem ganhar valor real.'
  ),
  "Rek'sai - Void Burrower": tip(
    'Conquer value',
    'Conquiste campos para revelar cartas do topo e jogar uma delas. Rek’Sai quer pressao constante que transforma conquista em cartas extras.',
    'Procure unidades agressivas, buffs de combate e cartas que melhoram conquistas.',
    ['Conquer vira selecao de topo.', 'Jogar carta revelada aumenta tempo.', 'Fury/Order mistura pressao e mesa.'],
    ['Monte para conquistar cedo e com frequencia.', 'Use cartas baratas para aproveitar o topo revelado.', 'Nao dependa de high roll; o deck precisa funcionar sem a lenda.'],
    'Se nao conquistar, nao gera vantagem.'
  ),
  'Renata Glasc - Chem-Baroness': tip(
    'Gold hold / comeback',
    'Segure campos para criar Gold e, perto do fim da partida, fazer Gold gerar energia adicional. Renata joga para estabilizar e virar com recursos.',
    'Procure cartas de hold, defesa, uso de Gold e payoffs caros moderados.',
    ['Hold cria Gold.', 'Gold melhora perto da pontuacao final.', 'Mind/Order favorece controle e economia.'],
    ['Use Gold como ponte para turnos maiores.', 'Inclua early game defensivo.', 'Escolha cartas caras que aproveitam energia extra imediatamente.'],
    'Pode demorar demais se nao conseguir hold ou se o oponente pontuar rapido.'
  ),
  'Renekton - Butcher of the Sands': tip(
    'Unit ramp / abilities',
    'Use energia extra para jogar unidades ou ativar habilidades de unidades. Renekton quer mesa forte e habilidades que convertam energia em combate.',
    'Procure unidades com habilidades ativadas, custos de energia e bom Might.',
    ['Energia so para unidades ou habilidades de unidades.', 'Fury/Body favorece unidades grandes e combate.', 'Habilidades ativadas transformam a lenda em engine.'],
    ['Priorize unidades com bons sinks de energia.', 'Nao encha o deck de spells que nao usam a energia da lenda.', 'Inclua cartas baratas para chegar vivo aos turnos grandes.'],
    'Pode desperdiçar habilidade se o deck tiver poucas habilidades de unidade.'
  ),
  'Rengar - Pridestalker': tip(
    'Unit chain aggro',
    'Cada unidade jogada dá +1 Might a uma unidade, criando combates favoráveis em sequencia. Rengar quer muitas unidades e turnos com multiplas jogadas.',
    'Procure unidades baratas, buffs e cartas que compram ou criam corpos extras.',
    ['Jogar unidade vira buff temporario.', 'Varios corpos pequenos aumentam varias lutas.', 'Fury/Body favorece combate direto.'],
    ['Baixe a curva para jogar mais de uma unidade por turno.', 'Use buffs para garantir conquistas, nao so dano.', 'Inclua compra para manter fluxo de unidades.'],
    'Pode perder gas se a mao acabar ou se comprar cartas caras demais.'
  ),
  'Rumble - Mechanized Menace': tip(
    'Mech defensive midrange',
    'Dê Shield aos Mechs e transforme unidades mecanicas em defensores eficientes. Rumble gosta de segurar campos e vencer por mesa resistente.',
    'Procure Mechs, buffs defensivos e formas de punir ataques inimigos.',
    ['Mechs ganham Shield.', 'Shield aumenta resistencia em defesa.', 'Fury/Mind combina dano e controle.'],
    ['Use uma base real de Mechs.', 'Nao jogue Rumble sem tribal suficiente.', 'Inclua cartas para converter defesa em conquista depois.'],
    'Fica fraco se o suporte de Mech for baixo.'
  ),
  'Sett - The Boss': tip(
    'Buff recursion midrange',
    'Proteja unidades buffadas que morreriam, gastando o buff para recua-las exauridas. Sett quer buffs consistentes e unidades que valem salvar.',
    'Procure buffs permanentes, unidades de alto impacto e cartas de conquista.',
    ['Buff vira seguro contra morte.', 'Conquistar prepara Sett para repetir.', 'Body/Order ajuda em combate limpo.'],
    ['Use buffs que voce aceita gastar para salvar unidade.', 'Escolha unidades que geram valor ao sobreviver.', 'Nao dependa de Sett para salvar tudo; escolha prioridades.'],
    'Pode ficar sem valor contra efeitos que nao matam ou que removem de outra forma.'
  ),
  'Shen - Eye of Twilight': tip(
    'Tank protection',
    'Dê Tank a uma unidade amiga para controlar como dano de combate e distribuido. Shen quer proteger unidades-chave e manipular trocas.',
    'Procure unidades resistentes, buffs defensivos e payoffs para defender/hold.',
    ['Tank força dano primeiro naquela unidade.', 'Protege unidades frágeis em campo.', 'Calm/Order favorece defesa e controle.'],
    ['Use Tank na unidade que aguenta o dano.', 'Inclua cura/protecao ou buffs para o tanque.', 'Tenha plano para pontuar, nao apenas bloquear.'],
    'Pode ser passivo demais contra decks que evitam combate direto.'
  ),
  'Sivir - Battle Mistress': tip(
    'Rune recycle / Gold ready',
    'Recicle runas para criar Gold e prepare Sivir quando unidades inimigas morrem. O plano e misturar economia com remocao e combate.',
    'Procure cartas que reciclam runas, remocoes e formas de usar Gold.',
    ['Recycle rune cria Gold.', 'Matar inimigos prepara Sivir.', 'Body/Chaos combina combate e remocao.'],
    ['Inclua formas confiaveis de reciclar runas.', 'Use remocao para preparar a lenda em turnos-chave.', 'Tenha payoffs que usam Gold sem perder tempo.'],
    'Pode ficar inconsistente se nao reciclar runas ou matar unidades.'
  ),
  'Teemo - Swift Scout': tip(
    'Hidden tempo',
    'Pague energia para esconder cartas com Hidden e recupere Teemo da champion zone ou mesa. Teemo joga com informacao oculta e ameaças difíceis de prever.',
    'Procure cartas Hidden, efeitos surpresa e formas de reaproveitar Teemo.',
    ['Hidden mais barato amplia linhas de surpresa.', 'Recuperar Teemo permite reutilizar ou proteger a peça.', 'Mind/Chaos favorece truques e controle.'],
    ['Use bastante Hidden para justificar a lenda.', 'Nao revele sua linha cedo demais.', 'Inclua cartas que punem o oponente por jogar em volta errado.'],
    'Pode perder consistencia se comprar poucas cartas Hidden.'
  ),
  'Vex - Gloomist': tip(
    'Hold draw control',
    'Segure campos para comprar cartas. Vex quer jogo paciente, defesa eficiente e vantagem de mao ao transformar hold em recurso.',
    'Procure unidades defensivas, efeitos de stun/debuff e cartas que seguram battlefield.',
    ['Hold ativa compra.', 'Comprar mais respostas reforça plano de controle.', 'Calm/Chaos combina atraso e truques.'],
    ['Escolha battlefields que voce consegue segurar.', 'Inclua formas de pontuar depois de estabilizar.', 'Use compra para encontrar respostas, nao apenas acumular mao.'],
    'Pode atrasar demais se nao conseguir converter compra em pontuacao.'
  ),
  'Vi - Piltover Enforcer': tip(
    'Excess damage tempo',
    'Conquiste causando 3+ dano excedente para preparar uma unidade. Vi quer unidades grandes, buffs e combates em que voce vence por margem alta.',
    'Procure buffs de Might, Assault e unidades que atacam muito acima da defesa.',
    ['Excesso de dano prepara unidade.', 'Ready permite novo uso/defesa/pressao.', 'Fury/Order combina ataque e mesa sólida.'],
    ['Use buffs para passar do limite de 3 excesso.', 'Escolha alvos onde o overkill vira valor.', 'Nao dependa so de unidades pequenas.'],
    'Pode ser bloqueada por defesas grandes que impedem dano excedente.'
  ),
  'Viktor - Herald of the Arcane': tip(
    'Token go-wide',
    'Crie Recruit tokens para ocupar campos e aumentar presenca de mesa. Viktor quer muitos corpos pequenos, buffs de grupo e cartas que recompensam unidades entrando.',
    'Procure payoffs de unidade, buffs globais e formas de transformar Recruit em conquista.',
    ['Habilidade cria corpo todo turno.', 'Mesa larga pressiona varios campos.', 'Mind/Order favorece valor e organizacao.'],
    ['Use buffs de grupo ou equipamentos para tornar tokens relevantes.', 'Nao conte que 1 Might vence sozinho.', 'Inclua compra para aproveitar turnos longos.'],
    'Pode sofrer contra efeitos que limpam ou ignoram unidades pequenas.'
  ),
  'Volibear - Relentless Storm': tip(
    'Mighty ramp',
    'Jogue unidades Mighty para canalizar runas e acelerar. Volibear quer unidades de 5+ Might, buffs e cartas caras que aproveitam ramp.',
    'Procure unidades Mighty, buffs que chegam a 5 Might e payoffs de custo medio/alto.',
    ['Unidade Mighty canaliza runa.', 'Ramp permite turnos maiores.', 'Fury/Body favorece unidades grandes.'],
    ['Tenha unidades naturalmente Mighty e formas de tornar outras Mighty.', 'Nao deixe a curva pesada demais.', 'Inclua early game para nao perder antes do ramp.'],
    'Pode comprar cartas grandes sem tempo para joga-las se nao estabilizar.'
  ),
  'Yasuo - Unforgiven': tip(
    'Movement tempo',
    'Mova unidades amigas para ou da base, criando ataques inesperados, salvando peças ou reposicionando defesa. Yasuo vence por mobilidade.',
    'Procure unidades com bons ataques, efeitos ao mover e truques que punem posicionamento.',
    ['Mover de/para base muda lutas.', 'Mobilidade permite pontuar onde o oponente nao preparou defesa.', 'Calm/Chaos favorece truques e reposicionamento.'],
    ['Use unidades que ameaçam multiplos campos.', 'Nao gaste movimento sem objetivo claro.', 'Inclua cartas que recompensam entrar/sair de battlefield.'],
    'Pode gastar energia sem gerar vantagem se o movimento nao muda pontuacao.'
  ),
  'Zed - Master of Shadows': tip(
    'Banish / rummage aggro',
    'Banish cartas suas para Empower Zed e use Disempower para descartar e comprar. Zed transforma banish e filtro de mao em consistencia agressiva.',
    'Procure cartas que banem como custo/efeito, descarte util e ameacas baratas.',
    ['Banish liga Empower.', 'Discard+draw filtra mao.', 'Fury/Chaos favorece pressao e sacrificios de recurso.'],
    ['Inclua banish suficiente para ligar a lenda.', 'Use o filtro para achar ameaças, nao so para ciclar sem plano.', 'Baixe a curva para aproveitar a consistencia.'],
    'Pode ficar sem recursos se banir e descartar sem converter em campo.'
  ),
}));

function fallbackTip(card) {
  const text = card.text?.plain || '';
  if (/Equipment|gear/i.test(text)) return tips.get('Azir - Emperor of the Sands');
  if (/Empower|Disempower/i.test(text)) return tip('Empower midrange', 'Construa em torno de Empower e transforme o estado Empowered em vantagem de combate ou recursos.', 'Procure cartas com Empower, buffs e interacao barata.', ['Empower frequente liga a lenda.', 'Disempower deve virar vantagem imediata.'], ['Use uma massa alta de cartas com Empower.', 'Proteja a unidade ou engine principal.'], 'Pode ficar inconsistente sem formas de Empower.');
  if (/conquer/i.test(text)) return tip('Conquer midrange', 'Conquiste campos para transformar a habilidade da lenda em vantagem.', 'Procure unidades eficientes e buffs de combate.', ['Conquer ativa a lenda.', 'Pressao de mesa vira recurso.'], ['Construa para disputar campos cedo.', 'Inclua cartas que ajudam a vencer showdowns.'], 'Nao gera valor se nao conquistar.');
  return tip('Midrange flexivel', 'Use a habilidade da lenda como direcao principal e escolha cartas que a ativem com frequencia.', 'Procure unidades eficientes, interacao e cartas que mencionem as mesmas palavras-chave da lenda.', ['A habilidade da lenda deve ser ativada todo jogo.', 'Cartas dos dominios precisam ajudar o plano principal.'], ['Comece com curva equilibrada.', 'Corte cartas que nao ajudam a habilidade.'], 'Sem sinergia suficiente, a lenda vira apenas uma carta de dominio.');
}

function preference(card) {
  const name = card.name;
  return (
    20 * Number(!/\((Metal|Overnumbered|Signature|Alternate Art)\)/i.test(name)) +
    10 * Number(!/Overnumbered|Signature/i.test(name)) +
    5 * Number(!/Starter/i.test(name)) +
    Number(Boolean(translations[card.riftbound_id]?.name))
  );
}

const legendGroups = new Map();
for (const card of snapshot.cards.filter((item) => item.classification?.type === 'Legend')) {
  const canonical = baseName(card.name);
  legendGroups.set(canonical, [...(legendGroups.get(canonical) || []), card]);
}

const legends = [...legendGroups.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([canonicalName, cards]) => {
    const representative = [...cards].sort((a, b) => preference(b) - preference(a) || a.riftbound_id.localeCompare(b.riftbound_id))[0];
    const translatedName = legendTranslation(canonicalName, translations[representative.riftbound_id]?.name);
    const data = tips.get(canonicalName) || fallbackTip(representative);
    return {
      id: canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: canonicalName,
      translatedName,
      domains: representative.classification?.domain || [],
      representativeCardId: representative.riftbound_id,
      aliases: [...new Set(cards.map((card) => card.riftbound_id))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      recommendedBattlefields: battlefieldRecommendations.get(canonicalName) || [],
      ...data,
      source: data.source || 'Catalogo local + heuristicas baseadas no texto da lenda',
    };
  });

const output = {
  schemaVersion: 1,
  language: 'pt-BR',
  generatedAt: new Date().toISOString(),
  purpose: 'Base inicial de sugestoes por lenda para o futuro construtor de decks com IA.',
  notes: [
    'As dicas agrupam impressoes cosmeticas da mesma lenda em aliases.',
    'Use como ponto de partida editorial; os textos podem ser refinados conforme o meta mudar.',
    'As sugestoes combinam pesquisa externa com leitura do texto das lendas no catalogo local.',
  ],
  sources: [
    {
      label: 'Official Riftbound Deckbuilding Primer',
      url: 'https://playriftbound.com/en-us/news/rules-and-releases/deckbuilding-primer/',
      usedFor: 'Estrutura de deck e fluxo lenda -> campeao -> main deck -> runas -> battlefields.',
    },
    {
      label: 'RiftCompare - Deck Archetypes Guide',
      url: 'https://riftcompare.com/guides/riftbound-deck-archetypes-guide',
      usedFor: 'Pilares de arquetipos: Aggro, Tempo e Midrange.',
    },
    {
      label: 'RiftCompare - Best Riftbound Vendetta Decks',
      url: 'https://riftcompare.com/guides/best-riftbound-vendetta-decks',
      usedFor: 'Modelo de sinergia Setup -> Engine -> Payoff -> Recur e exemplos de Flow/Burn/Empower.',
    },
    {
      label: 'RiftAtlas - Meta decks by legend',
      url: 'https://rift-atlas.com/decks',
      usedFor: 'Battlefields recorrentes em listas publicas por lenda.',
    },
    {
      label: 'LineDepth - Akali Retreat Tempo',
      url: 'https://www.linedepth.com/decks/akali-tempo/guide',
      usedFor: 'Leitura de Akali como deck de tempo baseado em retreat e reposicionamento.',
    },
    {
      label: 'RiftboundGuide - Azir Champion Deck Guide',
      url: 'https://riftboundguide.com/2026/07/09/riftbound-azir-champion-deck-guide/',
      usedFor: 'Azir como engine de Sand Soldiers + Equipment.',
    },
    {
      label: 'RiftboundGuide - Nasus Champion Deck Guide',
      url: 'https://riftboundguide.com/2026/07/23/riftbound-nasus-champion-deck-guide/',
      usedFor: 'Nasus como plano lento/ramp de custo alto.',
    },
    {
      label: 'RiftboundGuide - Zed Champion Deck Guide',
      url: 'https://riftboundguide.com/2026/07/24/riftbound-zed-champion-deck-guide/',
      usedFor: 'Zed como plano de Burn, Banish, Flow e filtro de mao.',
    },
    {
      label: 'ThaiRift - Vendetta Metagame Tier List',
      url: 'https://thairift.com/en/learn/tier-list',
      usedFor: 'Leitura comparativa do meta por lenda e pontos fortes/fraquezas recorrentes.',
    },
  ],
  legends,
};

await writeFile(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`Gerado ${legends.length} planos de lenda em ${outputPath}`);

