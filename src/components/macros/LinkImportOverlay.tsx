import { useState } from 'react';
import { createPortal } from 'react-dom';
import { importFoodFromUrl, type FoodFromLink } from '../../lib/recipeImport';

interface LinkImportOverlayProps {
  open: boolean;
  onClose: () => void;
  onImport: (food: FoodFromLink) => void;
}

// A dedicated full-screen takeover for pasting a link, same reasoning as
// FoodSearchOverlay/FavoritesOverlay in this same sheet: Add Food is itself
// a half-screen bottom sheet, too cramped to paste a URL into and then read
// back what was found before committing to it.
export function LinkImportOverlay({ open, onClose, onImport }: LinkImportOverlayProps) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setUrl('');
    setError(null);
    onClose();
  }

  async function run() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const f = await importFoodFromUrl(trimmed);
      if (!f.recognized) {
        setError("Couldn't tell what food that link is about - try the item's own page, or close this and enter it manually.");
        return;
      }
      onImport(f);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that link');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={handleClose} aria-label="Close link import">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Add from a link</div>
      </div>
      <div className="macro-search-results">
        <div
          className="sheet-opt"
          style={{ background: 'var(--surface-2)', borderRadius: 16, marginBottom: 10, flexDirection: 'column', alignItems: 'stretch', gap: 8, padding: 14 }}
        >
          <div className="t">Paste a link</div>
          <div className="s" style={{ marginBottom: 6 }}>A menu item, product page, meal-kit or recipe</div>
          <input
            autoFocus
            className="share-caption"
            style={{ height: 'auto', padding: '10px 12px' }}
            type="url"
            inputMode="url"
            placeholder="Paste link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="btn btn-primary" disabled={!url.trim() || busy} onClick={run}>
            {busy ? 'Reading…' : 'Get macros'}
          </button>
        </div>
        {error && <div className="macro-search-hint" style={{ color: 'var(--danger)' }}>{error}</div>}
      </div>
    </div>,
    document.body,
  );
}
