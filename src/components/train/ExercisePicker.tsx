import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isExactCatalogName, loadExerciseCatalog, searchExercises, type CatalogData, type CatalogFilters } from '../../lib/exerciseCatalog';

type FilterTab = 'sport' | 'pattern' | 'muscle';
const TAB_LABEL: Record<FilterTab, string> = { sport: 'Sport', pattern: 'Movement', muscle: 'Muscle' };

interface ExercisePickerProps {
  open: boolean;
  initialQuery?: string;
  onClose: () => void;
  // fromList: picked one of the app's movements (gets its how-to picture); false = typed their own
  onPick: (name: string, fromList: boolean) => void;
}

// Full-screen exercise chooser for the program builder: search every movement the app already has (word
// match, so "db bench" finds Dumbbell Bench Press), narrow by sport / movement / muscle, or add your own
// name when it isn't there (saved as typed, no picture). Same full-screen pattern as food search.
export function ExercisePicker({ open, initialQuery = '', onClose, onPick }: ExercisePickerProps) {
  const [data, setData] = useState<CatalogData | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<FilterTab>('sport');
  const [filters, setFilters] = useState<CatalogFilters>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setFilters({});
    loadExerciseCatalog().then((d) => (d ? setData(d) : setFailed(true)));
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open, initialQuery]);

  const results = useMemo(() => (data ? searchExercises(data.exercises, query, filters).slice(0, 80) : []), [data, query, filters]);
  if (!open) return null;

  const typed = query.trim();
  const showCustom = !!typed && !(data && isExactCatalogName(data.exercises, typed));
  const options = data ? (tab === 'sport' ? data.sports : tab === 'pattern' ? data.patterns : data.muscles) : [];
  const active = filters[tab] ?? null;
  const anyFilter = !!(filters.sport || filters.pattern || filters.muscle);

  // "Add your own" sits under the matches when there are some (typing "db bench" shouldn't put the
  // custom option above Dumbbell Bench Press), and at the top when nothing matches.
  const customRow = (
    <button type="button" className="macro-search-row ex-picker-custom" onClick={() => onPick(typed, false)}>
      <span className="macro-search-name">+ Add &ldquo;{typed}&rdquo; as your own exercise</span>
      <span className="macro-search-meta">No picture</span>
    </button>
  );

  return createPortal(
    <div className="macro-search-overlay ex-picker">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Close exercise picker">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises, e.g. db bench"
          aria-label="Search exercises"
          autoComplete="off"
          enterKeyHint="done"
        />
      </div>

      <div className="ex-picker-filters">
        <div className="ex-picker-tabs" role="tablist" aria-label="Filter by">
          {(Object.keys(TAB_LABEL) as FilterTab[]).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {TAB_LABEL[t]}
              {filters[t] && <span className="ex-picker-tab-val">: {filters[t]}</span>}
            </button>
          ))}
          {anyFilter && (
            <button type="button" className="ex-picker-clear" onClick={() => setFilters({})}>
              Clear
            </button>
          )}
        </div>
        <div className="macro-meal-picker meal-filter ex-picker-chips" role="listbox" aria-label={`${TAB_LABEL[tab]} filter`}>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={active === o}
              className={active === o ? 'on' : ''}
              onClick={() => setFilters((f) => ({ ...f, [tab]: f[tab] === o ? null : o }))}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="macro-search-results">
        {showCustom && results.length === 0 && customRow}
        {failed && <div className="macro-search-hint">Couldn't load the exercise list - you can still add your own exercise.</div>}
        {!data && !failed && <div className="macro-search-hint">Loading exercises…</div>}
        {data && results.length === 0 && (
          <div className="macro-search-hint">
            No exercises match{typed ? ` "${typed}"` : ''}{anyFilter ? ' with these filters' : ''}.{typed ? ' Add it as your own exercise above.' : ''}
          </div>
        )}
        {results.map((e) => (
          <button type="button" className="macro-search-row" key={e.name} onClick={() => onPick(e.name, true)}>
            <span className="ex-picker-main">
              <span className="macro-search-name">{e.name}</span>
              <span className="ex-picker-sub">
                {[e.pattern, e.equip, e.primary.join(', ')].filter(Boolean).join(' · ')}
              </span>
            </span>
          </button>
        ))}
        {showCustom && results.length > 0 && customRow}
      </div>
    </div>,
    document.body,
  );
}
