import { cookies } from 'next/headers';
import { isValidToken, signToken, SESSION_MS } from './session';

const COOKIE = 'admin_session';
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

// Single-process lockout. Resets when the server restarts; fine for one shop, revisit for multi-instance hosting.
let failures = 0;
let lockedUntil = 0;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET must be set (16+ characters)');
  return s;
}

export function isLocked(now = Date.now()): boolean {
  return now < lockedUntil;
}

export function recordFailure(now = Date.now()): void {
  failures++;
  if (failures >= MAX_FAILURES) {
    lockedUntil = now + LOCK_MS;
    failures = 0;
  }
}

export function clearFailures(): void {
  failures = 0;
}

export async function startSession(): Promise<void> {
  const token = await signToken(Date.now() + SESSION_MS, secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MS / 1000,
  });
}

export function endSession(): void {
  cookies().delete(COOKIE);
}

export async function isAdminSession(): Promise<boolean> {
  return isValidToken(cookies().get(COOKIE)?.value, secret());
}
