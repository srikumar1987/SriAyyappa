import type { Locale } from '@/i18n';

export type Category =
  | 'pooja'
  | 'idols'
  | 'incense'
  | 'kerala-snacks'
  | 'kerala-sweets'
  | 'kerala-products';

export const categoryKeys: Record<Category, string> = {
  pooja: 'poojaItems',
  idols: 'idols',
  incense: 'incense',
  'kerala-snacks': 'keralaSnacks',
  'kerala-sweets': 'keralaSweets',
  'kerala-products': 'keralaProducts',
};

export const keralaCategories: Category[] = ['kerala-snacks', 'kerala-sweets', 'kerala-products'];

// Labels used in the Google Sheet's Category dropdown.
export const categoryLabel: Record<Category, string> = {
  pooja: 'Pooja Items',
  idols: 'Idols',
  incense: 'Incense',
  'kerala-snacks': 'Kerala Snacks',
  'kerala-sweets': 'Kerala Sweets',
  'kerala-products': 'Kerala Products',
};

/** Accepts either the sheet label ("Kerala Snacks") or the code key ("kerala-snacks"). */
export function categoryFromText(text: string): Category | undefined {
  const t = text.trim().toLowerCase();
  return (Object.keys(categoryLabel) as Category[]).find(
    (c) => c === t || categoryLabel[c].toLowerCase() === t
  );
}

export interface Product {
  id: string;
  name: Record<Locale, string>;
  category: Category;
  price: number;
  image: string;
}

// Placeholder data until Google Sheets is connected.
export const products: Product[] = [
  {
    id: 'P001',
    name: { en: 'Brass Lamp', hi: 'पीतल का दीया', kn: 'ಹಿತ್ತಾಳೆ ದೀಪ', ml: 'പിത്തള വിളക്ക്', te: 'ఇత్తడి దీపం', ta: 'பித்தளை விளக்கு' },
    category: 'pooja', price: 200, image: '/images/brass-lamp.svg',
  },
  {
    id: 'P002',
    name: { en: 'Agarbatti', hi: 'अगरबत्ती', kn: 'ಅಗರ್ಬತ್ತಿ', ml: 'അഗർബത്തി', te: 'అగరబత్తి', ta: 'அகர்பத்தி' },
    category: 'incense', price: 15, image: '/images/agarbatti.svg',
  },
  {
    id: 'P003',
    name: { en: 'Pooja Thali', hi: 'पूजा थाली', kn: 'ಪೂಜಾ ತಟ್ಟೆ', ml: 'പൂജാ താലം', te: 'పూజా తాళం', ta: 'பூஜை தட்டு' },
    category: 'pooja', price: 250, image: '/images/pooja-thali.svg',
  },
  {
    id: 'P004',
    name: { en: 'Kumkum', hi: 'कुंकुम', kn: 'ಕುಂಕುಮ', ml: 'കുങ്കുമം', te: 'కుంకుమ', ta: 'குங்குமம்' },
    category: 'pooja', price: 30, image: '/images/kumkum.svg',
  },
  {
    id: 'P005',
    name: { en: 'Camphor', hi: 'कपूर', kn: 'ಕರ್ಪೂರ', ml: 'കർപ്പൂരം', te: 'కర్పూరం', ta: 'கற்பூரம்' },
    category: 'pooja', price: 20, image: '/images/camphor.svg',
  },
  {
    id: 'P006',
    name: { en: 'Brass Idol', hi: 'पीतल की मूर्ति', kn: 'ಹಿತ್ತಾಳೆ ವಿಗ್ರಹ', ml: 'പിത്തള വിഗ്രഹം', te: 'ఇత్తడి విగ్రహం', ta: 'பித்தளை சிலை' },
    category: 'idols', price: 500, image: '/images/brass-lamp.svg',
  },
  {
    id: 'K001',
    name: { en: 'Banana Chips', hi: 'केले के चिप्स', kn: 'ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್', ml: 'ഉപ്പേരി', te: 'అరటికాయ చిప్స్', ta: 'வாழைக்காய் சிப்ஸ்' },
    category: 'kerala-snacks', price: 80, image: '/images/banana-chips.svg',
  },
  {
    id: 'K002',
    name: { en: 'Mixture', hi: 'मिक्सचर', kn: 'ಮಿಕ್ಸ್ಚರ್', ml: 'മിക്സ്ചർ', te: 'మిక్చర్', ta: 'மிக்சர்' },
    category: 'kerala-snacks', price: 120, image: '/images/mixture.svg',
  },
  {
    id: 'K003',
    name: { en: 'Murukku', hi: 'मुरुक्कु', kn: 'ಮುರುಕ್ಕು', ml: 'മുറുക്ക്', te: 'మురుక్కు', ta: 'முறுக்கு' },
    category: 'kerala-snacks', price: 100, image: '/images/murukku.svg',
  },
  {
    id: 'K004',
    name: { en: 'Achappam', hi: 'अच्चप्पम', kn: 'ಅಚ್ಚಪ್ಪಂ', ml: 'അച്ചപ്പം', te: 'అచ్చప్పం', ta: 'அச்சப்பம்' },
    category: 'kerala-snacks', price: 90, image: '/images/achappam.svg',
  },
  {
    id: 'K005',
    name: { en: 'Jackfruit Chips', hi: 'कटहल के चिप्स', kn: 'ಹಲಸಿನ ಹಣ್ಣಿನ ಚಿಪ್ಸ್', ml: 'ചക്ക ചിപ്സ്', te: 'పనస చిప్స్', ta: 'பலா சிப்ஸ்' },
    category: 'kerala-snacks', price: 150, image: '/images/jackfruit-chips.svg',
  },
  {
    id: 'K006',
    name: { en: 'Tapioca Chips', hi: 'कसावा चिप्स', kn: 'ಮರಗೆಣಸು ಚಿಪ್ಸ್', ml: 'കപ്പ ചിപ്സ്', te: 'కర్రపెండలం చిప్స్', ta: 'மரவள்ளிக்கிழங்கு சிப்ஸ்' },
    category: 'kerala-snacks', price: 70, image: '/images/tapioca-chips.svg',
  },
  {
    id: 'K007',
    name: { en: 'Payasam Mix', hi: 'पायसम मिक्स', kn: 'ಪಾಯಸ ಮಿಕ್ಸ್', ml: 'പായസം മിക്സ്', te: 'పాయసం మిక్స్', ta: 'பாயசம் மிக்ஸ்' },
    category: 'kerala-sweets', price: 180, image: '/images/payasam-mix.svg',
  },
  {
    id: 'K008',
    name: { en: 'Coconut Oil', hi: 'नारियल तेल', kn: 'ತೆಂಗಿನೆಣ್ಣೆ', ml: 'വെളിച്ചെണ്ണ', te: 'కొబ్బరి నూనె', ta: 'தேங்காய் எண்ணெய்' },
    category: 'kerala-products', price: 250, image: '/images/coconut-oil.svg',
  },
  {
    id: 'K009',
    name: { en: 'Kerala Spices Pack', hi: 'केरल मसाला पैक', kn: 'ಕೇರಳ ಮಸಾಲಾ ಪ್ಯಾಕ್', ml: 'കേരള മസാല പായ്ക്ക്', te: 'కేరళ మసాలా ప్యాక్', ta: 'கேரள மசாலா தொகுப்பு' },
    category: 'kerala-products', price: 350, image: '/images/spices-pack.svg',
  },
  {
    id: 'K010',
    name: { en: 'Jaggery', hi: 'गुड़', kn: 'ಬೆಲ್ಲ', ml: 'ശർക്കര', te: 'బెల్లం', ta: 'வெல்லம்' },
    category: 'kerala-products', price: 60, image: '/images/jaggery.svg',
  },
];
