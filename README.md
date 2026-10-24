# Ayyappa Pooja Store

A devotional e-commerce website for a Pooja Store with multi-language support (English, Hindi, Kannada, Malayalam, Telugu, Tamil).

## Features

- 🌐 **Multi-language Support**: 6 Indian languages with instant switching
- 🙏 **Devotional Theme**: Sacred colors, animations, and spiritual atmosphere
- 📱 **Mobile-First Design**: Responsive for all devices
- 🔍 **Multi-language Search**: Search in any supported language
- 📱 **WhatsApp Integration**: Easy ordering via WhatsApp
- 📊 **Inventory Management**: Track lots, sales, and expenses
- 🎨 **Beautiful UI**: Traditional Indian aesthetics with modern usability

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **Storage**: Google Drive (images and data)
- **Database**: Google Sheets (via API)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm installed
- Google Cloud account (for Google Drive/Sheets API)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
Ayyappa/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Language-specific pages
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── Header.tsx         # Sacred header
│   │   ├── LanguageSwitcher.tsx
│   │   └── ProductCard.tsx
│   ├── lib/                   # Utility functions
│   ├── locales/              # Translation files
│   │   ├── en/
│   │   ├── hi/
│   │   ├── kn/
│   │   ├── ml/
│   │   ├── te/
│   │   └── ta/
│   ├── i18n.ts               # Language configuration
│   ├── i18n/
│   │   └── request.ts        # i18n request config
│   └── middleware.ts         # Language detection
├── public/
│   └── images/               # Product images
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Language Switching

The website supports 6 languages:
- English (en)
- Hindi (hi) - हिंदी
- Kannada (kn) - ಕನ್ನಡ
- Malayalam (ml) - മലയാളം
- Telugu (te) - తెలుగు
- Tamil (ta) - தமிழ்

Users can switch languages using the dropdown in the header. The preference is saved to localStorage.

## Devotional Theme

The website features:
- **Sacred Colors**: Saffron (#FF9933), Deep Red (#C41E3A), Gold (#FFD700)
- **Traditional Patterns**: Subtle mandala backgrounds, rangoli borders
- **Animations**: Sacred light effects, diya flame flickering, lotus bloom
- **Symbols**: Om (ൠ), Lotus (🪷), Diya (🪔)

## Google Drive Integration

### Setup

1. Create a Google Cloud Project
2. Enable Google Drive API and Google Sheets API
3. Create service account credentials
4. Share Google Drive folder with service account email
5. Add credentials to `.env.local`

### Environment Variables

```env
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
```

## Inventory Management

### Google Sheets Structure

1. **Products** - Master catalogue
2. **Lots** - Inventory batches
3. **Sales** - Sales records
4. **Expenses** - Direct lot expenses
5. **Overhead** - Business overhead
6. **Analytics** - Auto-generated reports
7. **Reorder** - Reorder recommendations
8. **SlowMoving** - Dead stock tracking

### Features

- FIFO (First In, First Out) lot selection
- Automatic profit calculation
- Low stock alerts
- Supplier performance tracking
- Seasonal trend analysis

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The website can be deployed to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting

## Contributing

This is a family business project. Please contact the maintainers for contributions.

## License

Proprietary - All rights reserved

## Support

For support, please contact via WhatsApp or visit the store.
