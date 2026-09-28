# Rift Guia React

Recriação em React + TypeScript do Rift Guia, usando um catálogo local em JSON.

## Rodar localmente

```bash
npm install
npm run dev
```

O app carrega `public/data/cards.json` e `public/data/translations.pt-BR.json`. Ao abrir a página, ele não consulta a API do Riftcodex; as imagens continuam vindo das URLs originais das cartas.

## Publicar

```bash
npm run build
```

Publique a pasta `dist` gerada pelo Vite em qualquer hospedagem estática.

## Atualizar dados

```bash
npm run sync:cards
npm run translations:worklist
```

As traduções pessoais e decks criados pelo usuário continuam salvos apenas no navegador.
