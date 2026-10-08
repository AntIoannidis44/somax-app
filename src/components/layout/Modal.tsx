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
  const [vvHeight, setVvHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setVvHeight(vv.height);
    update();
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);

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
      className={`modal-overlay${open ? ' show' : ''}`}
      style={vvHeight ? { height: vvHeight } : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
