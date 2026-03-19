import { NextResponse } from 'next/server';
import { getTokens, isTokenExpired } from '@/lib/fold-token-store';

export async function GET() {
  const tokens = getTokens();
  if (!tokens) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({
    connected: true,
    expired: isTokenExpired(),
    user_id: tokens.user_id,
  });
}
