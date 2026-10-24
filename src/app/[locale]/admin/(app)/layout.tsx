import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/auth';
import { localePath, safeLocale } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export default async function AdminAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = safeLocale(params.locale);
  if (!(await isAdminSession())) redirect(localePath(locale, '/admin/login'));

  return <div className="min-h-screen max-w-3xl mx-auto p-4 md:p-8">{children}</div>;
}
