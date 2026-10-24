'use client';

import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { t } from '@/admin/messages';

interface Result {
  ok: boolean;
  messageKey?: string;
  vars?: Record<string, string | number>;
}

interface AdminFormProps {
  endpoint: string;
  locale: string;
  submitKey: string;
  successHref?: string;
  children: ReactNode;
}

export default function AdminForm({ endpoint, locale, submitKey, successHref, children }: AdminFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as Result;
      setResult(data);
      if (data.ok) {
        if (successHref) window.location.assign(successHref);
        else formRef.current?.reset();
      }
    } catch {
      setResult({ ok: false, messageKey: 'network' });
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {children}
      {result && (
        <p role="alert" className={`text-lg font-medium ${result.ok ? 'text-green-700' : 'text-deep-red'}`}>
          {t(locale, result.messageKey ?? 'network', result.vars)}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-4 text-xl rounded-2xl bg-deep-red text-white disabled:opacity-60"
      >
        {t(locale, submitKey)}
      </button>
    </form>
  );
}
