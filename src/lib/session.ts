import { equalBytes, fromB64, toB64 } from './pin';

const enc = new TextEncoder();

export const SESSION_MS = 12 * 60 * 60 * 1000;

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret) as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message) as BufferSource));
}

/** Token format: <expiresAtMs>.<signature base64> */
export async function signToken(expiresAt: number, secret: string): Promise<string> {
  return `${expiresAt}.${toB64(await hmac(secret, String(expiresAt)))}`;
}

export async function isValidToken(token: string | undefined, secret: string, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  const expiresAt = Number(exp);
  if (!exp || !sig || !Number.isFinite(expiresAt) || now >= expiresAt) return false;
  let given: Uint8Array;
  try {
    given = fromB64(sig);
  } catch {
    return false;
  }
  return equalBytes(given, await hmac(secret, exp));
}
