'use client';

export default function PrintButton({ label }: { label: string }) {
  return (
    <button onClick={() => window.print()} className="sacred-button px-6 py-3 print:hidden">
      {label}
    </button>
  );
}
