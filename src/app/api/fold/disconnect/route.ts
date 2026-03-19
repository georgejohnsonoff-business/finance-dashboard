import { NextResponse } from 'next/server';
import { clearTokens } from '@/lib/fold-token-store';

export async function POST() {
  await clearTokens();
  return NextResponse.json({ success: true });
}
