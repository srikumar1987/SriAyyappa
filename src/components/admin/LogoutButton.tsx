'use client';

import { localePath } from '@/lib/paths';

export default function LogoutButton({ locale, label }: { locale: string; label: string }) {
  async function onClick() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.assign(localePath(locale, '/admin/login'));
  }

  return (
    <button onClick={onClick} className="px-4 py-2 rounded-xl border-2 border-deep-red text-deep-red">
      {label}
    </button>
  );
}
