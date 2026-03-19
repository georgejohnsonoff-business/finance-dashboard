import { NextResponse } from 'next/server';
import { clearTokens } from '@/lib/fold-token-store';

export async function POST() {
  clearTokens();
  return NextResponse.json({ success: true });
}
