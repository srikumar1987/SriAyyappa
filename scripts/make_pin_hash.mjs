// Creates the value for ADMIN_PIN_HASH. Usage: node scripts/make_pin_hash.mjs 1234
const pin = process.argv[2];
if (!/^\d{4}$/.test(pin ?? '')) {
  console.error('Usage: node scripts/make_pin_hash.mjs <4-digit PIN>');
  process.exit(1);
}

const ITERATIONS = 100000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);

const b64 = (bytes) => Buffer.from(bytes).toString('base64');
// Uses ':' separators: Next.js expands '$' inside .env values.
console.log(`pbkdf2:${ITERATIONS}:${b64(salt)}:${b64(new Uint8Array(bits))}`);
