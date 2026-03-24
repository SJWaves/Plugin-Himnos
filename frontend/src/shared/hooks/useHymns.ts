/**
 * Custom hooks for hymn operations.
 */

import { useState, useCallback, useMemo } from 'react';
import { hymnbooks, searchHymns, getHymnByNumber } from '../../services/hymns';
import type { Hymn, SavedHymn } from '../types';
import { safeGetItem, safeSetItem, safeJsonParse } from '../utils';
import { STORAGE_KEYS, DEFAULT_HYMNBOOK_ID } from '../constants';

/**
 * Hook for managing hymn selection and search.
 */
export function useHymns(initialHymnbookId: string = DEFAULT_HYMNBOOK_ID) {
  const [hymnbookId, setHymnbookId] = useState(initialHymnbookId);
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const hymnbook = useMemo(() => hymnbooks[hymnbookId], [hymnbookId]);

  const searchResults = useMemo(() => {
    return searchHymns(hymnbookId, searchQuery);
  }, [hymnbookId, searchQuery]);

  const selectHymn = useCallback((hymn: Hymn, bookId?: string) => {
    if (bookId) setHymnbookId(bookId);
    setSelectedHymn(hymn);
    setSearchQuery('');
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedHymn(null);
  }, []);

  return {
    hymnbookId,
    setHymnbookId,
    hymnbook,
    hymnbooks,
    selectedHymn,
    selectHymn,
    clearSelection,
    searchQuery,
    setSearchQuery,
    searchResults,
    getHymnByNumber: (number: number) => getHymnByNumber(hymnbookId, number),
  };
}

/**
 * Hook for managing saved/bookmarked hymns.
 */
export function useSavedHymns() {
  const [savedHymns, setSavedHymns] = useState<SavedHymn[]>(() => {
    const stored = safeGetItem(STORAGE_KEYS.SAVED_HYMNS);
    return safeJsonParse(stored, []);
  });

  const saveHymn = useCallback((hymnbookId: string, hymnbookName: string, hymn: Hymn) => {
    setSavedHymns((prev) => {
      const exists = prev.some(
        (sh) => sh.hymnbookId === hymnbookId && sh.hymn.number === hymn.number
      );
      if (exists) return prev;

      const updated = [...prev, { hymnbookId, hymnbookName, hymn }];
      safeSetItem(STORAGE_KEYS.SAVED_HYMNS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSavedHymn = useCallback((hymnbookId: string, hymnNumber: number) => {
    setSavedHymns((prev) => {
      const updated = prev.filter(
        (sh) => !(sh.hymnbookId === hymnbookId && sh.hymn.number === hymnNumber)
      );
      safeSetItem(STORAGE_KEYS.SAVED_HYMNS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isHymnSaved = useCallback(
    (hymnbookId: string, hymnNumber: number) => {
      return savedHymns.some(
        (sh) => sh.hymnbookId === hymnbookId && sh.hymn.number === hymnNumber
      );
    },
    [savedHymns]
  );

  const toggleSaveHymn = useCallback(
    (hymnbookId: string, hymnbookName: string, hymn: Hymn) => {
      if (isHymnSaved(hymnbookId, hymn.number)) {
        removeSavedHymn(hymnbookId, hymn.number);
      } else {
        saveHymn(hymnbookId, hymnbookName, hymn);
      }
    },
    [isHymnSaved, removeSavedHymn, saveHymn]
  );

  return {
    savedHymns,
    saveHymn,
    removeSavedHymn,
    isHymnSaved,
    toggleSaveHymn,
  };
}
