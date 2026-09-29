import React from 'react';
import type { RiftboundCard, TranslationFile, TranslationMap } from '../types';
import { snapshotDate, validateTranslations } from '../lib/cards';
import {
  fetchBundledCatalog,
  fetchRiftCodexCatalog,
  isCatalogFresh,
  readCachedCatalog,
  writeCachedCatalog,
} from '../services/cardCatalog';

export function useCatalog() {
  const [cards, setCards] = React.useState<RiftboundCard[]>([]);
  const [initialTranslations, setInitialTranslations] = React.useState<TranslationMap>({});
  const [status, setStatus] = React.useState('Abrindo catalogo local...');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const mounted = React.useRef(false);
  const refreshController = React.useRef<AbortController | null>(null);

  const describeCatalog = React.useCallback((fetchedAt: string, source: string) => {
    return `Catalogo ${source}, atualizado em ${snapshotDate(fetchedAt)}.`;
  }, []);

  const refreshCatalog = React.useCallback(async () => {
    if (refreshController.current) return;
    const controller = new AbortController();
    refreshController.current = controller;
    setIsRefreshing(true);
    setStatus('Consultando o Riftcodex...');
    try {
      const snapshot = await fetchRiftCodexCatalog(controller.signal, (loaded, total) => {
        if (mounted.current) setStatus(`Atualizando cartas pelo Riftcodex: pagina ${loaded} de ${total}...`);
      });
      try {
        await writeCachedCatalog(snapshot);
      } catch {
        // O catalogo recebido continua utilizavel mesmo se o navegador negar o IndexedDB.
      }
      if (!mounted.current) return;
      setCards(snapshot.cards);
      setStatus(describeCatalog(snapshot.fetchedAt, 'no cache do navegador'));
    } catch (error) {
      if (!mounted.current || controller.signal.aborted) return;
      const detail = error instanceof Error ? error.message : 'erro desconhecido';
      setStatus(`Nao foi possivel atualizar pelo Riftcodex (${detail}). O catalogo atual continua disponivel.`);
    } finally {
      if (refreshController.current === controller) refreshController.current = null;
      if (mounted.current) setIsRefreshing(false);
    }
  }, [describeCatalog]);

  React.useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();

    async function load() {
      let translations: TranslationMap = {};
      try {
        const translationsResponse = await fetch('/data/translations.pt-BR.json', { cache: 'force-cache', signal: controller.signal });
        if (translationsResponse.ok) {
          const file = (await translationsResponse.json()) as TranslationFile;
          translations = validateTranslations(file.translations);
        }
      } catch {
        translations = {};
      }
      if (mounted.current) setInitialTranslations(translations);

      try {
        const cached = await readCachedCatalog();
        const snapshot = cached || await fetchBundledCatalog(controller.signal);
        if (!mounted.current) return;
        setCards(snapshot.cards);
        setStatus(describeCatalog(snapshot.fetchedAt, cached ? 'no cache do navegador' : 'no catalogo inicial'));

        if (!cached || !isCatalogFresh(cached)) {
          window.setTimeout(() => {
            if (mounted.current) void refreshCatalog();
          }, 100);
        }
      } catch (error) {
        if (!mounted.current || controller.signal.aborted) return;
        const detail = error instanceof Error ? error.message : 'erro desconhecido';
        setStatus(`Nao foi possivel abrir o catalogo inicial (${detail}). Tentando o Riftcodex...`);
        window.setTimeout(() => {
          if (mounted.current) void refreshCatalog();
        }, 100);
      }
    }

    void load();
    return () => {
      mounted.current = false;
      controller.abort();
      refreshController.current?.abort();
    };
  }, [describeCatalog, refreshCatalog]);

  return { cards, initialTranslations, status, setStatus, isRefreshing, refreshCatalog };
}
