# Roadmap de melhorias e pesquisa de UI/UX do Rift Guia

Data: 2026-09-29

Este documento reúne uma lista de próximas tarefas e uma pesquisa inicial de UI/UX para orientar a próxima rodada de melhorias visuais do Rift Guia. A ideia é manter este arquivo como backlog revisável antes de mexermos no design do site.

## Objetivo do redesign

O Rift Guia precisa continuar sendo simples para alguém que está aprendendo Riftbound, mas também precisa ganhar uma interface mais clara para quem já quer buscar cartas, montar decks, comparar opções e estudar planos de jogo.

A direção recomendada é transformar o site em uma experiência com três pilares:

1. **Aprender**: regras, glossário, exemplos, como montar decks e como jogar com cada lenda.
2. **Explorar**: biblioteca rápida, filtros úteis, cards legíveis e modal compartilhável.
3. **Construir**: deck builder guiado, sugestões, estatísticas, importação/exportação e guia pessoal.

## Referências pesquisadas

- Nielsen Norman Group — filtros devem preservar estabilidade da tela e respeitar a intenção do usuário; filtros interativos funcionam melhor quando a resposta é rápida, enquanto filtros em lote reduzem custo de interação em fluxos mais lentos ou complexos: https://www.nngroup.com/articles/applying-filters/
- Nielsen Norman Group — cards funcionam bem quando agrupam informações relacionadas, oferecem um resumo claro e indicam clickabilidade com borda, contraste e profundidade: https://www.nngroup.com/articles/cards-component/
- Nielsen Norman Group — aplicações complexas precisam de navegação consistente, comandos claros, feedback visível e redução de carga cognitiva: https://www.nngroup.com/articles/complex-application-design/
- Baymard Institute — listas grandes dependem da combinação de filtros, ordenação e layout equilibrado para ajudar usuários a encontrar itens relevantes: https://baymard.com/research/ecommerce-product-lists
- Berkeley Digital Accessibility — cards precisam ser acessíveis, com estrutura semântica, foco de teclado claro, texto alternativo e área clicável previsível: https://dap.berkeley.edu/websites/accessibility-guidance-developers/card-ui-component
- Material Components / Material 3 — busca deve ser uma área persistente e clara quando encontrar conteúdo é uma tarefa principal: https://github.com/material-components/material-components-android/blob/master/docs/components/Search.md
- Android Developers / Material navigation — em layouts médios ou largos, padrões como navigation rail e ações persistentes ajudam a organizar destinos principais e comandos importantes: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns

## Princípios para o Rift Guia

- **Menos ruído por tela**: cada página deve ter uma ação principal clara.
- **Busca sempre previsível**: a biblioteca e o deck builder devem deixar explícito onde a busca atua e quantos resultados existem.
- **Cards escaneáveis**: nome, tipo, cor/domínio, custo e status de tradução devem aparecer de forma consistente.
- **Detalhe sob demanda**: textos longos, regras e traduções completas devem ficar no modal, no hover ou em painéis expansíveis.
- **Orientação para iniciantes**: termos de TCG e Riftbound devem aparecer com explicações curtas, exemplos e links internos.
- **Feedback constante**: carregamento, filtros ativos, seleção de cartas, limite de deck e erros de importação precisam aparecer com mensagens diretas.
- **Acessibilidade como requisito**: foco visível, contraste, navegação por teclado e labels corretos devem fazer parte do design.

## Task list proposta

### Fase 1 — Organização visual e base de design

- [ ] Criar tokens de design em CSS: cores, espaçamentos, raios, sombras, tipografia e tamanhos de cards.
- [ ] Revisar a paleta atual para melhorar contraste e hierarquia sem perder o clima escuro de Riftbound.
- [ ] Criar variações de botões: primário, secundário, neutro, perigo, link e botão compacto.
- [ ] Criar padrões de painel: painel simples, painel destacado, painel lateral, alerta e card de informação.
- [ ] Padronizar estados visuais: hover, focus, selected, disabled, loading e erro.
- [ ] Definir breakpoints para desktop, tablet e celular.
- [ ] Revisar espaçamentos verticais da home, biblioteca e deck builder.

### Fase 2 — Biblioteca de cartas

- [ ] Reorganizar o topo da biblioteca com busca persistente, contador de resultados e filtros ativos.
- [ ] Separar filtros em grupos: tipo, domínio, custo, might, set, status de tradução e texto de regras.
- [ ] Exibir filtros ativos como chips removíveis.
- [ ] Adicionar ordenação: nome, custo, might, tipo, set e número de coleção.
- [ ] Melhorar os cards da biblioteca com layout consistente para cartas verticais e battlefields horizontais.
- [ ] Adicionar opção de visualização: grade compacta, grade grande e lista detalhada.
- [ ] Melhorar estado vazio com sugestões de ação, por exemplo “limpar filtros” ou “buscar por outro termo”.
- [ ] Adicionar skeleton/loading quando o catálogo estiver carregando.
- [ ] Criar favoritos ou “cartas marcadas” para revisão posterior.

### Fase 3 — Modal e páginas compartilháveis de cartas

- [ ] Melhorar o modal da carta com abas: Português, Original, Dados, Notas.
- [ ] Destacar ícones de custo, poder, might e keywords dentro da descrição.
- [ ] Exibir legalidade/contexto: tipo, domínios, set, número, artista e variantes.
- [ ] Adicionar botão “Copiar link da carta”.
- [ ] Garantir que URL com ID abra o modal corretamente em todas as páginas.
- [ ] Adicionar navegação próxima/anterior dentro dos resultados filtrados.
- [ ] Permitir abrir a imagem em tamanho maior.

### Fase 4 — Aprendizado e conteúdo para iniciantes

- [ ] Transformar o glossário em uma página própria com busca e categorias.
- [ ] Adicionar exemplos práticos para cada termo: Empower, Flow, Burn, Copy, Token Unit, Temporary, Shield, Tank etc.
- [ ] Criar uma trilha “primeira partida” com passos simples.
- [ ] Criar uma página “Como montar um deck” com exemplos visuais e checklist.
- [ ] Criar cartões de estratégia: Aggro, Tempo, Midrange, Valor/Controle, Combo e Topo de curva.
- [ ] Adicionar exemplos de turnos e erros comuns para cada estilo.
- [ ] Adicionar links internos entre termos do glossário e textos de cartas.

### Fase 5 — Deck builder guiado

- [ ] Melhorar o layout em etapas com uma barra de progresso mais clara.
- [ ] Fixar a prévia do deck em desktop e transformar em gaveta/aba no mobile.
- [ ] Mostrar limites do deck com feedback visual: correto, incompleto, excesso e atenção.
- [ ] Adicionar filtros específicos dentro de cada etapa do deck builder.
- [ ] Melhorar sugestões de cartas com motivo curto: “sinergiza com fichas”, “protege campo”, “ativa Flow”.
- [ ] Adicionar comparação rápida entre cartas candidatas.
- [ ] Permitir marcar cartas como “considerando” antes de adicionar ao deck.
- [ ] Adicionar validação de regras do deck: lenda, champion, 3 battlefields, 40 main deck, 12 runas, limites de cópias e side deck.
- [ ] Permitir salvar múltiplos decks no navegador.
- [ ] Criar tela “Meus decks” com cards, data de edição e ações rápidas.

### Fase 6 — Sugestões e IA

- [ ] Separar sugestões em base local editável: lendas, champion units, battlefields, cartas-chave, combos e fraquezas.
- [ ] Criar um painel “Por que essa carta?” no deck builder.
- [ ] Gerar sugestões contextuais conforme a etapa atual do deck.
- [ ] Permitir que o usuário escreva o próprio guia e salve junto com o deck.
- [ ] Adicionar modo “revisar meu deck”: análise de curva, baixa quantidade de unidades, poucos spells, falta de interação etc.
- [ ] Preparar integração opcional com IA para gerar comentários, mantendo fallback local.

### Fase 7 — Importação, exportação e interoperabilidade

- [ ] Melhorar o parser de listas com mensagens por linha mais claras.
- [ ] Aceitar formatos comuns: “3x Nome”, “3 Nome”, seções em inglês e português.
- [ ] Exportar em formatos compatíveis com RiftAtlas/LigarRiftbound quando possível.
- [ ] Adicionar preview antes de importar para não sobrescrever o deck atual sem querer.
- [ ] Permitir baixar JSON completo do deck com guia e notas.
- [ ] Adicionar botão para copiar lista para a área de transferência.

### Fase 8 — Acessibilidade e qualidade

- [ ] Fazer auditoria de contraste em tema escuro.
- [ ] Garantir foco visível em cards, botões, filtros e modais.
- [ ] Revisar labels de inputs, botões de ícone e imagens.
- [ ] Testar navegação por teclado no modal, biblioteca e deck builder.
- [ ] Garantir que tooltips/hover tenham alternativa por foco ou clique.
- [ ] Reduzir dependência de cor para comunicar seleção, erro ou recomendação.
- [ ] Adicionar testes para parser, deduplicação, filtros e cálculos de estatísticas.

### Fase 9 — Performance e dados

- [ ] Revisar tamanho do bundle e dividir rotas com lazy loading.
- [ ] Considerar virtualização na biblioteca se a lista crescer muito.
- [ ] Otimizar imagens com lazy loading, placeholders e tamanhos consistentes.
- [ ] Adicionar versão do snapshot do catálogo e indicador de atualização.
- [ ] Criar comando de validação dos JSONs de cartas, traduções e sugestões.
- [ ] Evitar duplicatas por `riftbound_id` em todas as listas públicas.

## Ideias de UI/UX para o redesign

### Estrutura geral

- Header mais compacto com logo, navegação principal e status do catálogo.
- Navegação principal com três destinos fortes: Biblioteca, Deck Builder e Aprenda.
- Página inicial mais orientada à ação: “Buscar carta”, “Montar deck”, “Aprender regras”.
- Usar cards grandes para jornadas, não para todo tipo de conteúdo.
- Criar um painel lateral reutilizável para estatísticas, sugestões e detalhes.

### Biblioteca

- Busca grande e fixa no topo da área de conteúdo.
- Filtros como chips logo abaixo da busca para uso rápido.
- Filtros avançados recolhíveis para não poluir a tela.
- Cards com imagem, nome traduzido, nome original menor, tipo/domínio e custo.
- Hover com prévia expandida e clique abrindo modal.
- Alternar entre “visual” e “lista” para usuários que querem escanear texto.

### Deck builder

- Etapas em formato wizard com progresso: Lenda → Champion → Battlefields → Main → Side → Guia.
- Cada etapa deve ter uma explicação curta do que o usuário precisa fazer.
- Sugestões aparecem próximas da decisão atual, não escondidas no fim da página.
- Prévia do deck com agrupamento claro e contadores por seção.
- Estatísticas com gráficos simples e alertas textuais: “poucas unidades baixas”, “curva muito alta”, “faltam battlefields”.
- Botão primário muda conforme a etapa: “Escolher lenda”, “Adicionar ao main”, “Exportar deck”.

### Aprenda

- Conteúdo em blocos curtos com exemplos.
- Glossário pesquisável, com termos em inglês e português.
- Cards de estratégia com “quando usar”, “como vencer”, “fraquezas” e “cartas comuns”.
- Páginas de lendas com plano de jogo, mulligan, battlefields recomendados e exemplos.

### Visual

- Manter tema escuro, mas aumentar contraste entre fundo, painel e card.
- Usar acento dourado/laranja apenas para ação primária ou destaque importante.
- Usar verde/azul para sucesso/recomendação e vermelho apenas para erro/risco.
- Melhorar hierarquia tipográfica: títulos mais fortes, textos auxiliares menores e menos saturados.
- Padronizar ícones dos recursos do jogo em todos os lugares.
- Evitar cards com alturas muito instáveis em grids principais; deixar texto longo para modal/hover.

## Priorização sugerida

### Próxima sprint curta

1. Criar tokens de design e padronizar botões/painéis.
2. Melhorar topo da Biblioteca com busca, filtros ativos e ordenação.
3. Refinar cards da Biblioteca e do Deck Builder.
4. Melhorar modal da carta com abas e imagem maior.
5. Fazer auditoria de acessibilidade básica.

### Depois da sprint curta

1. Página própria do glossário.
2. Tela “Meus decks”.
3. Validação completa de regras do deck.
4. Sugestões contextuais mais ricas no deck builder.
5. Lazy loading e virtualização se a performance pedir.

## Perguntas para decidir antes do redesign

- O site deve parecer mais “Riot/game companion” ou mais “ferramenta técnica de deck builder”?
- A biblioteca deve priorizar imagem grande ou leitura rápida de texto?
- O deck builder deve guiar iniciantes passo a passo ou permitir modo avançado mais livre?
- Você quer que a home seja uma landing page bonita ou uma página funcional com busca imediata?
- O design deve continuar 100% dark mode ou também ter tema claro no futuro?
