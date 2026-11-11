import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { searchFoodSuggestions, type FoodSuggestion } from './macros';

interface FoodSearchOverlayProps {
  open: boolean;
  userId: string | null;
  initialQuery: string;
  onClose: () => void;
  onSelect: (s: FoodSuggestion) => void;
}

// A dedicated full-screen takeover for food search, not an inline dropdown
// under the text field - the Add Food sheet is itself a scrolling bottom
// sheet (overflow-y: auto), which clips any absolutely-positioned list
// the moment it extends past the currently-scrolled viewport. A real
// full-screen overlay has nowhere to get clipped.
export function FoodSearchOverlay({ open, userId, initialQuery, onClose, onSelect }: FoodSearchOverlayProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<FoodSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open || !userId) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setResults(await searchFoodSuggestions(userId, query));
    }, 250);
  }, [query, open, userId]);

  if (!open) return null;

  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Close search">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a food"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="macro-search-results">
        {query.trim().length < 2 ? (
          <div className="macro-search-hint">Type at least 2 characters to search your food log and our database.</div>
        ) : results.length === 0 ? (
          <div className="macro-search-hint">No matches yet - keep typing, or close this and enter it manually.</div>
        ) : (
          results.map((s, i) => (
            <button type="button" className="macro-search-row" key={`${s.name}-${i}`} onClick={() => { onSelect(s); onClose(); }}>
              <span className="macro-search-name">{s.name}</span>
              <span className="macro-search-meta">
                {s.source === 'history' ? 'your log' : s.source === 'generic' ? 'whole food' : 'database'}
              </span>
            </button>
          ))
        )}
      </div>
    </div>,
    document.body,
  );
}
