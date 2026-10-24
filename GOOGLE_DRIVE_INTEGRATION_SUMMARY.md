# Google Drive Integration - Summary

## 📧 Configuration

**Email:** ayyappa.blore.2026@gmail.com

## ✅ What's Been Set Up

### **1. Configuration Files Updated**

**.env.example:**
- Updated service account email to use the project format
- Ready for actual credentials

**package.json:**
- Added `googleapis` package for Google Drive/Sheets integration

### **2. Google Drive Library Created**

**File:** `src/lib/googleDrive.ts`

**Functions Available:**
- `initializeGoogleServices()` - Initialize Drive and Sheets APIs
- `getProductsFromSheets()` - Fetch all products from Google Sheets
- `getImageUrl()` - Get image URLs from Google Drive
- `addSaleToSheets()` - Record a sale to Google Sheets
- `addLotToSheets()` - Add new inventory lot to Google Sheets
- `getLotsFromSheets()` - Fetch all lots from Google Sheets
- `testGoogleDriveConnection()` - Test Drive connection
- `testGoogleSheetsConnection()` - Test Sheets connection

### **3. Setup Guide Created**

**File:** `GOOGLE_DRIVE_SETUP_GUIDE.md`

Complete step-by-step guide covering:
- Creating Google Cloud Project
- Enabling APIs (Drive & Sheets)
- Creating Service Account
- Setting up Drive folder structure
- Creating Google Sheets with all tabs
- Sharing with service account
- Configuring .env.local
- Testing the connection
- Troubleshooting

---

## 🚀 Next Steps to Complete Integration

### **Step 1: Follow the Setup Guide**

Open `GOOGLE_DRIVE_SETUP_GUIDE.md` and follow all 12 steps:

1. Create Google Cloud Project
2. Enable Drive and Sheets APIs
3. Create Service Account
4. Create Service Account Key
5. Extract credentials
6. Create Drive folder structure
7. Share folder with service account
8. Create Google Sheets with all tabs
9. Get Drive Folder ID
10. Create .env.local file
11. Install googleapis package
12. Test connection

### **Step 2: Create .env.local**

After following the setup guide, create `.env.local` in the project root:

```env
GOOGLE_DRIVE_FOLDER_ID=your_actual_folder_id
GOOGLE_SHEETS_SPREADSHEET_ID=your_actual_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=ayyappa-pooja-store@your-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nactual_private_key_here\n-----END PRIVATE KEY-----\n"
WHATSAPP_PHONE_NUMBER=919876543210
```

### **Step 3: Install Dependencies**

```bash
cd Ayyappa
npm install
```

This will install the `googleapis` package.

### **Step 4: Test the Integration**

Create a test file to verify everything works:

```typescript
// test-connection.ts
import { testGoogleDriveConnection, testGoogleSheetsConnection } from './src/lib/googleDrive';

async function runTests() {
  console.log('Testing Google Drive connection...');
  const driveOk = await testGoogleDriveConnection();

  console.log('Testing Google Sheets connection...');
  const sheetsOk = await testGoogleSheetsConnection();

  if (driveOk && sheetsOk) {
    console.log('✅ All connections successful!');
  } else {
    console.log('❌ Some connections failed. Check the setup guide.');
  }
}

runTests();
```

Run it:
```bash
npx ts-node test-connection.ts
```

---

## 📁 Google Drive Structure

### **Folder Structure to Create:**

```
Ayyappa Pooja Store (Google Drive)
├── Images/
│   ├── P001_Brass_Lamp/
│   │   ├── main.jpg
│   │   ├── angle1.jpg
│   │   └── angle2.jpg
│   ├── P002_Agarbatti/
│   ├── K001_Banana_Chips/
│   └── ... (one folder per product)
│
└── Data/
    └── Ayyappa Pooja Store Data (Google Sheet)
        ├── Sheet: Products
        ├── Sheet: Lots
        ├── Sheet: Sales
        ├── Sheet: Expenses
        └── Sheet: Overhead
```

### **Google Sheets Structure:**

**Sheet 1: Products**
- Product ID, Names in 6 languages, Category, Price, Image Folder

**Sheet 2: Lots**
- Lot ID, Product ID, Date, Supplier, Buying Price, Quantity, etc.

**Sheet 3: Sales**
- Sale ID, Date, Lot ID, Product ID, Quantity, Price, Customer info

**Sheet 4: Expenses**
- Expense ID, Lot ID, Type, Amount, Description

**Sheet 5: Overhead**
- Overhead ID, Period, Type, Amount, Description

---

## 🔐 Security Notes

### **Important:**

1. **Never commit .env.local to GitHub**
   - It contains sensitive credentials
   - Already in .gitignore

2. **Keep service account key safe**
   - Only share with trusted developers
   - Store securely
   - Rotate if compromised

3. **Share only what's necessary**
   - Share Drive folder with service account
   - Don't share the key itself

---

## 📊 How It Will Work

### **Data Flow:**

```
┌─────────────────────────────────────────┐
│  Uncle/Aunty (Google Sheets App)        │
│  - Edit products                         │
│  - Add lots                              │
│  - Record sales (via app)                │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Google Drive / Sheets                  │
│  - Central storage                       │
│  - Auto-syncs                            │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Next.js Website                         │
│  - Reads from Drive/Sheets API          │
│  - Displays products                     │
│  - Records sales                         │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Customers                               │
│  - Browse catalogue                      │
│  - Order via WhatsApp                    │
└─────────────────────────────────────────┘
```

### **Sync Strategy:**

**Recommended:** Polling every 5 minutes
- Website checks for changes every 5 minutes
- Caches data for performance
- Simple to implement
- Good balance of freshness and performance

**Alternative:** Manual refresh button
- Uncle/Aunty click "Sync" button
- Full control over when to sync
- Good for low-traffic periods

---

## 🎯 Benefits for Uncle/Aunty

### **Simple Workflow:**

1. **Add Product:**
   - Open Google Sheets app on phone
   - Add row in "Products" sheet
   - Upload photos to Drive folder
   - Done!

2. **Add Stock:**
   - Open Google Sheets
   - Add row in "Lots" sheet
   - Done!

3. **View Inventory:**
   - Open Google Sheets
   - See all products and stock levels
   - Filter, sort, export as needed

4. **Record Sale:**
   - Use mobile app (or website admin)
   - Scan/speak product
   - Sale recorded automatically to Sheets

### **No Technical Knowledge Needed:**
- Google Sheets app is familiar (like Excel)
- Works offline
- Auto-syncs when online
- Easy to learn

---

## 📞 Support Resources

### **Documentation:**
- `GOOGLE_DRIVE_SETUP_GUIDE.md` - Complete setup instructions
- `README.md` - Project overview
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

### **Google Resources:**
- Google Cloud Console: https://console.cloud.google.com/
- Drive API Docs: https://developers.google.com/drive/api/v3/reference
- Sheets API Docs: https://developers.google.com/sheets/api

### **Troubleshooting:**
- Check the "Troubleshooting" section in setup guide
- Verify all IDs and emails are correct
- Ensure proper permissions are set
- Check Google Cloud quotas

---

## ✅ Current Status

**Completed:**
- ✅ Google Drive library created (`src/lib/googleDrive.ts`)
- ✅ Configuration files updated
- ✅ Setup guide written
- ✅ Package dependencies added
- ✅ Email configured (ayyappa.blore.2026@gmail.com)

**Pending (User Action Required):**
- ⏳ Create Google Cloud Project
- ⏳ Enable APIs
- ⏳ Create Service Account
- ⏳ Set up Drive folder structure
- ⏳ Create Google Sheets
- ⏳ Configure .env.local
- ⏳ Test connection

---

## 🎉 Once Complete

After following the setup guide:

1. **Website will read products from Google Sheets**
2. **Images will load from Google Drive**
3. **Sales will record to Google Sheets**
4. **Uncle/Aunty can manage everything via Google Sheets**
5. **No database costs - everything is free!**

---

## 📝 Quick Reference

**Service Account Email Format:**
```
ayyappa-pooja-store@PROJECT_ID.iam.gserviceaccount.com
```

**Folder ID:**
Found in URL: `https://drive.google.com/drive/folders/FOLDER_ID`

**Sheet ID:**
Found in URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`

**Private Key Format:**
Must include `\n` for newlines in .env.local:
```
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nkey_here\n-----END PRIVATE KEY-----\n"
```

---

**Ready to set up?** Follow the `GOOGLE_DRIVE_SETUP_GUIDE.md` step by step!
