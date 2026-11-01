// Store details as listed on the Google Business Profile
export const business = {
  name: 'Sri Ayyappa Pooja Store',
  phoneDisplay: '+91 78921 92255',
  phoneTel: '+917892192255',
  addressLines: [
    '94, Venkateshwara Layout, Kulume Palya Main Road',
    'Shanbhoganahalli, Bannerghatta Post, Jigani Hobli',
    'Anekal Taluk, Bengaluru, Karnataka 560083',
  ],
  address: {
    streetAddress: '94, Venkateshwara Layout, Kulume Palya Main Road, Shanbhoganahalli, Bannerghatta Post, Jigani Hobli',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560083',
    addressCountry: 'IN',
  },
  lat: 12.8303212,
  lng: 77.5596943,
  opens: '07:30',
  closes: '20:00',
  mapsUrl: 'https://maps.app.goo.gl/EUh2NGaWHWoD1cwKA',
};

export const mapEmbedUrl = `https://maps.google.com/maps?q=${business.lat},${business.lng}&z=16&output=embed`;
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`;

export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: business.name,
  telephone: business.phoneTel,
  address: { '@type': 'PostalAddress', ...business.address },
  geo: { '@type': 'GeoCoordinates', latitude: business.lat, longitude: business.lng },
  hasMap: business.mapsUrl,
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: business.opens,
    closes: business.closes,
  },
};
