/**
 * Custom hooks for display state management.
 */

import { useState, useCallback, useEffect } from 'react';
import { HymnBroadcaster, getStoredConfig, getCurrentDisplay } from '../../services/broadcast';
import type { DisplayConfig, HymnDisplay, Hymn } from '../types';
import { DEFAULT_CONFIG } from '../types';

/**
 * Hook for managing display state and broadcasting.
 */
export function useDisplay() {
  const [config, setConfig] = useState<DisplayConfig>(getStoredConfig);
  const [currentDisplay, setCurrentDisplay] = useState<HymnDisplay | null>(getCurrentDisplay);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
  const [focusedVerseIndex, setFocusedVerseIndex] = useState<number | null>(null);
  const [broadcaster] = useState(() => new HymnBroadcaster());

  // Sync activeVerseIndex with currentDisplay
  useEffect(() => {
    if (currentDisplay) {
      setActiveVerseIndex(currentDisplay.verseIndex);
    } else {
      setActiveVerseIndex(null);
    }
  }, [currentDisplay]);

  const updateConfig = useCallback(
    (updates: Partial<DisplayConfig>) => {
      setConfig((prev) => {
        const updated = { ...prev, ...updates };
        broadcaster.sendConfig(updated);
        return updated;
      });
    },
    [broadcaster]
  );

  const showVerse = useCallback(
    (
      hymnbookId: string,
      hymn: Hymn,
      verseIndex: number,
      updateFocus: boolean = true
    ) => {
      const clampedIndex = Math.max(0, Math.min(verseIndex, hymn.verses.length - 1));

      const display: HymnDisplay = {
        hymnbookId,
        hymnNumber: hymn.number,
        hymnTitle: hymn.title,
        verseIndex: clampedIndex,
        verseText: hymn.verses[clampedIndex],
        config,
      };

      broadcaster.sendDisplay(display);
      setCurrentDisplay(display);
      setActiveVerseIndex(clampedIndex);

      if (updateFocus) {
        setFocusedVerseIndex(clampedIndex);
      }
    },
    [broadcaster, config]
  );

  const clearDisplay = useCallback(() => {
    broadcaster.clearDisplay();
    setCurrentDisplay(null);
    setActiveVerseIndex(null);
  }, [broadcaster]);

  const nextVerse = useCallback(
    (hymn: Hymn, hymnbookId: string) => {
      if (activeVerseIndex === null) return;
      
      const nextIndex = Math.min(activeVerseIndex + 1, hymn.verses.length - 1);
      if (nextIndex !== activeVerseIndex) {
        showVerse(hymnbookId, hymn, nextIndex);
      }
    },
    [activeVerseIndex, showVerse]
  );

  const previousVerse = useCallback(
    (hymn: Hymn, hymnbookId: string) => {
      if (activeVerseIndex === null) return;
      
      const prevIndex = Math.max(activeVerseIndex - 1, 0);
      if (prevIndex !== activeVerseIndex) {
        showVerse(hymnbookId, hymn, prevIndex);
      }
    },
    [activeVerseIndex, showVerse]
  );

  // Cleanup broadcaster on unmount
  useEffect(() => {
    return () => {
      broadcaster.close();
    };
  }, [broadcaster]);

  return {
    config,
    updateConfig,
    currentDisplay,
    activeVerseIndex,
    focusedVerseIndex,
    setFocusedVerseIndex,
    showVerse,
    clearDisplay,
    nextVerse,
    previousVerse,
    broadcaster,
  };
}

/**
 * Hook for listening to display updates (for Display page).
 */
export function useDisplayListener() {
  const [display, setDisplay] = useState<HymnDisplay | null>(getCurrentDisplay);
  const [config, setConfig] = useState<DisplayConfig>(getStoredConfig);

  useEffect(() => {
    const broadcaster = new HymnBroadcaster();

    // Get initial state
    const initialDisplay = getCurrentDisplay();
    if (initialDisplay) {
      setDisplay(initialDisplay);
      if (initialDisplay.config) {
        setConfig(initialDisplay.config);
      }
    }

    // Listen for updates
    broadcaster.onMessage((message) => {
      if (message.type === 'display') {
        const nextDisplay = message.data as HymnDisplay | null;
        setDisplay(nextDisplay);
        if (nextDisplay?.config) {
          setConfig(nextDisplay.config);
        }
      } else if (message.type === 'config') {
        setConfig(message.data as DisplayConfig);
      }
    });

    return () => {
      broadcaster.close();
    };
  }, []);

  return { display, config };
}
