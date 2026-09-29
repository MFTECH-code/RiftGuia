# Rift Guia React

Recriação em React + TypeScript do Rift Guia.

## Rodar localmente

```bash
npm install
npm run dev
```

O React abre imediatamente o último catálogo salvo no IndexedDB do navegador. Na primeira visita, `public/data/cards.json` funciona como catálogo inicial e fallback offline. Quando o cache tem mais de 24 horas, o próprio app consulta as páginas da API do Riftcodex em segundo plano e atualiza o cache. O botão **Atualizar cartas** força uma nova sincronização.

As traduções vêm de `public/data/translations.pt-BR.json`. Imagens continuam sendo carregadas das URLs originais das cartas.

## Publicar

```bash
npm run build
```

Publique a pasta `dist` gerada pelo Vite em qualquer hospedagem estática.

## Atualizar traduções

```bash
npm run translations:worklist
```

As traduções pessoais e decks criados pelo usuário continuam salvos apenas no navegador.
