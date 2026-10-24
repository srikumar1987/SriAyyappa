const enc = new TextEncoder();

export const PBKDF2_ITERATIONS = 100_000;

export function toB64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromB64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

export function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function derive(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(pin) as BufferSource, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    key,
    256
  );
  return new Uint8Array(bits);
}

/** Format: pbkdf2$<iterations>$<salt base64>$<hash base64> */
export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(pin, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

export async function verifyPin(pin: string, stored: string | undefined): Promise<boolean> {
  const [alg, iterations, saltB64, hashB64] = (stored ?? '').split('$');
  const n = Number(iterations);
  if (alg !== 'pbkdf2' || !saltB64 || !hashB64 || !Number.isInteger(n) || n < 1000 || n > 1_000_000) return false;
  try {
    return equalBytes(await derive(pin, fromB64(saltB64), n), fromB64(hashB64));
  } catch {
    return false;
  }
}
