import { NextResponse } from 'next/server';
import { clearFailures, isLocked, recordFailure, startSession } from '@/lib/auth';
import { verifyPin } from '@/lib/pin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body?.username ?? '').trim();
  const password = String(body?.password ?? '');

  if (isLocked()) return NextResponse.json({ ok: false, messageKey: 'locked' }, { status: 429 });

  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const passwordOk = await verifyPin(password, process.env.ADMIN_PASSWORD_HASH);
  if (username !== expectedUser || !passwordOk || password.length > 200) {
    recordFailure();
    return NextResponse.json({ ok: false, messageKey: 'wrongLogin' }, { status: 401 });
  }

  clearFailures();
  await startSession();
  return NextResponse.json({ ok: true });
}
