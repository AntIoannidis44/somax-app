import { useState } from 'react';
import { Icon } from '../Icon';
import { supabase } from '../../lib/supabase';

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit() {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }
    setBusy(true);
    const { error: err } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (mode === 'signup') {
      // Only relevant if email auto-confirm ever gets turned back off -
      // signUp still succeeds but there's no session yet until confirmed.
      const { data } = await supabase.auth.getSession();
      if (!data.session) setCheckEmail(true);
    }
  }

  return (
    <div className="onb">
      <div className="onb-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 26 }}>
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: 22,
            background: 'linear-gradient(155deg, var(--accent), var(--accent-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
            boxShadow: '0 16px 30px -12px color-mix(in srgb, var(--accent) 55%, transparent)',
          }}
        >
          <Icon name="zap" style={{ width: 34, height: 34, stroke: '#fff' }} />
        </div>

        {checkEmail ? (
          <>
            <h2>Check your email</h2>
            <p className="lead" style={{ maxWidth: 280 }}>
              We sent a confirmation link to {email}. Follow it, then come back and sign in.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => setCheckEmail(false)}>
              Back
            </button>
          </>
        ) : (
          <>
            <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="lead" style={{ maxWidth: 280 }}>
              {mode === 'signin' ? 'Sign in to pick up where you left off.' : 'Your progress will be saved to this account.'}
            </p>
            <div className="field" style={{ width: '100%', textAlign: 'left' }}>
              <label>Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field" style={{ width: '100%', textAlign: 'left' }}>
              <label>Password</label>
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>
            {error && (
              <p style={{ color: 'var(--danger, #d92d20)', fontSize: 13, marginTop: -8, marginBottom: 16, textAlign: 'left', width: '100%' }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
      {!checkEmail && (
        <div className="onb-foot" style={{ flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary" onClick={submit} disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
              setError('');
            }}
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      )}
    </div>
  );
}
