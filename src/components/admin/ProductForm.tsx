'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { t } from '@/admin/messages';
import { categoryKeys, type Category } from '@/data/products';

const MAX_SIDE = 1000;
const inputClass = 'mt-2 w-full text-lg border-2 border-saffron rounded-xl p-3 bg-white';

/** Shrinks and brightens a phone photo in the browser before upload. */
async function enhancePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  ctx.filter = 'brightness(1.08) contrast(1.12) saturate(1.1)';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

export default function ProductForm({ locale }: { locale: string }) {
  const common = useTranslations('common');
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function onPhoto(file: File | undefined) {
    if (!file) return setPhoto(null);
    setPhoto(await enhancePhoto(file));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const f = new FormData(e.currentTarget);
    const body = {
      names: {
        ml: f.get('name_ml'),
        en: f.get('name_en'),
        ta: f.get('name_ta'),
        kn: f.get('name_kn'),
        te: f.get('name_te'),
        hi: f.get('name_hi'),
      },
      category: f.get('category'),
      price: f.get('price'),
      mrp: f.get('mrp') || 0,
      manufacturer: f.get('manufacturer'),
      description: f.get('description'),
      ...(photo ? { imageDataUrl: photo } : {}),
    };
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; messageKey?: string; vars?: Record<string, string> };
      setMessage({ ok: data.ok, text: t(locale, data.messageKey ?? 'network', data.vars) });
      if (data.ok) {
        e.currentTarget.reset();
        setPhoto(null);
      }
    } catch {
      setMessage({ ok: false, text: t(locale, 'network') });
    } finally {
      setPending(false);
    }
  }

  const categories = Object.keys(categoryKeys) as Category[];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block text-lg font-medium">
        {t(locale, 'productNameMl')}
        <input name="name_ml" maxLength={120} className={inputClass} />
      </label>
      <label className="block text-lg font-medium">
        {t(locale, 'productNameEn')}
        <input name="name_en" maxLength={120} className={inputClass} />
      </label>
      <details className="rounded-xl border border-saffron p-3">
        <summary className="cursor-pointer text-lg">{t(locale, 'productNameTa')} / {t(locale, 'productNameKn')} / {t(locale, 'productNameTe')} / {t(locale, 'productNameHi')}</summary>
        <div className="space-y-3 mt-3">
          <input name="name_ta" placeholder={t(locale, 'productNameTa')} maxLength={120} className={inputClass} />
          <input name="name_kn" placeholder={t(locale, 'productNameKn')} maxLength={120} className={inputClass} />
          <input name="name_te" placeholder={t(locale, 'productNameTe')} maxLength={120} className={inputClass} />
          <input name="name_hi" placeholder={t(locale, 'productNameHi')} maxLength={120} className={inputClass} />
        </div>
      </details>

      <label className="block text-lg font-medium">
        {t(locale, 'productCategory')}
        <select name="category" required defaultValue="pooja" className={inputClass}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {common(categoryKeys[c])}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-lg font-medium">
          {t(locale, 'productPrice')}
          <input name="price" type="number" inputMode="decimal" min={0} step="0.01" required className={inputClass} />
        </label>
        <label className="block text-lg font-medium">
          {t(locale, 'productMrp')}
          <input name="mrp" type="number" inputMode="decimal" min={0} step="0.01" className={inputClass} />
        </label>
      </div>

      <label className="block text-lg font-medium">
        {t(locale, 'productManufacturer')}
        <input name="manufacturer" maxLength={80} className={inputClass} />
      </label>
      <label className="block text-lg font-medium">
        {t(locale, 'productDescription')}
        <textarea name="description" maxLength={500} rows={3} className={inputClass} />
      </label>

      <div className="space-y-2">
        <label className="block text-lg font-medium">
          {t(locale, 'productPhoto')}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onPhoto(e.target.files?.[0])}
            className="mt-2 block w-full text-lg"
          />
        </label>
        <p className="text-sm text-dark-brown">{t(locale, 'productPhotoHelp')}</p>
        {photo && <img src={photo} alt="" className="w-40 h-40 object-cover rounded-xl border-2 border-saffron" />}
      </div>

      {message && (
        <p role="alert" className={`text-lg font-medium ${message.ok ? 'text-green-700' : 'text-deep-red'}`}>
          {message.text}
        </p>
      )}

      <button type="submit" disabled={pending} className="w-full py-4 text-xl rounded-2xl bg-deep-red text-white disabled:opacity-60">
        {t(locale, 'productSave')}
      </button>
    </form>
  );
}
