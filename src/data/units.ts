import type { Locale } from '@/i18n';

export const UNITS = ['piece', 'pack', 'dozen', 'g', 'kg', 'ml', 'l'] as const;
export type Unit = (typeof UNITS)[number];

/** Weight and volume can be sold in parts (e.g. 0.5 kg); counted units cannot. */
export const allowsDecimal = (u: Unit): boolean => u === 'g' || u === 'kg' || u === 'ml' || u === 'l';

export const isUnit = (v: unknown): v is Unit => (UNITS as readonly string[]).includes(v as string);

/** Short symbol for quantities, same in every language. */
export const unitShort: Record<Unit, string> = {
  piece: 'pcs',
  pack: 'pkt',
  dozen: 'doz',
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'L',
};

/** "per kg", written naturally in each language. */
export const unitPer: Record<Unit, Record<Locale, string>> = {
  piece: { en: 'per piece', hi: 'प्रति नग', kn: 'ಒಂದಕ್ಕೆ', ml: 'ഒന്നിന്', te: 'ఒక్కోదానికి', ta: 'ஒன்றுக்கு' },
  pack: { en: 'per pack', hi: 'प्रति पैकेट', kn: 'ಪ್ರತಿ ಪ್ಯಾಕೆಟ್', ml: 'ഒരു പായ്ക്കറ്റിന്', te: 'ఒక్కో ప్యాకెట్‌కు', ta: 'ஒரு பாக்கெட்டுக்கு' },
  dozen: { en: 'per dozen', hi: 'प्रति दर्जन', kn: 'ಪ್ರತಿ ಡಜನ್', ml: 'ഒരു ഡസന്', te: 'డజనుకు', ta: 'ஒரு டஜனுக்கு' },
  g: { en: 'per gram', hi: 'प्रति ग्राम', kn: 'ಪ್ರತಿ ಗ್ರಾಂ', ml: 'ഒരു ഗ്രാമിന്', te: 'గ్రాముకు', ta: 'ஒரு கிராமுக்கு' },
  kg: { en: 'per kg', hi: 'प्रति किलो', kn: 'ಪ್ರತಿ ಕೆಜಿ', ml: 'ഒരു കിലോയ്ക്ക്', te: 'కిలోకు', ta: 'ஒரு கிலோவுக்கு' },
  ml: { en: 'per ml', hi: 'प्रति मि.ली.', kn: 'ಪ್ರತಿ ಮಿ.ಲೀ.', ml: 'ഒരു മി.ലി.ക്ക്', te: 'మి.లీ.కు', ta: 'ஒரு மி.லி.க்கு' },
  l: { en: 'per litre', hi: 'प्रति लीटर', kn: 'ಪ್ರತಿ ಲೀಟರ್', ml: 'ഒരു ലിറ്ററിന്', te: 'లీటరుకు', ta: 'ஒரு லிட்டருக்கு' },
};

/** Unit names for the admin dropdown (Malayalam and English admin). */
export const unitName: Record<Unit, { en: string; ml: string }> = {
  piece: { en: 'Pieces (count)', ml: 'എണ്ണം' },
  pack: { en: 'Packets', ml: 'പായ്ക്കറ്റ്' },
  dozen: { en: 'Dozen', ml: 'ഡസൻ' },
  g: { en: 'Grams', ml: 'ഗ്രാം' },
  kg: { en: 'Kilograms', ml: 'കിലോ' },
  ml: { en: 'Millilitres', ml: 'മില്ലിലിറ്റർ' },
  l: { en: 'Litres', ml: 'ലിറ്റർ' },
};
