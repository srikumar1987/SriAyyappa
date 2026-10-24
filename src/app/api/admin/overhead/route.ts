import { NextResponse } from 'next/server';
import { z } from 'zod';
import { newId, updateStore } from '@/data/repo';
import { isAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const overheadSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  type: z.enum(['rent', 'electricity', 'staff', 'other']),
  amount: z.coerce.number().positive().max(10000000),
  note: z.string().trim().max(200).default(''),
});

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, messageKey: 'notSignedIn' }, { status: 401 });
  }

  const parsed = overheadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, messageKey: 'invalidInput' }, { status: 400 });
  }

  const d = parsed.data;
  await updateStore((data) => {
    data.overhead.push({ overheadId: newId('O'), month: d.month, type: d.type, amount: d.amount, note: d.note });
  });

  return NextResponse.json({ ok: true, messageKey: 'overheadSaved' });
}
