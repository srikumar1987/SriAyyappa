'use client';

import { useCallback, useEffect, useState } from 'react';

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

function speechCtor(): SpeechCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Voice input in the page's language. `supported` is false on browsers without speech recognition. */
export function useSpeech(locale: string, onText: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => setSupported(Boolean(speechCtor())), []);

  const start = useCallback(() => {
    const Ctor = speechCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = SPEECH_LANG[locale] ?? 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => onText(e.results[0][0].transcript);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }, [locale, onText]);

  return { supported, listening, start };
}
