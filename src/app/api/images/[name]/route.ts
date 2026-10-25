import { NextResponse } from 'next/server';
import { IMAGE_NAME, readLocalImage } from '@/data/imageStore';

export const dynamic = 'force-dynamic';

// Serves product photos saved locally (development). Sheets mode serves them from Google Drive instead.
export async function GET(_req: Request, { params }: { params: { name: string } }) {
  if (!IMAGE_NAME.test(params.name)) return new NextResponse('Not found', { status: 404 });
  try {
    const bytes = await readLocalImage(params.name);
    return new NextResponse(new Uint8Array(bytes), {
      headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
