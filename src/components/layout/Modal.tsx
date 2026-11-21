import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // iOS shrinks the *visual* viewport when the keyboard opens, but this
  // overlay is `position: fixed; inset: 0`, which still spans the full
  // *layout* viewport - the part now covered by the keyboard included.
  // Centering within that meant the sheet (and its submit button) could
  // end up partly or fully hidden behind the keyboard with no way to
  // scroll it into view. Track the real visible height via the Visual
  // Viewport API and size the overlay to that instead, so it only ever
  // centers within the space that's actually visible above the keyboard.
  //
  // BUG THIS GUARDS AGAINST (the intermittent "half-screen Log food sheet", 2026-11-19):
  // this used to copy vv.height on every 'resize' event. When a full-screen panel on top
  // (food search) opened the keyboard, the sheet underneath shrank to keyboard height -
  // and in the iOS app's web view the 'resize' for the keyboard CLOSING is sometimes never
  // delivered, so the sheet stayed half-height until some later event. Rule now: only
  // shrink while one of THIS sheet's own fields is focused, otherwise fill the screen;
  // and re-check on focus changes and a few times during the keyboard animation instead
  // of trusting one event. Covered by tests/e2e/foodlog.mjs - don't revert to
  // "height = last resize event".
  const [vvHeight, setVvHeight] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  // Only a tap that STARTS on the dimmed background closes the popup - a
  // tap that began on a button inside the sheet never does, even if the
  // sheet moves before the finger lifts.
  const downOnBackdrop = useRef(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const typingInThisSheet = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || !overlayRef.current?.contains(el)) return false;
      if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
      if (el.tagName !== 'INPUT') return false;
      return !['button', 'checkbox', 'radio', 'range', 'file', 'submit', 'reset', 'color'].includes((el as HTMLInputElement).type);
    };
    // While a finger is on the screen the sheet must not move: tapping
    // Submit takes focus off the text box and the keyboard starts closing
    // straight away, and growing the sheet mid-tap slid the button out from
    // under the finger - the tap landed on the backdrop instead, the popup
    // closed and nothing was saved ("Log how you felt", 2026-11-21). Hold
    // every resize until the tap has finished (pointerup -> click), then settle.
    let pointerDown = false;
    const update = () => {
      if (pointerDown) return;
      const shrink = open && typingInThisSheet() && vv.height < window.innerHeight - 1;
      setVvHeight(shrink ? vv.height : null);
    };
    let timers: number[] = [];
    const schedule = (delays: number[]) => {
      timers.forEach(clearTimeout);
      timers = delays.map((ms) => window.setTimeout(update, ms));
    };
    // Focus moving INTO a field: shrink straight away (keyboard is opening).
    const onFocusIn = () => {
      update();
      schedule([120, 350, 700]); // keyboard animation
    };
    // Focus LEAVING a field happens in the middle of a tap (tapping Submit
    // takes focus off the text box before the tap finishes). Growing the
    // sheet right then moved the button out from under the finger, the tap
    // landed on the dimmed background and closed the popup - "Log how you
    // felt" never submitted (2026-11-21). So never resize on focusout
    // itself: wait until the tap is over and the keyboard is going away.
    const onFocusOut = () => schedule([300, 600, 900]);
    const onPointerDown = () => {
      pointerDown = true;
    };
    const onPointerUp = () => {
      // Released after this event's click has been delivered to the button.
      window.setTimeout(() => {
        pointerDown = false;
        schedule([0, 250, 600]);
      }, 50);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerUp, true);
    return () => {
      timers.forEach(clearTimeout);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointerup', onPointerUp, true);
      document.removeEventListener('pointercancel', onPointerUp, true);
    };
  }, [open]);

  // Bottom-sheet drag: pull the handle (or title row) up to expand to
  // near full height, down to shrink back or close.
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; h: number; dy: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dragStyle, setDragStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  function onDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { y: e.clientY, h: sheetRef.current?.getBoundingClientRect().height ?? 0, dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    d.dy = e.clientY - d.y;
    const maxH = (sheetRef.current?.parentElement?.getBoundingClientRect().height ?? window.innerHeight) * 0.92;
    if (d.dy < 0) setDragStyle({ height: Math.min(maxH, d.h - d.dy), maxHeight: maxH, transition: 'none', animation: 'none' });
    else setDragStyle({ height: d.h, transform: `translateY(${d.dy}px)`, transition: 'none', animation: 'none' });
  }
  function onUp() {
    const d = drag.current;
    drag.current = null;
    setDragStyle(undefined);
    if (!d) return;
    if (d.dy < -40) setExpanded(true);
    else if (d.dy > 90) {
      if (expanded && d.dy < 220) setExpanded(false);
      else onClose();
    }
  }

  // Portalled to <body>: inside the scrolling screen, iOS let the tab bar
  // paint over the sheet and clipped its last rows.
  return createPortal(
    <div
      ref={overlayRef}
      className={`modal-overlay${open ? ' show' : ''}`}
      style={vvHeight ? { height: vvHeight } : undefined}
      onPointerDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && downOnBackdrop.current) onClose();
        downOnBackdrop.current = false;
      }}
    >
      <div ref={sheetRef} className={`modal-sheet${expanded ? ' expanded' : ''}`} style={dragStyle}>
        <div className="modal-grab" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <span />
        </div>
        <div className="modal-head" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
