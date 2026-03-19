import { NextResponse } from 'next/server';
import { syncFoldTransactions } from '@/lib/fold-sync';
import { getTokens } from '@/lib/fold-token-store';

export async function POST() {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Fold' }, { status: 401 });
    }

    const result = await syncFoldTransactions();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Fold Sync]', err);
    return NextResponse.json({ error: err.message ?? 'Sync failed' }, { status: 500 });
  }
}
