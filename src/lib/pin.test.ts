import { describe, expect, it } from 'vitest';
import { hashPin, verifyPin } from './pin';

describe('PIN hashing', () => {
  it('accepts the right PIN', async () => {
    const stored = await hashPin('2026');
    expect(await verifyPin('2026', stored)).toBe(true);
  });

  it('rejects a wrong PIN', async () => {
    const stored = await hashPin('2026');
    expect(await verifyPin('2027', stored)).toBe(false);
  });

  it('never stores the PIN itself', async () => {
    const stored = await hashPin('2026');
    expect(stored).not.toContain('2026');
    expect(stored.startsWith('pbkdf2:')).toBe(true);
  });

  it('uses a different salt each time', async () => {
    expect(await hashPin('2026')).not.toBe(await hashPin('2026'));
  });

  it('rejects a missing or malformed stored value', async () => {
    expect(await verifyPin('2026', undefined)).toBe(false);
    expect(await verifyPin('2026', 'not-a-hash')).toBe(false);
    expect(await verifyPin('2026', 'pbkdf2:5:abc:def')).toBe(false);
  });
});
