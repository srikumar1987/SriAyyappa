/**
 * Google Drive Integration Library
 * For Ayyappa Pooja Store
 * Email: ayyappa.blore.2026@gmail.com
 */

import { google } from 'googleapis';

// Types
export interface Product {
  id: string;
  name: {
    en: string;
    hi: string;
    kn: string;
    ml: string;
    te: string;
    ta: string;
  };
  category: string;
  defaultSellingPrice: number;
  imageFolder: string;
}

export interface Lot {
  id: string;
  productId: string;
  date: string;
  supplierName: string;
  buyingPricePerUnit: number;
  quantityReceived: number;
  quantitySold: number;
  quantityRemaining: number;
  sellingPricePerUnit: number;
  totalBuyingCost: number;
  directExpenses: number;
  totalCost: number;
  expectedRevenue: number;
  expectedProfit: number;
  profitMargin: number;
  status: string;
}

// Initialize Google Drive and Sheets APIs
export function initializeGoogleServices() {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  return { drive, sheets, auth };
}

// Get all products from Google Sheets
export async function getProductsFromSheets(): Promise<Product[]> {
  try {
    const { sheets } = initializeGoogleServices();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Products!A:J',
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const data = rows.slice(1);

    return data.map((row) => ({
      id: row[0],
      name: {
        ml: row[1],
        en: row[2],
        ta: row[3],
        kn: row[4],
        te: row[5],
        hi: row[6],
      },
      category: row[7],
      defaultSellingPrice: parseFloat(row[8]) || 0,
      imageFolder: row[9],
    }));
  } catch (error) {
    console.error('Error fetching products from Sheets:', error);
    return [];
  }
}

// Get image URL from Google Drive
export async function getImageUrl(imageFolder: string, imageName: string = 'main.jpg'): Promise<string> {
  try {
    const { drive } = initializeGoogleServices();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    // Search for the image folder
    const folderResponse = await drive.files.list({
      q: `name='${imageFolder}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id)',
    });

    const folder = folderResponse.data.files?.[0];
    if (!folder) {
      console.error(`Image folder not found: ${imageFolder}`);
      return '/images/placeholder.svg';
    }

    // Search for the image file
    const imageResponse = await drive.files.list({
      q: `name='${imageName}' and '${folder.id}' in parents`,
      fields: 'files(id, webViewLink)',
    });

    const image = imageResponse.data.files?.[0];
    if (!image) {
      console.error(`Image not found: ${imageName} in folder ${imageFolder}`);
      return '/images/placeholder.svg';
    }

    // Return the web view link or construct a direct link
    return image.webViewLink || `https://drive.google.com/uc?export=view&id=${image.id}`;
  } catch (error) {
    console.error('Error fetching image URL:', error);
    return '/images/placeholder.svg';
  }
}

// Add sale to Google Sheets
export async function addSaleToSheets(sale: {
  productId: string;
  quantity: number;
  sellingPrice: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
}): Promise<boolean> {
  try {
    const { sheets } = initializeGoogleServices();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const saleId = `S${Date.now()}`;
    const dateTime = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sales!A:L',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          saleId,
          dateTime,
          '', // Lot ID (to be auto-calculated)
          sale.productId,
          sale.quantity,
          sale.sellingPrice,
          sale.quantity * sale.sellingPrice,
          sale.customerName || '',
          sale.customerPhone || '',
          sale.paymentMethod,
          'Store Pickup',
          '',
        ]],
      },
    });

    return true;
  } catch (error) {
    console.error('Error adding sale to Sheets:', error);
    return false;
  }
}

// Add new lot to Google Sheets
export async function addLotToSheets(lot: {
  productId: string;
  supplierName: string;
  buyingPrice: number;
  quantity: number;
  sellingPrice?: number;
}): Promise<boolean> {
  try {
    const { sheets } = initializeGoogleServices();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const lotId = `L${Date.now()}`;
    const lotDate = new Date().toISOString().split('T')[0];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Lots!A:P',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          lotId,
          lot.productId,
          lotDate,
          lot.supplierName,
          lot.buyingPrice,
          lot.quantity,
          0, // Quantity Sold
          lot.quantity, // Quantity Remaining
          lot.sellingPrice || 0,
          lot.buyingPrice * lot.quantity, // Total Buying Cost
          0, // Direct Expenses
          lot.buyingPrice * lot.quantity, // Total Cost
          (lot.sellingPrice || lot.buyingPrice) * lot.quantity, // Expected Revenue
          0, // Expected Profit
          0, // Profit Margin
          'Active',
        ]],
      },
    });

    return true;
  } catch (error) {
    console.error('Error adding lot to Sheets:', error);
    return false;
  }
}

// Get all lots from Google Sheets
export async function getLotsFromSheets(): Promise<Lot[]> {
  try {
    const { sheets } = initializeGoogleServices();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Lots!A:P',
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const data = rows.slice(1);

    return data.map((row) => ({
      id: row[0],
      productId: row[1],
      date: row[2],
      supplierName: row[3],
      buyingPricePerUnit: parseFloat(row[4]) || 0,
      quantityReceived: parseInt(row[5]) || 0,
      quantitySold: parseInt(row[6]) || 0,
      quantityRemaining: parseInt(row[7]) || 0,
      sellingPricePerUnit: parseFloat(row[8]) || 0,
      totalBuyingCost: parseFloat(row[9]) || 0,
      directExpenses: parseFloat(row[10]) || 0,
      totalCost: parseFloat(row[11]) || 0,
      expectedRevenue: parseFloat(row[12]) || 0,
      expectedProfit: parseFloat(row[13]) || 0,
      profitMargin: parseFloat(row[14]) || 0,
      status: row[15],
    }));
  } catch (error) {
    console.error('Error fetching lots from Sheets:', error);
    return [];
  }
}

// Test connection to Google Drive
export async function testGoogleDriveConnection(): Promise<boolean> {
  try {
    const { drive } = initializeGoogleServices();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    await drive.files.get({
      fileId: folderId,
      fields: 'id,name',
    });

    console.log('✅ Successfully connected to Google Drive');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Google Drive:', error);
    return false;
  }
}

// Test connection to Google Sheets
export async function testGoogleSheetsConnection(): Promise<boolean> {
  try {
    const { sheets } = initializeGoogleServices();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    await sheets.spreadsheets.get({
      spreadsheetId,
    });

    console.log('✅ Successfully connected to Google Sheets');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Google Sheets:', error);
    return false;
  }
}
