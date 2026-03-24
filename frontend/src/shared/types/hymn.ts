/**
 * Type definitions for hymns and hymnbooks.
 */

/**
 * A single hymn with verses.
 */
export interface Hymn {
  number: number;
  title: string;
  verses: string[];
}

/**
 * A collection of hymns.
 */
export interface Hymnbook {
  id?: string;
  name: string;
  hymns: Hymn[];
}

/**
 * A saved/bookmarked hymn.
 */
export interface SavedHymn {
  hymnbookId: string;
  hymnbookName: string;
  hymn: Hymn;
}

/**
 * Search result for hymns API.
 */
export interface HymnSearchResult {
  hymns: Hymn[];
  total: number;
}
