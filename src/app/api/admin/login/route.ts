import { NextResponse } from 'next/server';
import { clearFailures, isLocked, recordFailure, startSession } from '@/lib/auth';
import { verifyPin } from '@/lib/pin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body?.pin ?? '');

  if (isLocked()) return NextResponse.json({ ok: false, messageKey: 'locked' }, { status: 429 });

  if (!/^\d{4}$/.test(pin) || !(await verifyPin(pin, process.env.ADMIN_PIN_HASH))) {
    recordFailure();
    return NextResponse.json({ ok: false, messageKey: 'wrongPin' }, { status: 401 });
  }

  clearFailures();
  await startSession();
  return NextResponse.json({ ok: true });
}
