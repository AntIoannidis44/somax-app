import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  const clearToast = useAppStore((s) => s.clearToast);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!toast) return;
    setMessage(toast.message);
    setVisible(true);
    const hideTimer = setTimeout(() => setVisible(false), 2200);
    const clearTimer = setTimeout(() => clearToast(), 2500);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [toast, clearToast]);

  return <div className={`toast${visible ? ' show' : ''}`}>{message}</div>;
}
