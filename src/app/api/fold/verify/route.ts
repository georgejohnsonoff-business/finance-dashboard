import { NextResponse } from 'next/server';
import { verifyOtp, fetchUserUuid } from '@/lib/fold-client';
import { saveTokens, FoldTokens } from '@/lib/fold-token-store';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Phone and 6-digit OTP required' }, { status: 400 });
    }

    const data = await verifyOtp(phone, otp);

    // Fetch the real user UUID from /v2/users/me (same as unfold CLI does)
    const uuid = await fetchUserUuid(data.access_token);

    const tokens: FoldTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user_id: data.user_id,
      uuid: uuid || data.user_meta.uuid,
    };
    saveTokens(tokens);

    return NextResponse.json({
      success: true,
      user: {
        name: `${data.user_meta.first_name} ${data.user_meta.last_name}`.trim(),
        email: data.user_meta.email,
      },
    });
  } catch (err: any) {
    console.error('[Fold Verify]', err);
    return NextResponse.json({ error: err.message ?? 'Verification failed' }, { status: 500 });
  }
}
