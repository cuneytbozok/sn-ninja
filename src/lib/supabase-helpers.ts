import { supabase } from './supabase';

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

// Add any non-search-history related functions below if needed 