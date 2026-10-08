import { type ReactNode, useEffect, useState } from 'react';

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

  return (
    <div
      className={`modal-overlay${open ? ' show' : ''}`}
      style={vvHeight ? { height: vvHeight } : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
