import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Enforce strict canonical save file location within project root
const SAFE_BASE_DIR = path.resolve(process.cwd());
const SAVE_FILE_PATH = path.resolve(SAFE_BASE_DIR, 'career_save.json');

// Ensure path traversal cannot escape project root
if (!SAVE_FILE_PATH.startsWith(SAFE_BASE_DIR)) {
  throw new Error('Security Violation: Invalid file path resolution.');
}

const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1 MB limit to prevent disk exhaustion attacks

function hasMaliciousKeys(obj: any, depth = 0): boolean {
  if (depth > 8 || !obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj)) {
    return obj.some(item => hasMaliciousKeys(item, depth + 1));
  }
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }
    if (typeof obj[key] === 'object' && hasMaliciousKeys(obj[key], depth + 1)) {
      return true;
    }
  }
  return false;
}

export async function GET() {
  try {
    const data = await fs.readFile(SAVE_FILE_PATH, 'utf-8');
    if (!data || data.length > MAX_PAYLOAD_BYTES * 2) {
      return NextResponse.json({ success: true, data: null });
    }
    const parsed = JSON.parse(data);
    if (hasMaliciousKeys(parsed)) {
      return NextResponse.json({ success: true, data: null });
    }
    return NextResponse.json({ success: true, data: parsed });
  } catch {
    // If file doesn't exist yet or is unreadable, return safe null data
    return NextResponse.json({ success: true, data: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
    }

    // Prototype pollution inspection
    if (hasMaliciousKeys(body)) {
      return NextResponse.json({ success: false, error: 'Malicious payload detected' }, { status: 403 });
    }

    // Essential fields validation
    if (typeof body.userTeamId !== 'string' || typeof body.coachName !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid schema' }, { status: 422 });
    }

    const serialized = JSON.stringify(body, null, 2);
    if (Buffer.byteLength(serialized, 'utf-8') > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ success: false, error: 'Payload size exceeds limit' }, { status: 413 });
    }

    await fs.writeFile(SAVE_FILE_PATH, serialized, 'utf-8');
    return NextResponse.json({ success: true, message: 'Career saved safely' });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await fs.unlink(SAVE_FILE_PATH).catch(() => {});
    return NextResponse.json({ success: true, message: 'Career save reset successfully' });
  } catch {
    return NextResponse.json({ success: true, message: 'Career save already empty' });
  }
}
