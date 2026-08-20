import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SAVE_FILE_PATH = path.join(process.cwd(), 'career_save.json');

export async function GET() {
  try {
    const data = await fs.readFile(SAVE_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    // If file doesn't exist yet, return null data
    return NextResponse.json({ success: true, data: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    await fs.writeFile(SAVE_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Career saved to disk' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
