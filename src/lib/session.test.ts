import { describe, expect, it } from 'vitest';
import { isValidToken, signToken } from './session';

const SECRET = 'test-secret-that-is-long-enough';
const NOW = 1_000_000;

describe('session tokens', () => {
  it('accepts a fresh token', async () => {
    const token = await signToken(NOW + 60_000, SECRET);
    expect(await isValidToken(token, SECRET, NOW)).toBe(true);
  });

  it('rejects an expired token', async () => {
    const token = await signToken(NOW - 1, SECRET);
    expect(await isValidToken(token, SECRET, NOW)).toBe(false);
  });

  it('rejects a token whose expiry was changed', async () => {
    const token = await signToken(NOW + 60_000, SECRET);
    const [, sig] = token.split('.');
    const forged = `${NOW + 9_999_999}.${sig}`;
    expect(await isValidToken(forged, SECRET, NOW)).toBe(false);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signToken(NOW + 60_000, 'another-secret-entirely-different');
    expect(await isValidToken(token, SECRET, NOW)).toBe(false);
  });

  it('rejects missing, empty and garbage values', async () => {
    expect(await isValidToken(undefined, SECRET, NOW)).toBe(false);
    expect(await isValidToken('', SECRET, NOW)).toBe(false);
    expect(await isValidToken('abc', SECRET, NOW)).toBe(false);
    expect(await isValidToken(`${NOW + 1000}.!!!not-base64`, SECRET, NOW)).toBe(false);
  });
});
