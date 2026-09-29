import React from 'react';
import { BookOpen, CheckCircle2, Download, Flag, Gauge, Layers3, RefreshCw, Shield, Sparkles, Swords, Zap } from 'lucide-react';
import { GUIDE_SOURCE } from '../data';
import type { Guide, TranslateCard } from '../appTypes';
import type { RiftboundCard } from '../types';
import { download } from '../lib/download';
import { parseDeck, serializeDeck } from '../lib/deckParser';
import { DeckPreview } from '../components/DeckPreview';
import { ProblemList } from '../components/ProblemList';
import { GuidedDeckBuilder } from '../components/deck-builder/GuidedDeckBuilder';

interface DeckPageProps {
  cards: RiftboundCard[];
  guides: Guide[];
  translate: TranslateCard;
  onOpenCard: (card: RiftboundCard) => void;
}

export function DeckPage({ cards, guides, translate, onOpenCard }: DeckPageProps) {
  const [deckList, setDeckList] = React.useState('');
  const [deckName, setDeckName] = React.useState('Meu primeiro deck');
  const [deckPlan, setDeckPlan] = React.useState('');
  const [guideId, setGuideId] = React.useState('');

  const parsedDeck = React.useMemo(() => parseDeck(deckList, cards, translate), [cards, deckList, translate]);
  const selectedGuide = guides.find((guide) => guide.id === guideId);

  return (
    <section className="deck-layout">
      <div className="panel wide deck-building-guide">
        <div className="guide-header">
          <div>
            <p className="eyebrow">Como montar um deck</p>
            <h2>Comece pela lenda, depois construa o plano</h2>
          </div>
          <a href="https://playriftbound.com/en-us/news/rules-and-releases/deckbuilding-primer/" target="_blank" rel="noreferrer">
            Guia oficial
          </a>
        </div>

        <div className="deck-steps">
          <article>
            <BookOpen size={20} />
            <h3>1. Escolha a lenda</h3>
            <p>A lenda define os dominios do deck e a habilidade que fica ativa durante a partida. Ela e o ponto de partida do plano de jogo.</p>
          </article>
          <article>
            <Flag size={20} />
            <h3>2. Escolha o campeao</h3>
            <p>O Chosen Champion e a unidade que voce sempre tera acesso. Monte o deck para aproveitar essa garantia.</p>
          </article>
          <article>
            <Layers3 size={20} />
            <h3>3. Preencha o Main Deck</h3>
            <p>Use cartas dos dominios da lenda. Em construido, mire em 40 cartas e evite passar disso para comprar suas melhores cartas com mais frequencia.</p>
          </article>
          <article>
            <Sparkles size={20} />
            <h3>4. Ajuste runas e campos</h3>
            <p>Monte 12 runas e escolha 3 campos de batalha diferentes. Comece com 6/6 nas runas e ajuste conforme os custos de poder do deck.</p>
          </article>
        </div>

        <div className="deck-recipe">
          <div>
            <h3>Receita inicial para testar</h3>
            <ul>
              <li><CheckCircle2 size={16} /> 1 Chosen Champion e cartas que realmente aproveitam sua habilidade.</li>
              <li><CheckCircle2 size={16} /> Ate 3 copias das cartas centrais, incluindo assinaturas do campeao quando fizer sentido.</li>
              <li><CheckCircle2 size={16} /> 9 ou mais unidades pequenas para disputar campos cedo.</li>
              <li><CheckCircle2 size={16} /> 6 ou mais cartas interativas: remocao, truques de combate, protecao ou buffs.</li>
              <li><CheckCircle2 size={16} /> Um plano claro para vencer: pressionar cedo, controlar campos, criar uma unidade enorme ou finalizar em um turno forte.</li>
            </ul>
          </div>
          <div className="deck-ai-preview">
            <h3>Preparando o assistente de IA</h3>
            <p>Na proxima feature, ao selecionar uma lenda, o site podera sugerir pacotes de cartas, combos e ajustes usando esta mesma estrutura: lenda, campeao, sinergias, curva, runas e campos.</p>
          </div>
        </div>

        <div className="deck-strategies">
          <h3>Escolha uma estrategia antes de escolher todas as cartas</h3>
          <p className="meta-note">No meta competitivo, a maioria dos decks parte de tres pilares: pressao, tempo e midrange. Combo, valor, spells ou equipamentos costumam ser sabores desses planos, nao categorias totalmente separadas.</p>
          <div>
            <article>
              <Swords size={20} />
              <h4>Pressao / Aggro</h4>
              <p>Quer ocupar campos cedo, colocar muitas unidades na mesa e pontuar antes que cartas caras importem. Procure custos baixos, unidades prontas, buffs baratos, dano e cartas que convertem conquista em vantagem.</p>
              <div className="strategy-example">
                <strong>Exemplo: Jinx descarte aggro</strong>
                <p>Esvazie a mao com unidades baratas e custos de descarte para ativar a compra da lenda. A sinergia e transformar a propria falta de cartas em combustivel para continuar atacando.</p>
              </div>
              <span>Cuidado: precisa fechar ou criar vantagem antes que o oponente estabilize.</span>
            </article>
            <article>
              <Zap size={20} />
              <h4>Tempo / interacao</h4>
              <p>Quer ficar sempre um passo a frente: baixa uma ameaca eficiente e usa truques, movimento, stun, bounce ou remocao barata para vencer combates e desperdiçar o turno adversario.</p>
              <div className="strategy-example">
                <strong>Exemplo: Akali Retreat Tempo</strong>
                <p>Force o oponente a se comprometer com um campo, depois use movimento e retorno para mudar a luta. A sinergia e transformar cada reposicionamento em carta, forca, dano ou melhor distribuicao de unidades.</p>
              </div>
              <span>Cuidado: se voce gastar respostas sem ganhar campo, pode ficar sem pressao.</span>
            </article>
            <article>
              <Gauge size={20} />
              <h4>Midrange / valor</h4>
              <p>Joga bem em varios turnos: troca recursos, usa unidades mais eficientes e vence quando suas cartas medias e caras geram mais impacto que as respostas do oponente.</p>
              <div className="strategy-example">
                <strong>Exemplo: Azir soldados e equipamentos</strong>
                <p>Gere Soldados de Areia repetidamente, equipe-os e transforme presenca de mesa em vantagem. A sinergia e criar muitas pecas pequenas que ficam relevantes com equipamentos e efeitos de valor.</p>
              </div>
              <span>Cuidado: precisa equilibrar curva baixa, interacao e cartas fortes para nao comprar so topo de curva.</span>
            </article>
            <article>
              <Shield size={20} />
              <h4>Lento / topo de curva</h4>
              <p>Aceita jogar mais devagar para chegar em cartas de alto impacto. Funciona melhor como Midrange de valor: defesa cedo, compra, remocao e finalizadores que dominam campos no fim do jogo.</p>
              <div className="strategy-example">
                <strong>Exemplo: Nasus Flow Value</strong>
                <p>Use Burn para encher o descarte e Flow para jogar cartas dali de novo. A sinergia real e repetivel: preparar o descarte, recuperar recursos e vencer porque suas melhores cartas valem duas vezes.</p>
              </div>
              <span>Cuidado: precisa sobreviver aos primeiros turnos e nao pode ter cartas caras demais.</span>
            </article>
          </div>
        </div>
      </div>

      <GuidedDeckBuilder cards={cards} translate={translate} onOpenCard={onOpenCard} />

      <div className="panel">
        <p className="eyebrow">Da lista para a mesa</p>
        <h2>Importe um deck</h2>
        <label>
          Nome do deck
          <input value={deckName} onChange={(event) => setDeckName(event.target.value)} />
        </label>
        <label>
          Lista de cartas
          <textarea value={deckList} onChange={(event) => setDeckList(event.target.value)} rows={14} placeholder={'Legend\n1 Jinx, Loose Cannon\n\nMain Deck\n3 Blazing Scorcher\n3 Flame Chompers\n\nRunes\n6 Fury Rune'} />
        </label>
        <div className="actions">
          <button onClick={() => download(`${deckName || 'rift-guia-deck'}.txt`, serializeDeck(parsedDeck.rows), 'text/plain')} disabled={!parsedDeck.rows.length || Boolean(parsedDeck.errors.length)}>
            <Download size={16} /> Exportar lista resolvida
          </button>
        </div>
        {parsedDeck.errors.length > 0 && <ProblemList problems={parsedDeck.errors} />}
        {parsedDeck.notices.map((notice) => <p className="help" key={notice}>{notice}</p>)}
      </div>

      <div className="panel">
        <h2>Previa do deck</h2>
        <p className="help">{parsedDeck.rows.reduce((sum, row) => sum + row.quantity, 0)} cartas resolvidas em {parsedDeck.rows.length} entradas.</p>
        <DeckPreview rows={parsedDeck.rows} translate={translate} onOpen={onOpenCard} />
      </div>

      <div className="panel wide">
        <h2>Plano de jogo</h2>
        <div className="guide-row">
          <select value={guideId} onChange={(event) => setGuideId(event.target.value)}>
            <option value="">Escolher guia ou lenda</option>
            {guides.map((guide) => <option key={guide.id} value={guide.id}>{guide.name}</option>)}
          </select>
          <button disabled={!selectedGuide} onClick={() => selectedGuide && setDeckPlan((value) => `${value}${value ? '\n\n' : ''}${selectedGuide.name}\n${selectedGuide.text}${selectedGuide.kind === 'manual' ? `\nFonte: ${GUIDE_SOURCE}` : ''}`)}>
            <RefreshCw size={16} /> Adicionar ao plano
          </button>
        </div>
        {selectedGuide && <p className="guide-preview">{selectedGuide.text}</p>}
        <textarea value={deckPlan} onChange={(event) => setDeckPlan(event.target.value)} rows={10} placeholder="Objetivo do deck, mao inicial, primeiros turnos, combinacoes e ajustes apos jogar..." />
      </div>
    </section>
  );
}
