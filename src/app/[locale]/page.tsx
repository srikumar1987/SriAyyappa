import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';

const mockProducts = [
  // Pooja Items
  {
    id: 'P001',
    name: {
      en: 'Brass Lamp',
      hi: 'पीतल का दीया',
      kn: 'ಹಿತ್ತಾಳೆ ದೀಪ',
      ml: 'പിത്തള വിളക്ക്',
      te: 'ఇత్తు దీపం',
      ta: 'பித்தளை தீபம்',
    },
    price: 200,
    image: '/images/brass-lamp.svg',
    category: 'Pooja Items',
  },
  {
    id: 'P002',
    name: {
      en: 'Agarbatti',
      hi: 'अगरबत्ती',
      kn: 'ಅಗರ್ಬತ್ತಿ',
      ml: 'അഗർബത്തി',
      te: 'అగరుబత్తి',
      ta: 'அகர்பத்தி',
    },
    price: 15,
    image: '/images/agarbatti.svg',
    category: 'Incense',
  },
  {
    id: 'P003',
    name: {
      en: 'Pooja Thali',
      hi: 'पूजा थाली',
      kn: 'ಪೂಜಾ ತಾಳಿ',
      ml: 'പൂജാ താളം',
      te: 'పూజా తాళి',
      ta: 'பூஜை தாளி',
    },
    price: 250,
    image: '/images/pooja-thali.svg',
    category: 'Pooja Items',
  },
  {
    id: 'P004',
    name: {
      en: 'Kumkum',
      hi: 'कुंकुम',
      kn: 'ಕುಂಕುಮ',
      ml: 'കുങ്കുമം',
      te: 'కుంకుమ్',
      ta: 'குங்குமம்',
    },
    price: 30,
    image: '/images/kumkum.svg',
    category: 'Pooja Items',
  },
  {
    id: 'P005',
    name: {
      en: 'Camphor',
      hi: 'कपूर',
      kn: 'ಕರ್ಪೂರ',
      ml: 'കര്പ്പൂരം',
      te: 'కర్పూరం',
      ta: 'கர்பூரம்',
    },
    price: 20,
    image: '/images/camphor.svg',
    category: 'Pooja Items',
  },
  {
    id: 'P006',
    name: {
      en: 'Brass Idol',
      hi: 'पीतल की मूर्ति',
      kn: 'ಹಿತ್ತಾಳೆ ವಿಗ್ರಹ',
      ml: 'പിത്തള വിഗ്രഹം',
      te: 'ఇత్తు విగ్రహం',
      ta: 'பித்தளை சிலை',
    },
    price: 500,
    image: '/images/brass-lamp.svg',
    category: 'Idols',
  },
  // Kerala Snacks & Items
  {
    id: 'K001',
    name: {
      en: 'Banana Chips',
      hi: 'केले के चिप्स',
      kn: 'ಬಾಳೆಹಣ್ಣಿನ ಚಿಪ್ಸ್',
      ml: 'ഉപ്പേരി',
      te: 'అరటి చిప్స్',
      ta: 'வாழைச்சிப்ஸ்',
    },
    price: 80,
    image: '/images/banana-chips.svg',
    category: 'Kerala Snacks',
  },
  {
    id: 'K002',
    name: {
      en: 'Mixture',
      hi: 'मिक्सचर',
      kn: 'ಮಿಶ್ರಣ',
      ml: 'മിശ്രിതം',
      te: 'మిక్స్చర్',
      ta: 'மிக்ஸ்சர்',
    },
    price: 120,
    image: '/images/mixture.svg',
    category: 'Kerala Snacks',
  },
  {
    id: 'K003',
    name: {
      en: 'Murukku',
      hi: 'मुरुक्कू',
      kn: 'ಮುರುಕು',
      ml: 'മുരുക്ക്',
      te: 'మురుక్కు',
      ta: 'முருக்கு',
    },
    price: 100,
    image: '/images/murukku.svg',
    category: 'Kerala Snacks',
  },
  {
    id: 'K004',
    name: {
      en: 'Achappam',
      hi: 'ाचप्पम',
      kn: 'ಅಚಪ್ಪಮ್',
      ml: 'അച്ചപ്പം',
      te: 'అచ్చప్పం',
      ta: 'அச்சப்பம்',
    },
    price: 90,
    image: '/images/achappam.svg',
    category: 'Kerala Snacks',
  },
  {
    id: 'K005',
    name: {
      en: 'Jackfruit Chips',
      hi: 'कटहल के चिप्स',
      kn: 'ಹಲಸಿನ ಹಣ್ಣಿನ ಚಿಪ್ಸ್',
      ml: 'ചക്ക ചിപ്സ്',
      te: 'పనస చిప్స్',
      ta: 'பலா சிப்ஸ்',
    },
    price: 150,
    image: '/images/jackfruit-chips.svg',
    category: 'Kerala Snacks',
  },
  {
    id: 'K006',
    name: {
      en: 'Tapioca Chips',
      hi: 'कसावे के चिप्स',
      kn: 'ಸಬಕ್ಕಿ ಚಿಪ್ಸ್',
      ml: 'കപ്പ / മരച്ചീനി ചിപ്സ്',
      te: 'కాసావ చిప్స్',
      ta: 'மரச்சீனி சிப்ஸ்',
    },
    price: 70,
    image: '/images/tapioca-chips.svg',
    category: 'Kerala Snacks',
  },
  {
    id: 'K007',
    name: {
      en: 'Payasam Mix',
      hi: 'पायसम मिक्स',
      kn: 'ಪಾಯಸಂ ಮಿಕ್ಸ್',
      ml: 'പായസം മിക്സ്',
      te: 'పాయసం మిక్స్',
      ta: 'பாயசம் மிக்ஸ்',
    },
    price: 180,
    image: '/images/payasam-mix.svg',
    category: 'Kerala Sweets',
  },
  {
    id: 'K008',
    name: {
      en: 'Coconut Oil',
      hi: 'नारियल तेल',
      kn: 'ತೇಂಗಿನೆ ಎಣ್ಣೆ',
      ml: 'തേങ്ങ എണ്ണ',
      te: 'కొబ్బరి నూనె',
      ta: 'தேங்காய் எண்ணெய்',
    },
    price: 250,
    image: '/images/coconut-oil.svg',
    category: 'Kerala Products',
  },
  {
    id: 'K009',
    name: {
      en: 'Kerala Spices Pack',
      hi: 'केरल मसाला पैक',
      kn: 'ಕೇರಳ ಸಂಬಾರ ಪ್ಯಾಕ್',
      ml: 'കേരള സുഗന്ധവ്യഞ്ജന പാക്ക്',
      te: 'కేరళ స్పైసెస్ ప్యాక్',
      ta: 'கேரளா மசாலா தொகுப்பு',
    },
    price: 350,
    image: '/images/spices-pack.svg',
    category: 'Kerala Products',
  },
  {
    id: 'K010',
    name: {
      en: 'Jaggery',
      hi: 'गुड़',
      kn: 'ಬೆಲ್ಲ',
      ml: 'ശർക്കര',
      te: 'బెల్లం',
      ta: 'வெல்லம்',
    },
    price: 60,
    image: '/images/jaggery.svg',
    category: 'Kerala Products',
  },
];

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('common');

  // Get unique categories
  const categories = Array.from(new Set(mockProducts.map(p => p.category)));

  // Category translation mapping
  const categoryTranslations: Record<string, string> = {
    'Pooja Items': t('poojaItems'),
    'Kerala Snacks': t('keralaSnacks'),
    'Kerala Products': t('keralaProducts'),
    'Kerala Sweets': t('keralaSweets'),
    'Incense': t('incense'),
    'Idols': t('idols'),
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center animate-sacred-light">
        <div className="max-w-4xl mx-auto">
          <div className="text-6xl mb-6">🙏</div>
          <h2 className="text-4xl md:text-5xl font-serif text-deep-red mb-4">
            {t('welcome')}
          </h2>
          <p className="text-xl text-dark-brown mb-8">
            {t('tagline')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="sacred-button text-lg px-8 py-4">
              {t('browseCatalogue')}
            </button>
            <button className="sacred-button text-lg px-8 py-4 bg-white text-deep-red hover:bg-cream">
              {t('searchProducts')}
            </button>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="px-6 py-2 rounded-full bg-saffron text-white font-medium">
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-2 rounded-full bg-white text-dark-brown border-2 border-saffron hover:bg-saffron hover:text-white transition-all"
              >
                {categoryTranslations[category] || category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-serif text-center text-deep-red mb-12">
            Featured Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockProducts.map((product, index) => (
              <div
                key={product.id}
                className="scroll-reveal"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} locale={locale} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-serif text-center text-deep-red mb-12">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center scroll-reveal">
              <div className="text-5xl mb-4">🪔</div>
              <h4 className="text-xl font-serif text-deep-red mb-2">
                Authentic Products
              </h4>
              <p className="text-dark-brown">
                Genuine pooja items and Kerala products from trusted suppliers
              </p>
            </div>
            <div className="text-center scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl mb-4">🙏</div>
              <h4 className="text-xl font-serif text-deep-red mb-2">
                Sacred Quality
              </h4>
              <p className="text-dark-brown">
                Every item blessed and carefully selected
              </p>
            </div>
            <div className="text-center scroll-reveal" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl mb-4">📱</div>
              <h4 className="text-xl font-serif text-deep-red mb-2">
                Easy Ordering
              </h4>
              <p className="text-dark-brown">
                Order via WhatsApp in your preferred language
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-red text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-4xl mb-4">🪷</div>
          <p className="text-gold font-serif text-xl mb-2">
            {t('storeName')}
          </p>
          <p className="text-white/80 text-sm">
            © 2026 All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
