'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { localePath } from '@/lib/paths';

const SPEECH_LANG: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  te: 'te-IN',
  ta: 'ta-IN',
};

interface SpeechResultEvent {
  results: { 0: { 0: { transcript: string } } };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

type SpeechCtor = new () => SpeechRecognitionLike;

export default function SearchBox({ locale, initialQuery }: { locale: string; initialQuery: string }) {
  const t = useTranslations('shop');
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);

  function startVoice() {
    const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceOk(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = SPEECH_LANG[locale] ?? 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      if (inputRef.current) inputRef.current.value = e.results[0][0].transcript;
      formRef.current?.requestSubmit();
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  return (
    <div className="space-y-3">
      <form ref={formRef} method="get" action={localePath(locale, '/search')} className="flex gap-2">
        <input
          ref={inputRef}
          name="q"
          defaultValue={initialQuery}
          maxLength={100}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchTitle')}
          className="flex-1 text-lg border-2 border-saffron rounded-xl p-3 bg-white"
        />
        <button type="submit" className="sacred-button px-5">
          {t('searchButton')}
        </button>
        <button
          type="button"
          onClick={startVoice}
          disabled={listening}
          aria-label={t('voiceSearch')}
          title={t('voiceSearch')}
          className="px-4 rounded-xl border-2 border-deep-red text-xl disabled:opacity-60"
        >
          🎤
        </button>
      </form>
      {listening && <p className="text-deep-red">{t('listening')}</p>}
      {!voiceOk && <p className="text-dark-brown text-sm">{t('voiceUnsupported')}</p>}
    </div>
  );
}
