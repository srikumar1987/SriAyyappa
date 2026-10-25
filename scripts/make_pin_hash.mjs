// Creates the stored form of a password for ADMIN_PASSWORD_HASH (the password itself is never stored).
// Usage: node scripts/make_pin_hash.mjs "your password"
const secret = process.argv[2];
if (!secret || secret.length < 4) {
  console.error('Usage: node scripts/make_pin_hash.mjs "<password, at least 4 characters>"');
  process.exit(1);
}

const ITERATIONS = 100000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);

const b64 = (bytes) => Buffer.from(bytes).toString('base64');
// Uses ':' separators: Next.js expands '$' inside .env values.
console.log(`pbkdf2:${ITERATIONS}:${b64(salt)}:${b64(new Uint8Array(bits))}`);
