// Language switch for admin pages. Uses explicit language paths (/en/..., /ml/...) so the
// remembered language cookie is updated, and the page does not bounce back to the last language used.
export default function AdminLangToggle({ section = '' }: { section?: string }) {
  const options = [
    { code: 'en', label: 'English' },
    { code: 'ml', label: 'മലയാളം' },
  ];

  return (
    <nav aria-label="Language" className="flex gap-2">
      {options.map((o) => (
        <a
          key={o.code}
          href={`/${o.code}/admin${section}`}
          className="px-3 py-1 rounded-full border-2 border-deep-red text-deep-red text-sm hover:bg-deep-red hover:text-white"
        >
          {o.label}
        </a>
      ))}
    </nav>
  );
}
