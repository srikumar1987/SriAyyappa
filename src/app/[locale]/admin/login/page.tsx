import { redirect } from 'next/navigation';
import AdminForm from '@/components/admin/AdminForm';
import { t } from '@/admin/messages';
import { isAdminSession } from '@/lib/auth';
import { localePath, safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);
  if (await isAdminSession()) redirect(localePath(locale, '/admin'));

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-serif text-deep-red text-center mb-6">{t(locale, 'pinTitle')}</h1>
        <AdminForm
          endpoint="/api/admin/login"
          locale={locale}
          submitKey="signIn"
          successHref={localePath(locale, '/admin')}
        >
          <label className="block text-lg">
            {t(locale, 'pinLabel')}
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              required
              autoComplete="off"
              className="mt-2 w-full text-center text-3xl tracking-[0.5em] border-2 border-saffron rounded-xl p-3"
            />
          </label>
        </AdminForm>
      </div>
    </div>
  );
}
