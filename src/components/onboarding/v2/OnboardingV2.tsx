import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../Icon';
import { TypeIconBadge } from '../../TypeIconBadge';
import { CharacterStep } from '../steps/CharacterStep';
import { useAppStore } from '../../../store/useAppStore';
import { loadCurated, type LibraryProgram } from '../../../lib/library';
import { ONB_GOALS, buildWeek, legacyPlace, onbSport, placesOf, rankForYou, sportsWithPrograms, type TrainingSetup } from '../../../lib/plans/weekBuilder';
import { buildRunPlan, fmtTime, parseTime, type RunDistanceId } from '../../../lib/plans/running';
import { startPlan } from '../../../lib/plans/activePlan';
import type { ProfileSetup } from '../../../types';

// Redesigned onboarding (design: design/onboarding-redesign/, approved
// 2026-11-12). Two paths chosen straight after Get started:
//   Build my plan: about -> sport -> extras -> goal -> level & week -> place -> character -> plan
//   Quick start:   about -> character -> "build your own path" (empty week)
// mode 'update' is the same flow for existing users ("Update your training
// profile"): sport through to the plan, no name/character, rebuilds from today.

type Step = 'welcome' | 'path' | 'about' | 'sport' | 'extras' | 'goal' | 'week' | 'place' | 'character' | 'plan' | 'diy';
const FULL: Step[] = ['welcome', 'path', 'about', 'sport', 'extras', 'goal', 'week', 'place', 'character', 'plan'];
const QUICK: Step[] = ['welcome', 'path', 'about', 'character', 'diy'];
const UPDATE: Step[] = ['sport', 'extras', 'goal', 'week', 'place', 'plan'];

const RUN_TARGETS: { id: string; label: string; distance: RunDistanceId; target: string | null; cur: string }[] = [
  { id: 'first5k', label: 'First 5K', distance: '5k', target: null, cur: '' },
  { id: '5k30', label: 'Break 30:00 5K', distance: '5k', target: '30:00', cur: '33:00' },
  { id: '5k25', label: 'Break 25:00 5K', distance: '5k', target: '25:00', cur: '30:00' },
  { id: '5k20', label: 'Break 20:00 5K', distance: '5k', target: '20:00', cur: '23:00' },
  { id: '10k50', label: '10K under 50:00', distance: '10k', target: '50:00', cur: '55:00' },
  { id: 'half2h', label: 'Half under 2:00:00', distance: 'half', target: '2:00:00', cur: '2:15:00' },
];
const KIT = ['Barbell', 'Dumbbells', 'Kettlebell', 'Bands', 'Pull-up bar', 'Bike / trainer', 'Pool', 'Running track'];
const PLACES: { id: 'gym' | 'home' | 'outdoor'; label: string; sub: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { id: 'gym', label: 'Gym', sub: 'Full equipment', icon: 'dumbbell' },
  { id: 'home', label: 'At home', sub: 'Dumbbells, bands or nothing', icon: 'home' },
  { id: 'outdoor', label: 'Outdoors', sub: 'Ovals, tracks, parks', icon: 'run' },
];
const LEVELS: { id: ProfileSetup['level']; label: string; sub: string; bars: number }[] = [
  { id: 'beginner', label: 'Beginner', sub: 'New, or back after a long break', bars: 1 },
  { id: 'intermediate', label: 'Intermediate', sub: 'Training regularly for 6+ months', bars: 2 },
  { id: 'advanced', label: 'Advanced', sub: 'Years in, chasing small gains', bars: 3 },
];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="onb2-kicker">{children}</div>;
}

export function OnboardingV2({ mode = 'new' }: { mode?: 'new' | 'update' }) {
  const draft = useAppStore((s) => s.onbDraft);
  const profile = useAppStore((s) => s.profile);
  const setOnbField = useAppStore((s) => s.setOnbField);
  const finishOnboardingV2 = useAppStore((s) => s.finishOnboardingV2);
  const applyTrainingSetup = useAppStore((s) => s.applyTrainingSetup);
  const setProfileSetupOpen = useAppStore((s) => s.setProfileSetupOpen);

  const prev = profile?.setup;
  const [step, setStep] = useState<Step>(mode === 'update' ? 'sport' : 'welcome');
  const [quick, setQuick] = useState<boolean | null>(mode === 'update' ? false : null);
  const [sport, setSport] = useState<string | null>(prev?.sport ?? null);
  const [extras, setExtras] = useState<string[]>(prev?.extraSports ?? []);
  const [goals, setGoals] = useState<string[]>(prev?.goals ?? []);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');
  const [level, setLevel] = useState<ProfileSetup['level'] | null>(prev?.level ?? null);
  const [days, setDays] = useState(prev?.days ?? 4);
  const [len, setLen] = useState(prev?.sessionMinutes ?? 45);
  const [places, setPlaces] = useState<('gym' | 'home' | 'outdoor')[]>(prev ? placesOf(prev) : []);
  const [kit, setKit] = useState<string[]>(prev?.kit ?? []);
  const [programs, setPrograms] = useState<LibraryProgram[] | null>(null);

  // The curated Library (its own chunk) loads once the flow starts - the
  // sport list and the week are both built from it.
  useEffect(() => {
    if (step === 'welcome') return;
    if (!programs) loadCurated('program').then((p) => setPrograms(p as LibraryProgram[]));
  }, [step, programs]);

  const flow = mode === 'update' ? UPDATE : quick ? QUICK : FULL;
  const idx = Math.max(0, flow.indexOf(step));
  const total = flow.length - 1;
  const sports = useMemo(() => (programs ? sportsWithPrograms(programs) : []), [programs]);
  const sportLabel = onbSport(sport)?.label ?? 'your sport';

  const setup: TrainingSetup | null =
    sport && level && places.length ? { sport, extraSports: extras, goals, level, days, sessionMinutes: len, place: legacyPlace(places), places, kit } : null;
  const built = useMemo(() => (programs && setup && !quick ? buildWeek(programs, setup) : null), [programs, quick, setup?.sport, extras.join(), goals.join(), level, days, len, places.join(), kit.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const forYou = useMemo(() => (programs && setup ? rankForYou(programs, setup).slice(0, 3) : []), [built]); // eslint-disable-line react-hooks/exhaustive-deps

  const runTarget = sport === 'run' ? RUN_TARGETS.find((t) => t.id === targetId) : undefined;
  const runPlan = useMemo(() => {
    if (!runTarget) return null;
    if (!runTarget.target) return buildRunPlan({ distance: runTarget.distance, currentSec: null, targetSec: null, daysPerWeek: 3 });
    const c = parseTime(current);
    const t = parseTime(target);
    if (!c || !t || c <= t) return null;
    return buildRunPlan({ distance: runTarget.distance, currentSec: c, targetSec: t, daysPerWeek: Math.min(5, Math.max(3, days)) as 3 | 4 | 5 });
  }, [runTarget, current, target, days]);
  const estimate = runPlan
    ? runPlan.milestoneSec
      ? `${target} is a big jump from ${current}, so block 1 takes you to ${fmtTime(runPlan.milestoneSec)} in ${runPlan.weeks.length} weeks. Log a time trial and block 2 picks up from there.`
      : runTarget?.target
        ? `About ${runPlan.weeks.length} weeks at ${days} days a week to go from ${current} to ${target}. Paces update every time you log a time.`
        : `${runPlan.weeks.length} weeks of walk/run, building to 5K non-stop.`
    : '';

  const valid: Record<Step, boolean> = {
    welcome: true,
    path: quick !== null,
    about: draft.name.trim().length > 1 && !!draft.age,
    sport: !!sport,
    extras: true,
    goal: goals.length > 0,
    week: !!level,
    place: places.length > 0,
    character: !!draft.character,
    plan: true,
    diy: true,
  };

  function next() {
    if (!valid[step]) return;
    if (step === 'plan' || step === 'diy') return finish();
    setStep(flow[Math.min(flow.length - 1, idx + 1)]);
  }
  function back() {
    if (mode === 'update' && idx === 0) return setProfileSetupOpen(false);
    setStep(flow[Math.max(0, idx - 1)]);
  }

  function finish() {
    if (quick) {
      finishOnboardingV2(
        { mode: 'quick', sport: '', extraSports: [], goals: [], level: 'beginner', days: 0, sessionMinutes: 0, place: 'gym', kit: [] },
        null,
      );
      return;
    }
    if (!setup || !built) return;
    const full: ProfileSetup = { mode: 'plan', ...setup };
    if (runTarget && runPlan) {
      startPlan(runPlan.title, {
        distance: runTarget.distance,
        currentSec: runTarget.target ? parseTime(current) : null,
        targetSec: runTarget.target ? parseTime(target) : null,
        daysPerWeek: Math.min(5, Math.max(3, days)) as 3 | 4 | 5,
      });
    }
    if (mode === 'update') applyTrainingSetup(full, built);
    else finishOnboardingV2(full, built);
  }

  const toggle = (list: string[], set: (v: string[]) => void, id: string, max: number) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id].slice(-max));

  const cta = step === 'diy' ? 'Take me in' : step === 'plan' ? (mode === 'update' ? 'Use this week' : 'Start training') : step === 'extras' && extras.length === 0 ? 'Skip for now' : 'Continue';

  if (step === 'welcome') {
    return createPortal(
      <div className="onb2 onb2-welcome">
        <div className="onb2-brand">SOMAXX</div>
        <div className="onb2-welcome-mid">
          <div className="onb2-welcome-icons" aria-hidden="true">
            {(['trophy', 'run', 'dumbbell', 'swim', 'ride', 'pilates', 'flame', 'zap'] as const).map((n, i) => (
              <span key={i}>
                <Icon name={n} />
              </span>
            ))}
          </div>
          <h1>Train for the sport you love.</h1>
          <p>Tell us your sport and goal and we'll build your week, then adapt it as you log. Or jump straight in and build your own path.</p>
        </div>
        <div className="onb2-welcome-foot">
          <button type="button" className="onb2-welcome-cta" onClick={() => setStep('path')}>
            Get started
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="onb2">
      <div className="onb2-top">
        <button type="button" className="onb2-back" onClick={back} aria-label="Back">
          <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="onb2-progress">
          {flow.slice(1).map((s, i) => (
            <i key={s} className={i < idx || (mode === 'update' && i <= idx) ? 'on' : ''} />
          ))}
        </div>
        <span className="onb2-count">
          {mode === 'update' ? idx + 1 : idx}/{mode === 'update' ? flow.length : total}
        </span>
      </div>

      <div className="onb2-body">
        {step === 'path' && (
          <>
            <Kicker>How do you want to start?</Kicker>
            <h2>Plan it for me, or jump in?</h2>
            <p className="onb2-lead">Either way you'll set up your name and character. You can switch any time from Train.</p>
            {(
              [
                [false, 'Build my plan', 'About 2 min', 'Tell us your sport, goal and schedule. We build your week, set targets and pick programs for you.', 'Sport · Goal · Level & week · Kit · Character', 'trophy'],
                [true, 'Quick start', 'Under 1 min', 'Just the essentials. Then explore programs, plans, meals and the community and build your own path.', 'Name · Character', 'zap'],
              ] as const
            ).map(([q, label, time, sub, steps, icon]) => (
              <button key={label} type="button" className={`onb2-path${quick === q ? ' on' : ''}`} aria-pressed={quick === q} onClick={() => setQuick(q)}>
                <span className="onb2-path-top">
                  <span className="onb2-ic">
                    <Icon name={icon} />
                  </span>
                  <span className="onb2-path-t">
                    <b>{label}</b>
                    <small>{time}</small>
                  </span>
                  <span className="onb2-radio" />
                </span>
                <span className="onb2-path-sub">{sub}</span>
                <span className="onb2-path-steps">{steps}</span>
              </button>
            ))}
          </>
        )}

        {step === 'about' && (
          <>
            <Kicker>About you</Kicker>
            <h2>Let's get to know you</h2>
            <p className="onb2-lead">Used for your profile and the league, and to set starting loads and paces.</p>
            <label className="onb2-field">
              Name
              <input value={draft.name} onChange={(e) => setOnbField('name', e.target.value)} placeholder="e.g. Ant Ioannidis" autoComplete="name" />
            </label>
            <div className="onb2-row3">
              <label className="onb2-field">
                Age
                <input value={draft.age} onChange={(e) => setOnbField('age', e.target.value)} inputMode="numeric" placeholder="32" />
              </label>
              <label className="onb2-field">
                Height cm
                <input value={draft.height} onChange={(e) => setOnbField('height', e.target.value)} inputMode="numeric" placeholder="180" />
              </label>
              <label className="onb2-field">
                Weight kg
                <input value={draft.weight} onChange={(e) => setOnbField('weight', e.target.value)} inputMode="decimal" placeholder="78" />
              </label>
            </div>
          </>
        )}

        {step === 'sport' && (
          <>
            <Kicker>Your sport</Kicker>
            <h2>What's your main sport?</h2>
            <p className="onb2-lead">Your week is built around this. You can add others next.</p>
            {!programs && <div className="onb2-lead">Loading sports…</div>}
            <div className="onb2-sports">
              {sports.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`onb2-sport${sport === s.id ? ' on' : ''}`}
                  aria-pressed={sport === s.id}
                  style={{ ['--c' as string]: `var(${s.colorVar})` }}
                  onClick={() => {
                    setSport(s.id);
                    setExtras((x) => x.filter((e) => e !== s.id));
                    setTargetId(null);
                  }}
                >
                  <span className="onb2-ic">
                    <Icon name={s.icon} />
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'extras' && (
          <>
            <Kicker>Also do</Kicker>
            <h2>Anything else you do?</h2>
            <p className="onb2-lead">Optional, up to 3. Each gets a session a week alongside {sportLabel}.</p>
            <div className="onb2-chips">
              {sports
                .filter((s) => s.id !== sport)
                .map((s) => (
                  <button key={s.id} type="button" className={`onb2-chip${extras.includes(s.id) ? ' on' : ''}`} aria-pressed={extras.includes(s.id)} onClick={() => toggle(extras, setExtras, s.id, 3)}>
                    <Icon name={s.icon} />
                    {s.label}
                  </button>
                ))}
            </div>
          </>
        )}

        {step === 'goal' && (
          <>
            <Kicker>Your goal</Kicker>
            <h2>What are you training for?</h2>
            <p className="onb2-lead">Pick up to two.</p>
            <div className="onb2-list">
              {ONB_GOALS.map((g) => (
                <button key={g.id} type="button" className={`onb2-card${goals.includes(g.id) ? ' on' : ''}`} aria-pressed={goals.includes(g.id)} style={{ ['--c' as string]: `var(${g.colorVar})` }} onClick={() => toggle(goals, setGoals, g.id, 2)}>
                  <span className="onb2-ic">
                    <Icon name={g.icon} />
                  </span>
                  <span className="onb2-card-t">
                    <b>{g.label}</b>
                    <small>{g.sub}</small>
                  </span>
                  <span className="onb2-radio" />
                </button>
              ))}
            </div>
            {sport === 'run' && (
              <div className="onb2-target">
                <div className="onb2-target-h">
                  <Icon name="trophy" /> Set a running target <span>Optional</span>
                </div>
                <div className="onb2-chips">
                  {RUN_TARGETS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`onb2-chip${targetId === t.id ? ' on' : ''}`}
                      aria-pressed={targetId === t.id}
                      onClick={() => {
                        if (targetId === t.id) return setTargetId(null);
                        setTargetId(t.id);
                        setCurrent(t.cur);
                        setTarget(t.target ?? '');
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {runTarget?.target && (
                  <div className="onb2-row2">
                    <label className="onb2-field mono">
                      Your current time
                      <input value={current} onChange={(e) => setCurrent(e.target.value)} inputMode="numeric" placeholder={runTarget.cur} />
                    </label>
                    <label className="onb2-field mono">
                      Target
                      <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="numeric" placeholder={runTarget.target} />
                    </label>
                  </div>
                )}
                {estimate && <div className="onb2-estimate">{estimate}</div>}
              </div>
            )}
          </>
        )}

        {step === 'week' && (
          <>
            <Kicker>Level &amp; week</Kicker>
            <h2>How much can you train?</h2>
            <div className="onb2-list">
              {LEVELS.map((l) => (
                <button key={l.id} type="button" className={`onb2-card${level === l.id ? ' on' : ''}`} aria-pressed={level === l.id} onClick={() => setLevel(l.id)}>
                  <span className="onb2-bars" aria-hidden="true">
                    {[1, 2, 3].map((b) => (
                      <i key={b} className={b <= l.bars ? 'on' : ''} style={{ height: 6 + b * 6 }} />
                    ))}
                  </span>
                  <span className="onb2-card-t">
                    <b>{l.label}</b>
                    <small>{l.sub}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="onb2-sub">
              Days per week <span>{days} days</span>
            </div>
            <div className="onb2-seg">
              {[2, 3, 4, 5, 6].map((n) => (
                <button key={n} type="button" className={days === n ? 'on' : ''} aria-pressed={days === n} onClick={() => setDays(n)}>
                  {n}
                </button>
              ))}
            </div>
            <div className="onb2-sub">Session length</div>
            <div className="onb2-seg">
              {[20, 30, 45, 60].map((n) => (
                <button key={n} type="button" className={len === n ? 'on' : ''} aria-pressed={len === n} onClick={() => setLen(n)}>
                  {n === 60 ? "60+'" : `${n}'`}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'place' && (
          <>
            <Kicker>Where you train</Kicker>
            <h2>Where will you train?</h2>
            <p className="onb2-lead">Pick all that apply. We only suggest programs you can actually do.</p>
            <div className="onb2-places">
              {PLACES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`onb2-place${places.includes(p.id) ? ' on' : ''}`}
                  aria-pressed={places.includes(p.id)}
                  onClick={() => setPlaces((cur) => (cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id]))}
                >
                  <Icon name={p.icon} />
                  <b>{p.label}</b>
                  <small>{p.sub}</small>
                </button>
              ))}
            </div>
            <div className="onb2-sub">Kit you have</div>
            <div className="onb2-chips">
              {KIT.map((k) => (
                <button key={k} type="button" className={`onb2-chip${kit.includes(k) ? ' on' : ''}`} aria-pressed={kit.includes(k)} onClick={() => toggle(kit, setKit, k, 99)}>
                  {k}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'character' && (
          <div className="onb2-character">
            <Kicker>Your character</Kicker>
            <CharacterStep />
          </div>
        )}

        {step === 'plan' && (
          <>
            <div className="onb2-hero">
              <Kicker>{mode === 'update' ? 'Your new week' : 'Your plan is ready'}</Kicker>
              <h2>
                {draft.name || profile?.name ? `${(draft.name || profile?.name || '').split(' ')[0]}, your ` : 'Your '}
                {sportLabel} week
              </h2>
              <div className="onb2-tags">
                {[sportLabel, level ?? '', `${days} days`, `${len} min`].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {estimate && <div className="onb2-hero-note">{estimate}</div>}
            </div>
            <div className="onb2-sub">This week</div>
            {!built && <div className="onb2-lead">Building your week…</div>}
            {built && (
              <div className="onb2-list">
                {built.weekPlan.map((_, i) => {
                  const s = built.sessions.find((x) => x.dayIndex === i);
                  return s ? (
                    <div className="onb2-day" key={i}>
                      <span className="onb2-day-d">{DAY_SHORT[i]}</span>
                      <TypeIconBadge category={s.item.category} size={32} />
                      <span className="onb2-card-t">
                        <b>{s.item.name}</b>
                        <small>
                          {s.item.duration} · {s.item.level}
                        </small>
                      </span>
                    </div>
                  ) : (
                    <div className="onb2-day rest" key={i}>
                      <span className="onb2-day-d">{DAY_SHORT[i]}</span>
                      <span className="onb2-rest-ic">
                        <Icon name="moon" />
                      </span>
                      <span className="onb2-card-t">
                        <b>Rest &amp; recover</b>
                        <small>Steps, water, sleep</small>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {forYou.length > 0 && (
              <>
                <div className="onb2-sub">
                  For you <span>In the Library</span>
                </div>
                <div className="onb2-list">
                  {forYou.map(({ item, fit }) => (
                    <div className="onb2-day" key={item.id}>
                      <TypeIconBadge category={item.category} size={36} />
                      <span className="onb2-card-t">
                        <b>{item.name}</b>
                        <small>{item.content.whoItsFor ?? item.description}</small>
                      </span>
                      <span className="onb2-fit">{fit}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="onb2-week-strip" aria-hidden="true">
              {DAY_LETTERS.map((l, i) => (
                <span key={i} className={built?.weekPlan[i].type === 'train' ? 'on' : ''}>
                  {l}
                </span>
              ))}
            </div>
          </>
        )}

        {step === 'diy' && (
          <>
            <Kicker>You're in</Kicker>
            <h2>{draft.name ? `${draft.name.split(' ')[0]}, build` : 'Build'} your own path</h2>
            <p className="onb2-lead">
              Your week starts empty. Add sessions from the Library, community programs or your own, any time. Want a plan later? Set your training profile in Profile and we'll build your week and fill For you.
            </p>
            <div className="onb2-list">
              {(
                [
                  ['Programs', 'Somax, credited and community programs', 'dumbbell'],
                  ['Goal plans', 'Adaptive plans, e.g. break 25:00 for 5K', 'run'],
                  ['Meals', 'Recipes by goal, meal and diet', 'nutrition'],
                  ['Community', 'What other Somax members are sharing', 'community'],
                ] as const
              ).map(([t, sub, ic]) => (
                <div className="onb2-day" key={t}>
                  <span className="onb2-ic soft">
                    <Icon name={ic} />
                  </span>
                  <span className="onb2-card-t">
                    <b>{t}</b>
                    <small>{sub}</small>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="onb2-foot">
        <button type="button" className="onb2-cta" disabled={!valid[step] || (step === 'plan' && !built)} onClick={next}>
          {cta}
        </button>
      </div>
    </div>,
    document.body,
  );
}
