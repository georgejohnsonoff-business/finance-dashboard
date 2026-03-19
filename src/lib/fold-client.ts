const BASE_URL = 'https://api.fold.money/api';

const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'ua/unfold',
  'X-Device-Hash': process.env.FOLD_DEVICE_HASH ?? 'finance-dashboard-001',
  'X-Device-Location': 'India',
  'X-Device-Name': 'FinanceDashboard',
  'X-Device-Type': 'Android',
};

function authHeaders(token: string) {
  return { ...HEADERS, Authorization: `Bearer ${token}` };
}

export interface FoldAuthResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  new_user: boolean;
  user_id: string;
  user_meta: {
    uuid: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface FoldTransaction {
  uuid: string;
  amount: number;
  current_balance: number;
  txn_timestamp: string;
  txn_date: string;
  type: string; // "INCOMING" or other
  narration: string;
  merchant: string | null;
  category: string | null;
  account_id: string;
  financial_information_provider?: { name: string };
}

function generateCursor(till?: Date): string {
  const t = till ?? new Date();
  const random = Math.floor(10000000 + Math.random() * 89999999);
  const raw = `${random},${t.toISOString()}`;
  return Buffer.from(raw).toString('base64');
}

export interface FoldTransactionsResponse {
  transactions: FoldTransaction[];
  total: number;
  after: string | null;
}

export async function sendOtp(phone: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/auth/otp`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ phone, channel: 'sms' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to send OTP: ${res.status} ${text}`);
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<FoldAuthResponse> {
  const res = await fetch(`${BASE_URL}/v1/auth/otp/verify`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ phone, otp }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OTP verification failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<FoldAuthResponse> {
  const res = await fetch(`${BASE_URL}/v1/auth/tokens/refresh`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchTransactions(
  uuid: string,
  token: string,
  cursor?: string
): Promise<FoldTransactionsResponse> {
  const params = new URLSearchParams({ filter: 'all', count_by: 'month' });
  // Fold API requires a base64-encoded cursor even on the first request
  params.set('after', cursor ?? generateCursor());

  const res = await fetch(`${BASE_URL}/v2/users/${uuid}/transactions?${params}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch transactions: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchUserUuid(token: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/v2/users/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch user: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.data?.user?.uuid ?? '';
}

export async function fetchAvailableSince(uuid: string, token: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/v2/users/${uuid}/transactions/available_since`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch availability: ${res.status} ${text}`);
  }
  const json = await res.json();
  const accounts = json.data?.accounts ?? [];
  if (accounts.length === 0) return new Date().toISOString();
  return accounts[0].transaction_available_since;
}
