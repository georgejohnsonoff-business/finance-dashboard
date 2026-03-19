import { NextResponse } from 'next/server';
import { sendOtp } from '@/lib/fold-client';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone. Use +91XXXXXXXXXX format.' }, { status: 400 });
    }
    await sendOtp(phone);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Fold OTP]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to send OTP' }, { status: 500 });
  }
}
