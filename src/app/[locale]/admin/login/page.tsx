import { redirect } from 'next/navigation';
import AdminForm from '@/components/admin/AdminForm';
import AdminLangToggle from '@/components/admin/AdminLangToggle';
import { t } from '@/admin/messages';
import { isAdminSession } from '@/lib/auth';
import { localePath, safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

const inputClass = 'mt-2 w-full text-lg border-2 border-saffron rounded-xl p-3 bg-white';

export default async function AdminLoginPage({ params }: { params: { locale: string } }) {
  const locale = safeLocale(params.locale);
  if (await isAdminSession()) redirect(localePath(locale, '/admin'));

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex justify-center">
          <AdminLangToggle section="/login" />
        </div>
        <h1 className="text-2xl font-serif text-deep-red text-center">{t(locale, 'pinTitle')}</h1>
        <AdminForm
          endpoint="/api/admin/login"
          locale={locale}
          submitKey="signIn"
          successHref={localePath(locale, '/admin')}
        >
          <label className="block text-lg">
            {t(locale, 'usernameLabel')}
            <input name="username" required maxLength={40} autoComplete="username" className={inputClass} />
          </label>
          <label className="block text-lg">
            {t(locale, 'passwordLabel')}
            <input
              name="password"
              type="password"
              required
              maxLength={200}
              autoComplete="current-password"
              className={inputClass}
            />
          </label>
        </AdminForm>
      </div>
    </div>
  );
}
