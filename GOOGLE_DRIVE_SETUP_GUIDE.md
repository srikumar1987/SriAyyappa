# Google Drive Integration Setup Guide

## 📧 Email: ayyappa.blore.2026@gmail.com

This guide will help you set up Google Drive and Google Sheets integration for the Ayyappa Pooja Store website.

---

## 🎯 What This Integration Does

- **Store product images** in Google Drive
- **Store inventory data** in Google Sheets
- **Auto-sync** data to the website
- **Uncle/Aunty can edit** directly in Google Sheets/Drive
- **No database costs** - everything is free!

---

## 📋 Prerequisites

- Google account: `ayyappa.blore.2026@gmail.com`
- Access to Google Cloud Console
- Basic computer skills

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Google Cloud Project**

1. Go to https://console.cloud.google.com/
2. Sign in with `ayyappa.blore.2026@gmail.com`
3. Click "Select a project" → "New Project"
4. Project name: `Ayyappa Pooja Store`
5. Click "Create"
6. Wait for project to be created (1-2 minutes)

---

### **Step 2: Enable APIs**

1. In the Google Cloud Console, make sure your project is selected
2. Go to "APIs & Services" → "Library"
3. Search for "Google Drive API"
4. Click on it and click "Enable"
5. Search for "Google Sheets API"
6. Click on it and click "Enable"

---

### **Step 3: Create Service Account**

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - Service account name: `ayyappa-pooja-store`
   - Service account description: `Service account for Ayyappa Pooja Store website`
4. Click "Create and Continue"
5. Skip granting roles (click "Done")
6. You'll see the service account created with email like:
   `ayyappa-pooja-store@PROJECT_ID.iam.gserviceaccount.com`

**IMPORTANT:** Copy this email address!

---

### **Step 4: Create Service Account Key**

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Key type: Select "JSON"
5. Click "Create"
6. A JSON file will download automatically
7. **IMPORTANT:** Keep this file safe! Don't share it!

---

### **Step 5: Extract Credentials from JSON**

Open the downloaded JSON file. You'll see something like:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "ayyappa-pooja-store@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Copy these values:**
- `project_id` → Not needed for now
- `private_key` → Needed for .env.local
- `client_email` → Needed for .env.local

---

### **Step 6: Create Google Drive Folder Structure**

1. Go to https://drive.google.com (logged in as `ayyappa.blore.2026@gmail.com`)
2. Create a new folder named "Ayyappa Pooja Store"
3. Inside it, create these folders:

```
Ayyappa Pooja Store/
├── Images/
│   ├── P001_Brass_Lamp/
│   ├── P002_Agarbatti/
│   ├── K001_Banana_Chips/
│   └── ... (one folder per product)
└── Data/
    ├── Products.xlsx
    ├── Lots.xlsx
    ├── Sales.xlsx
    ├── Expenses.xlsx
    ├── Overhead.xlsx
    └── Analytics.xlsx
```

---

### **Step 7: Share Drive Folder with Service Account**

1. Right-click on "Ayyappa Pooja Store" folder
2. Click "Share"
3. In "Share with people and groups", enter the service account email:
   `ayyappa-pooja-store@your-project-id.iam.gserviceaccount.com`
4. Set permission to "Editor"
5. Click "Send"

**This allows the website to read and write to this folder!**

---

### **Step 8: Create Google Sheets**

1. Go to https://sheets.google.com (logged in as `ayyappa.blore.2026@gmail.com`)
2. Create a new Google Sheet named "Ayyappa Pooja Store Data"
3. Create these sheets (tabs at the bottom):

**Sheet 1: Products**
Columns: A-J
- A: Product ID
- B: Name_Malayalam
- C: Name_English
- D: Name_Tamil
- E: Name_Kannada
- F: Name_Telugu
- G: Name_Hindi
- H: Category
- I: Default_Selling_Price
- J: Image_Folder_Name

**Sheet 2: Lots**
Columns: A-P
- A: Lot ID
- B: Product ID
- C: Lot_Date
- D: Supplier_Name
- E: Buying_Price_Per_Unit
- F: Quantity_Received
- G: Quantity_Sold
- H: Quantity_Remaining
- I: Selling_Price_Per_Unit
- J: Total_Buying_Cost
- K: Direct_Expenses
- L: Total_Cost
- M: Expected_Revenue
- N: Expected_Profit
- O: Profit_Margin_%
- P: Status

**Sheet 3: Sales**
Columns: A-L
- A: Sale ID
- B: Date_Time
- C: Lot_ID
- D: Product_ID
- E: Quantity_Sold
- F: Selling_Price_Per_Unit
- G: Total_Amount
- H: Customer_Name
- I: Customer_Phone
- J: Payment_Method
- K: Delivery_Method
- L: Notes

**Sheet 4: Expenses**
Columns: A-I
- A: Expense ID
- B: Lot ID
- C: Expense_Type
- D: Amount
- E: Date
- F: Description_Malayalam
- G: Description_English
- H: Bill_Reference
- I: Paid_To

**Sheet 5: Overhead**
Columns: A-H
- A: Overhead ID
- B: Period
- C: Expense_Type
- D: Amount
- E: Date
- F: Description_Malayalam
- G: Description_English
- H: Is_Recurring

4. Save the sheet
5. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   The part after `/d/` and before `/edit` is the Sheet ID

---

### **Step 9: Get Drive Folder ID**

1. Go to your "Ayyappa Pooja Store" folder in Google Drive
2. Open the folder
3. Look at the URL:
   `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
4. Copy the FOLDER_ID

---

### **Step 10: Create .env.local File**

1. In your Ayyappa project folder, create a file named `.env.local`
2. Add the following:

```env
# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=YOUR_FOLDER_ID_HERE
GOOGLE_SHEETS_SPREADSHEET_ID=YOUR_SHEET_ID_HERE
GOOGLE_SERVICE_ACCOUNT_EMAIL=ayyappa-pooja-store@YOUR_PROJECT_ID.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER=919876543210

# Translation API (Optional)
TRANSLATION_API_KEY=
```

**Replace:**
- `YOUR_FOLDER_ID_HERE` → From Step 9
- `YOUR_SHEET_ID_HERE` → From Step 8
- `YOUR_PROJECT_ID` → From the JSON file
- `YOUR_PRIVATE_KEY_HERE` → The entire private key from JSON (including newlines)

**IMPORTANT:** The private key must be in quotes and include `\n` for newlines!

---

### **Step 11: Install Google APIs Package**

In your project folder, run:

```bash
npm install googleapis
```

---

### **Step 12: Test the Connection**

Create a test file to verify the connection:

```typescript
// lib/test-google-drive.ts
import { google } from 'googleapis';
import { readFileSync } from 'fs';

const credentials = JSON.parse(readFileSync('path/to/service-account-key.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
});

const drive = google.drive({ version: 'v3', auth });

async function testConnection() {
  try {
    const response = await drive.files.list({
      q: `name='Ayyappa Pooja Store'`,
    });
    console.log('✅ Connected to Google Drive!');
    console.log('Found folder:', response.data.files);
  } catch (error) {
    console.error('❌ Error connecting to Google Drive:', error);
  }
}

testConnection();
```

Run it to test:
```bash
npx ts-node lib/test-google-drive.ts
```

---

## 📁 Google Drive Folder Structure (Final)

```
📁 Ayyappa Pooja Store (Shared with service account)
├── 📁 Images/
│   ├── 📁 P001_Brass_Lamp/
│   │   ├── main.jpg
│   │   ├── angle1.jpg
│   │   └── angle2.jpg
│   ├── 📁 P002_Agarbatti/
│   ├── 📁 K001_Banana_Chips/
│   └── ... (1000+ product folders)
│
└── 📁 Data/
    └── 📊 Ayyappa Pooja Store Data (Google Sheet)
        ├── Sheet: Products
        ├── Sheet: Lots
        ├── Sheet: Sales
        ├── Sheet: Expenses
        └── Sheet: Overhead
```

---

## 🔐 Security Best Practices

### **DO:**
- ✅ Keep the service account key file safe
- ✅ Never commit `.env.local` to GitHub
- ✅ Use `.env.example` as template
- ✅ Only share folder with service account (not the key)
- ✅ Regularly rotate keys if needed

### **DON'T:**
- ❌ Share the service account key with anyone
- ❌ Commit the key to GitHub
- ❌ Use personal account credentials
- ❌ Share the JSON file publicly

---

## 🎯 How Uncle/Aunty Will Use This

### **Daily Operations:**

1. **Add New Product:**
   - Open Google Sheets on phone
   - Go to "Products" sheet
   - Add new row with product details
   - Upload photos to Google Drive folder
   - Done! Website updates automatically

2. **Record Sale:**
   - Use mobile app (or website admin)
   - Scan barcode or speak product name
   - Sale recorded in Google Sheets automatically

3. **Add Stock:**
   - Open Google Sheets
   - Go to "Lots" sheet
   - Add new lot details
   - Done!

### **No Technical Knowledge Needed:**
- Uncle/Aunty just use Google Sheets app on phone
- Same as using Excel
- Everything syncs automatically
- Website reads from Sheets automatically

---

## 🔄 Sync Frequency

**How often does the website update?**

- **Option 1: Real-time** (more complex)
  - Use Google Sheets API webhooks
  - Updates instantly when Sheets change

- **Option 2: Polling** (simpler, recommended)
  - Website checks for changes every 5 minutes
  - Caches data for performance
  - Simple to implement

- **Option 3: Manual Refresh**
  - "Refresh" button on admin dashboard
  - Uncle/Aunty click to sync
  - Most control, least automation

**Recommendation:** Start with Option 2 (polling every 5 minutes)

---

## 📊 Data Flow

```
Uncle/Aunty (Google Sheets App)
    ↓ (Edit data)
Google Drive/Sheets
    ↓ (API)
Next.js Website
    ↓ (Display)
Customers
```

---

## 🐛 Troubleshooting

### **Error: "Insufficient Permission"**

**Solution:**
1. Make sure you shared the Drive folder with the service account email
2. Set permission to "Editor" (not just Viewer)
3. Wait a few minutes for permissions to propagate

### **Error: "API key not valid"**

**Solution:**
1. Check that the private key is correctly formatted in .env.local
2. Make sure newlines are represented as `\n`
3. Verify the service account email is correct

### **Error: "File not found"**

**Solution:**
1. Verify the Folder ID is correct
2. Make sure the folder is shared with service account
3. Check that the folder name matches exactly

### **Sheets not updating**

**Solution:**
1. Check if the Sheet ID is correct
2. Verify service account has edit access to the sheet
3. Try sharing the sheet directly with service account email

---

## 📞 Support

If you need help:
1. Check the Google Cloud Console for API errors
2. Verify all IDs and emails are correct
3. Make sure the service account has proper permissions
4. Check the Google Cloud quotas (free tier is generous)

---

## ✅ Checklist

Before testing the integration:

- [ ] Google Cloud Project created
- [ ] Drive API enabled
- [ ] Sheets API enabled
- [ ] Service account created
- [ ] Service account key downloaded
- [ ] Drive folder created and shared
- [ ] Google Sheets created with all tabs
- [ ] Sheet shared with service account
- [ ] .env.local file created with correct values
- [ ] googleapis package installed
- [ ] Test connection successful

---

## 🎉 Next Steps

Once Google Drive integration is set up:

1. **Import existing products** (if any)
2. **Upload product images** to Drive
3. **Test the website** with real data
4. **Train Uncle/Aunty** on using Google Sheets
5. **Monitor sync** for first few days
6. **Adjust sync frequency** if needed

---

## 📚 Additional Resources

- Google Drive API Docs: https://developers.google.com/drive/api/v3/reference
- Google Sheets API Docs: https://developers.google.com/sheets/api
- Google Cloud Console: https://console.cloud.google.com/
- Service Account Docs: https://cloud.google.com/iam/docs/service-accounts

---

**Email:** ayyappa.blore.2026@gmail.com
**Project:** Ayyappa Pooja Store
**Status:** Setup in progress
