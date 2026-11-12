import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { loadCurated, type LibraryProgram } from '../../lib/library';
import { ONB_GOALS, ONB_SPORTS, buildWeek, legacyPlace, placesOf, sportsWithPrograms } from '../../lib/plans/weekBuilder';
import type { IconName } from '../../data/icons';
import type { ProfileSetup, TrainingFocus } from '../../types';

// The one place to change your training profile after onboarding (Profile ->
// Goals & schedule). Same sports, goals and week engine as onboarding; Save
// rebuilds the week from today (past days stay) and refreshes For you.

const LEVELS: { id: ProfileSetup['level']; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];
const PLACES: { id: 'gym' | 'home' | 'outdoor'; label: string; icon: IconName }[] = [
  { id: 'gym', label: 'Gym', icon: 'dumbbell' },
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'outdoor', label: 'Outdoors', icon: 'run' },
];
const KIT = ['Barbell', 'Dumbbells', 'Kettlebell', 'Bands', 'Pull-up bar', 'Bike / trainer', 'Pool', 'Running track', 'Rower', 'Treadmill', 'Skipping rope', 'Medicine ball'];

// Older profiles (pre-redesign) only have `focus` + old goal labels: seed
// the editor from those so it opens on something sensible.
const FOCUS_TO_SPORT: Record<TrainingFocus, string> = { gym: 'gym', running: 'run', swim: 'swim', ride: 'ride', hybrid: 'hybrid' };
const OLD_GOAL: Record<string, string> = { 'Build strength': 'strength', 'Muscle gain': 'muscle', 'Lose fat': 'fat-loss', Endurance: 'endurance', 'General fitness': 'general-fitness', 'Aerobic fitness': 'endurance' };

function Chip({ on, onClick, icon, colorVar, children }: { on: boolean; onClick: () => void; icon?: IconName; colorVar?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={`type-chip${on ? ' active' : ''}`} aria-pressed={on} onClick={onClick}>
      {icon && <Icon name={icon} style={{ width: 14, height: 14, color: on ? undefined : colorVar ? `var(${colorVar})` : undefined }} />}
      {children}
    </button>
  );
}

function Seg<T extends string | number>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="tp-seg">
      {options.map((o) => (
        <button key={String(o.id)} type="button" className={value === o.id ? 'on' : ''} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TrainingProfileEditor() {
  const profile = useAppStore((s) => s.profile)!;
  const applyTrainingSetup = useAppStore((s) => s.applyTrainingSetup);
  const openForYou = useAppStore((s) => s.openForYou);
  const saved = profile.setup?.mode === 'plan' ? profile.setup : undefined;

  const initial = useMemo<Omit<ProfileSetup, 'mode'>>(
    () =>
      (saved ? { ...saved, places: placesOf(saved) } : null) ?? {
        sport: FOCUS_TO_SPORT[profile.focus] ?? 'gym',
        extraSports: [],
        goals: [...new Set(profile.goal.map((g) => OLD_GOAL[g]).filter(Boolean))].slice(0, 2),
        level: profile.experience === 'Beginner' ? 'beginner' : profile.experience === 'Advanced' ? 'advanced' : 'intermediate',
        days: parseInt(profile.availability, 10) || 4,
        sessionMinutes: 45,
        place: 'gym',
        places: ['gym'],
        kit: [],
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saved],
  );
  const [d, setD] = useState(initial);
  useEffect(() => setD(initial), [initial]);
  const [programs, setPrograms] = useState<LibraryProgram[] | null>(null);
  const [busy, setBusy] = useState(false);
  // Shown after a plain save: the week is untouched, For you has new picks.
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    loadCurated('program').then((p) => setPrograms(p as LibraryProgram[]));
  }, []);

  const sports = programs ? sportsWithPrograms(programs) : ONB_SPORTS;
  const changed = !saved || JSON.stringify(d) !== JSON.stringify(initial);
  const toggle = (list: string[], id: string, max: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id].slice(-max));

  // Save = profile only (For you updates, the week stays as it is).
  // Rebuild = also replace the week from today with recommended programs.
  function save(rebuild: boolean) {
    if (d.goals.length === 0 || (rebuild && !programs)) return;
    setBusy(true);
    const setup: ProfileSetup = { mode: 'plan', ...d };
    applyTrainingSetup(setup, rebuild && programs ? buildWeek(programs, setup) : null);
    setBusy(false);
    setSavedNote(!rebuild);
  }

  return (
    <div className="card tp">
      <div className="tp-label">Main sport</div>
      <div className="feed-filters lib-chips tp-row">
        {sports.map((s) => (
          <Chip key={s.id} on={d.sport === s.id} icon={s.icon} colorVar={s.colorVar} onClick={() => setD({ ...d, sport: s.id, extraSports: d.extraSports.filter((x) => x !== s.id) })}>
            {s.label}
          </Chip>
        ))}
      </div>

      <div className="tp-label">
        Also do <span>up to 3</span>
      </div>
      <div className="feed-filters lib-chips tp-row">
        {sports
          .filter((s) => s.id !== d.sport)
          .map((s) => (
            <Chip key={s.id} on={d.extraSports.includes(s.id)} icon={s.icon} colorVar={s.colorVar} onClick={() => setD({ ...d, extraSports: toggle(d.extraSports, s.id, 3) })}>
              {s.label}
            </Chip>
          ))}
      </div>

      <div className="tp-label">
        Goals <span>up to 2</span>
      </div>
      <div className="feed-filters lib-chips tp-row">
        {ONB_GOALS.map((g) => (
          <Chip key={g.id} on={d.goals.includes(g.id)} icon={g.icon} colorVar={g.colorVar} onClick={() => setD({ ...d, goals: toggle(d.goals, g.id, 2) })}>
            {g.label}
          </Chip>
        ))}
      </div>

      <div className="tp-label">Level</div>
      <Seg options={LEVELS} value={d.level} onChange={(level) => setD({ ...d, level })} />

      <div className="tp-label">Days a week</div>
      <Seg options={[2, 3, 4, 5, 6].map((n) => ({ id: n, label: String(n) }))} value={d.days} onChange={(days) => setD({ ...d, days })} />
      <div className="tp-label">Session length</div>
      <Seg options={[20, 30, 45, 60].map((n) => ({ id: n, label: n === 60 ? "60+'" : `${n}'` }))} value={d.sessionMinutes} onChange={(sessionMinutes) => setD({ ...d, sessionMinutes })} />

      <div className="tp-label">
        Where you train <span>pick any</span>
      </div>
      <div className="feed-filters lib-chips tp-row">
        {PLACES.map((p) => {
          const on = (d.places ?? []).includes(p.id);
          return (
            <Chip
              key={p.id}
              on={on}
              icon={p.icon}
              onClick={() => {
                const next = on ? (d.places ?? []).filter((x) => x !== p.id) : [...(d.places ?? []), p.id];
                if (next.length === 0) return; // at least one
                setD({ ...d, places: next, place: legacyPlace(next) });
              }}
            >
              {p.label}
            </Chip>
          );
        })}
      </div>

      <div className="tp-label">Kit you have</div>
      <div className="feed-filters lib-chips tp-row">
        {KIT.map((k) => (
          <Chip key={k} on={d.kit.includes(k)} onClick={() => setD({ ...d, kit: toggle(d.kit, k, 99) })}>
            {k}
          </Chip>
        ))}
      </div>

      <div className="tp-note">
        <Icon name="info" /> Save updates your For you recommendations and leaves your week as it is. Rebuild also replaces your week from today with recommended programs.
      </div>
      <button
        className="btn btn-primary"
        disabled={!changed || busy || d.goals.length === 0}
        onClick={() => {
          save(false);
        }}
      >
        <Icon name="check" style={{ width: 16, height: 16 }} /> {saved && !changed ? 'Saved' : 'Save profile'}
      </button>
      {savedNote && !changed && (
        <div className="tp-saved">
          <span>Saved. Check For you in the Library for programs recommended for your profile.</span>
          <button type="button" className="link-btn" onClick={openForYou}>
            View For you <Icon name="chevron" style={{ width: 12, height: 12 }} />
          </button>
        </div>
      )}
      <button
        className="btn btn-ghost"
        style={{ marginTop: 8 }}
        disabled={busy || !programs || d.goals.length === 0}
        onClick={() => {
          if (window.confirm('Rebuild your week from today with recommended programs? Past days stay as they are.')) save(true);
        }}
      >
        <Icon name="rotate" style={{ width: 15, height: 15 }} /> Save &amp; rebuild my week
      </button>
      {d.goals.length === 0 && <div className="tp-hint">Pick at least one goal.</div>}
    </div>
  );
}
