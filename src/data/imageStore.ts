import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';

const LOCAL_DIR = path.join(process.cwd(), '.local', 'images');
export const IMAGE_NAME = /^[A-Za-z0-9_-]+\.jpg$/;

/**
 * Stores a product photo. With DATA_BACKEND=sheets it goes to the Drive folder and returns a public URL.
 * Otherwise it is saved on this computer and served from /api/images.
 */
export async function saveProductImage(productId: string, jpeg: Buffer): Promise<string> {
  if (process.env.DATA_BACKEND === 'sheets') {
    const { driveClient } = await import('./sheetsRepo');
    const drive = driveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const created = await drive.files.create({
      requestBody: { name: `${productId}.jpg`, ...(folderId ? { parents: [folderId] } : {}) },
      media: { mimeType: 'image/jpeg', body: Readable.from([jpeg]) },
      fields: 'id',
    });
    const fileId = created.data.id;
    if (!fileId) throw new Error('Drive did not return a file id');
    await drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } });
    return `https://lh3.googleusercontent.com/d/${fileId}=w800`;
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, `${productId}.jpg`), jpeg);
  return `/api/images/${productId}.jpg`;
}

export async function readLocalImage(name: string): Promise<Buffer> {
  return readFile(path.join(LOCAL_DIR, name));
}
