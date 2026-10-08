// Deployed with --no-verify-jwt: called by a Postgres trigger on
// direct_messages inserts, not by signed-in app users. Instead it checks WEBHOOK_SECRET, a value generated just for
// this one internal call and known only to the trigger and this function
// - not the project's real service role key, which never needs to leave
// Supabase's own runtime (it's read from env below).
import { createClient } from 'npm:@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const APNS_KEY_ID = Deno.env.get('APNS_KEY_ID');
const APNS_TEAM_ID = Deno.env.get('APNS_TEAM_ID');
const APNS_PRIVATE_KEY = Deno.env.get('APNS_PRIVATE_KEY');
const APNS_BUNDLE_ID = Deno.env.get('APNS_BUNDLE_ID') ?? 'com.somaxx.app';
// TestFlight and App Store builds both use the production APNs host -
// only an Xcode debug build signed with a development provisioning
// profile needs the sandbox host.
const APNS_HOST = Deno.env.get('APNS_ENV') === 'sandbox' ? 'api.sandbox.push.apple.com' : 'api.push.apple.com';

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = '';
  for (const b of buf) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

let cachedKey: CryptoKey | null = null;
async function importApnsKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const pem = APNS_PRIVATE_KEY!.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  cachedKey = await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  return cachedKey;
}

let cachedJwt: { token: string; issuedAt: number } | null = null;
async function apnsJwt(): Promise<string> {
  // APNs allows reusing a provider token for up to an hour - regenerating
  // it every call would work too, but this avoids a signing op per push.
  const now = Math.floor(Date.now() / 1000);
  if (cachedJwt && now - cachedJwt.issuedAt < 1800) return cachedJwt.token;

  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: 'ES256', kid: APNS_KEY_ID })));
  const payload = base64url(new TextEncoder().encode(JSON.stringify({ iss: APNS_TEAM_ID, iat: now })));
  const signingInput = `${header}.${payload}`;
  const key = await importApnsKey();
  // Web Crypto's ECDSA signature output is already raw r||s, which is the
  // format APNs expects - no DER-to-raw conversion needed.
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(signingInput));
  const token = `${signingInput}.${base64url(sig)}`;
  cachedJwt = { token, issuedAt: now };
  return token;
}

async function sendApnsPush(deviceToken: string, title: string, body: string): Promise<boolean> {
  const jwt = await apnsJwt();
  const res = await fetch(`https://${APNS_HOST}/3/device/${deviceToken}`, {
    method: 'POST',
    headers: {
      authorization: `bearer ${jwt}`,
      'apns-topic': APNS_BUNDLE_ID,
      'apns-push-type': 'alert',
      'apns-priority': '5',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ aps: { alert: { title, body }, sound: 'default' } }),
  });
  if (!res.ok) console.error('[notify-league-update] APNs error', res.status, await res.text());
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('unauthorized', { status: 401 });
  }
  if (!APNS_KEY_ID || !APNS_TEAM_ID || !APNS_PRIVATE_KEY) {
    console.log('[notify-message] APNs not configured yet, skipping');
    return new Response('ok (apns not configured)', { status: 200 });
  }

  const { sender_id, recipient_id, text } = await req.json();
  if (!sender_id || !recipient_id) return new Response('missing sender_id/recipient_id', { status: 400 });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: stateRow } = await supabase.from('app_state').select('state').eq('user_id', recipient_id).maybeSingle();
  const notifMessages = (stateRow?.state as { settings?: { notifMessages?: boolean } } | null)?.settings?.notifMessages;
  if (!notifMessages) return new Response('ok (recipient has message notifications off)', { status: 200 });

  const { data: senderProfile } = await supabase.from('public_profiles').select('name').eq('user_id', sender_id).maybeSingle();
  const senderName = senderProfile?.name ?? 'Someone';
  const preview = typeof text === 'string' ? text.slice(0, 120) : 'sent you a message';

  const { data: tokens } = await supabase.from('push_tokens').select('token').eq('user_id', recipient_id);
  let sent = 0;
  for (const { token } of tokens ?? []) {
    const ok = await sendApnsPush(token, senderName, preview);
    if (ok) sent++;
  }

  return new Response(JSON.stringify({ ok: true, sent }), { status: 200, headers: { 'content-type': 'application/json' } });
});
