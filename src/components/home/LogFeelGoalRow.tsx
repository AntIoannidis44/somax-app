import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { Modal } from '../layout/Modal';
import { useAppStore } from '../../store/useAppStore';

const MIN_CHARS = 25;

export function LogFeelGoalRow() {
  const goal = useAppStore((s) => s.today.goals.find((g) => g.id === 'logfeel'));
  const feelingText = useAppStore((s) => s.today.feelingText);
  const submitFeelingLog = useAppStore((s) => s.submitFeelingLog);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // The Modal's contents are always mounted (it just toggles a CSS class
  // to show/hide - see Modal.tsx), so a plain `autoFocus` on the textarea
  // fired the instant this row mounted, i.e. every single Home load, not
  // just when actually opened - that's what was popping the keyboard up
  // uninvited. Focus manually, only on the real open transition.
  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  if (!goal) return null;
  const done = goal.done;
  const chars = draft.trim().length;
  const canSubmit = chars >= MIN_CHARS;

  function handleSubmit() {
    if (!canSubmit) return;
    submitFeelingLog(draft.trim());
    setOpen(false);
    setDraft('');
  }

  return (
    <>
      <div className="goal-row" onClick={() => !done && setOpen(true)} style={{ cursor: done ? 'default' : 'pointer' }}>
        <div className={`goal-check${done ? ' done' : ''}`} style={{ cursor: 'default' }}>
          <Icon name="check" />
        </div>
        <div className="goal-main">
          <div className={`goal-title${done ? ' done' : ''}`}>{goal.label}</div>
          <div className="goal-meta">{done ? feelingText : `${goal.meta} · at least ${MIN_CHARS} characters`}</div>
        </div>
        <div className="goal-xp">+{goal.xp} XP</div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log how you felt">
        <div className="field" style={{ width: '100%' }}>
          <textarea
            ref={textareaRef}
            rows={5}
            placeholder="How did today's training actually feel? Energy, soreness, mood, sleep - whatever's real."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
        <div className="goal-meta" style={{ margin: '8px 0 16px' }}>
          {chars} / {MIN_CHARS} characters
        </div>
        <button className="btn btn-primary" disabled={!canSubmit} onClick={handleSubmit} style={{ width: '100%' }}>
          Submit · +{goal.xp} XP
        </button>
      </Modal>
    </>
  );
}
