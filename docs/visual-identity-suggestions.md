# Direção de identidade visual para o Rift Guia

Este documento reúne sugestões de ícones, imagens e linguagem visual para aproximar o Rift Guia do clima de Riftbound e League of Legends sem copiar a identidade oficial da Riot. A proposta é parecer um compêndio de mesa, mágico e competitivo, com uma estética própria de projeto de fã.

## Princípios

- **Projeto de fã, não oficial:** manter o aviso no rodapé e evitar usar logos oficiais como marca principal do site.
- **Inspirado em Runeterra:** usar metal escuro, dourado, brilho arcano, pergaminho, runas e energia de carta como linguagem visual.
- **TCG primeiro:** a interface deve lembrar mesa de cartas, coleção, deckbox, guia e construção de lista.
- **Legível para iniciantes:** ícones ajudam, mas sempre acompanhados de texto curto até o usuário aprender os termos.
- **Assets oficiais apenas quando autorizados:** para arte de cartas, usar o que vier da API aprovada. Para decoração do site, preferir ilustrações próprias ou abstratas.

## Sistema de ícones recomendado

### Navegação principal

| Área | Ícone sugerido | Ideia visual | Uso |
| --- | --- | --- | --- |
| Biblioteca | Tomo / grimório aberto | Livro com cantos metálicos e brilho azul | Menu, hero da biblioteca, estado vazio |
| Deck Builder | Deckbox / pilha de cartas | Três cartas sobrepostas com uma runa no topo | Menu, CTA de montar deck |
| Aprenda | Pergaminho / bússola | Pergaminho com marcador dourado | Menu, página de regras e glossário |
| Traduções | Pena / glifo de idioma | Pena escrevendo um glifo PT-BR | Contador de tradução, importar/exportar |
| Sugestões | Cristal / faísca arcana | Cristal hextech emitindo luz | Painel de sugestões da lenda |

### Ações do Deck Builder

| Ação | Ícone sugerido | Observação |
| --- | --- | --- |
| Escolher lenda | Coroa fragmentada ou estandarte | Remete ao campeão que define o deck |
| Champion Unit | Silhueta de campeão em medalhão | Pode usar moldura circular dourada |
| Battlefields | Três estandartes fincados | Ajuda a mostrar que são três escolhas |
| Main Deck | Pilha de 40 cartas | Mostrar número/contador perto do ícone |
| Side Deck | Bolsa lateral / reserva | Visual secundário, menos chamativo |
| Guia próprio | Pena + pergaminho | Reforça que é editável pelo usuário |

### Termos e atributos de carta

| Termo | Ícone sugerido | Estilo |
| --- | --- | --- |
| Might / Força | Punho, lâmina ou explosão angular vermelha | Forte, agressivo, alto contraste |
| Energia | Núcleo dourado/hextech numerado | Deve comportar número no centro |
| Runa | Pedra facetada por domínio | Usar cor do domínio como principal |
| Exaurir | Carta inclinada com seta circular | Deve comunicar “virar/usar” |
| Empower | Seta ascendente dentro de um cristal | Sensação de upgrade |
| Flow | Corrente azul ou espiral fluida | Movimento contínuo |
| Burn | Faísca/brasas caindo para baixo | Diferenciar de dano direto |
| Shield/Tank | Escudo facetado verde/azul | Defensivo e estável |
| Temporary | Ampulheta rachada | Comunica duração limitada |
| Token Unit | Silhueta translúcida | Algo criado por efeito |

## Paleta visual

A paleta atual do projeto já está no caminho certo. Sugiro formalizar assim:

| Função | Cor | Uso |
| --- | --- | --- |
| Fundo profundo | `#061015` | Fundo geral |
| Superfície | `#101f26` | Painéis, cards, modais |
| Texto principal | `#effaf8` | Títulos e conteúdo |
| Texto secundário | `#a9c7c9` | Descrições e metadados |
| Dourado arcano | `#f1b75f` | CTAs, foco, destaques |
| Laranja de ação | `#ef6f47` | Hover, aggro, alertas leves |
| Azul hextech | `#61c6ff` | Informação, filtros, magia |
| Verde mesa | `#62d47a` | Completo, selecionado, válido |

### Cores por domínio

| Domínio | Cor sugerida | Personalidade visual |
| --- | --- | --- |
| Fury | `#f05a3b` | Agressão, dano, pressão |
| Calm | `#61c6ff` | Controle, água, precisão |
| Mind | `#9b7cff` | Magia, astúcia, manipulação |
| Body | `#62d47a` | Resistência, combate, presença |
| Chaos | `#f06dc2` | Instabilidade, combo, surpresa |
| Order | `#f4d35e` | Disciplina, proteção, formação |

## Imagens e ilustrações para adicionar

### 1. Hero do site

Criar uma imagem abstrata de “mesa de Riftbound”: fundo escuro, cartas parcialmente visíveis, runas brilhando, três campos de batalha como placas no horizonte. Não precisa mostrar campeões oficiais. Ela pode ficar atrás do header como textura sutil.

### 2. Página Biblioteca

Usar uma imagem decorativa de “arquivo arcano”: prateleiras, tomos, cartas suspensas e partículas douradas. Isso combina com a ideia de consultar cartas.

### 3. Deck Builder

Usar uma imagem de “mesa de construção”: pilhas de cartas, deckbox, marcadores de energia e mapa tático com três zonas. Boa para o topo da seção ou fundo lateral do builder.

### 4. Aprenda

Usar uma imagem de “manual de invocador”: pergaminho aberto, ícones explicativos e pequenos glifos. Deve parecer didático e acolhedor.

### 5. Estados vazios

Criar pequenas ilustrações próprias:

- Nenhuma carta encontrada: lupa sobre uma carta virada para baixo.
- Nenhum deck montado: deckbox vazio com brilho interno.
- Tradução pendente: pena pausada sobre uma carta.
- Sugestões indisponíveis: cristal apagado.

## Componentes visuais prioritários

1. **Pacote de ícones SVG locais**
   - Criar ícones próprios em `src/components/RiftboundIcon.tsx` ou dividir por arquivos SVG.
   - Manter traço espesso, formas facetadas e brilho interno.

2. **Badges de domínio**
   - Usar ponto/runa colorida + nome do domínio.
   - Aplicar em cards, filtros e estatísticas do deck.

3. **Molduras de carta**
   - Biblioteca: moldura escura com brilho sutil.
   - Deck Builder: moldura menor, mas com estado selecionado forte.
   - Modal: moldura premium, mais próxima de uma ficha de coleção.

4. **Backgrounds abstratos**
   - Evitar imagens pesadas em todas as telas.
   - Usar gradientes, linhas, partículas e runas em CSS/SVG.

5. **Mascote/identidade própria opcional**
   - Criar um pequeno “guia arcano” original, como uma lanterna, tomo vivo ou poro estilizado sem copiar o Poro oficial.
   - Ele pode aparecer em estados vazios e mensagens de ajuda.

## O que evitar

- Usar o logo oficial de Riot, League of Legends ou Riftbound como logo principal do site.
- Copiar ícones oficiais de cartas fora do que for fornecido por API autorizada.
- Usar splash arts de campeões como decoração geral fora das cartas/autorização.
- Fazer o site parecer oficial. O nome “Rift Guia” deve ter marca própria.
- Transformar o site em simulador de partida com regras automatizadas.

## Próxima implementação sugerida

1. Criar um pacote de ícones SVG próprios:
   - `LibraryTomeIcon`
   - `DeckBoxIcon`
   - `ScrollGuideIcon`
   - `EnergyCoreIcon`
   - `MightBladeIcon`
   - `ExhaustTurnIcon`
   - `DomainRuneIcon`

2. Trocar ícones genéricos do `lucide-react` nos pontos principais pelos ícones próprios.

3. Criar ilustrações SVG leves para estados vazios e heros:
   - `ArcaneLibraryIllustration`
   - `DeckTableIllustration`
   - `LearnScrollIllustration`

4. Aplicar badges de domínio em Biblioteca e Deck Builder.

5. Ajustar o rodapé com aviso claro de projeto de fã.

## Referências consultadas

- Site oficial de Riftbound: apresenta o jogo como um TCG estratégico em que campeões disputam battlefields e reforça produto, coleção e construção de decks.
- Política Legal Jibber Jabber da Riot: permite projetos gratuitos de fã com regras, mas exige deixar claro que não há endosso da Riot e restringe uso de logos/marcas oficiais.
- Política de ferramentas digitais de Riftbound no Riot Developer Portal: lista card libraries e deckbuilders como exemplos aprováveis, pede uso de assets via Riot API e exige integridade de marca.
- Página oficial de downloads de League of Legends: há assets oficiais, fontes e pacotes visuais, mas a política de marca ainda deve orientar o uso no projeto.
