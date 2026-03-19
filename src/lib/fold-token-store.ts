import { getSheets, SPREADSHEET_ID } from './google-sheets';
import { refreshAccessToken } from './fold-client';

const CONFIG_SHEET = 'FoldConfig';

export interface FoldTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user_id: string;
  uuid: string;
}

async function ensureConfigSheet() {
  const sheets = await getSheets();
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONFIG_SHEET}!A1`,
    });
  } catch {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: CONFIG_SHEET } } }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONFIG_SHEET}!A1:B1`,
      valueInputOption: 'RAW',
      requestBody: { values: [['Key', 'Value']] },
    });
  }
}

export async function getTokens(): Promise<FoldTokens | null> {
  try {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONFIG_SHEET}!A2:B10`,
    });
    const rows = res.data.values ?? [];
    if (rows.length === 0) return null;

    const map = new Map(rows.map((r) => [r[0], r[1]]));
    const access_token = map.get('access_token');
    const refresh_token = map.get('refresh_token');
    if (!access_token || !refresh_token) return null;

    return {
      access_token,
      refresh_token,
      expires_at: map.get('expires_at') ?? '',
      user_id: map.get('user_id') ?? '',
      uuid: map.get('uuid') ?? '',
    };
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: FoldTokens): Promise<void> {
  await ensureConfigSheet();
  const sheets = await getSheets();
  const rows = [
    ['access_token', tokens.access_token],
    ['refresh_token', tokens.refresh_token],
    ['expires_at', tokens.expires_at],
    ['user_id', tokens.user_id],
    ['uuid', tokens.uuid],
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${CONFIG_SHEET}!A2:B10`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${CONFIG_SHEET}!A2:B${rows.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}

export async function clearTokens(): Promise<void> {
  try {
    const sheets = await getSheets();
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONFIG_SHEET}!A2:B10`,
    });
  } catch {}
}

export async function isTokenExpired(): Promise<boolean> {
  const tokens = await getTokens();
  if (!tokens) return true;
  return new Date(tokens.expires_at).getTime() < Date.now();
}

export async function getValidToken(): Promise<{ token: string; uuid: string }> {
  const tokens = await getTokens();
  if (!tokens) throw new Error('Not connected to Fold');

  if (new Date(tokens.expires_at).getTime() > Date.now()) {
    return { token: tokens.access_token, uuid: tokens.uuid };
  }

  // Token expired, refresh
  const refreshed = await refreshAccessToken(tokens.refresh_token);
  const newTokens: FoldTokens = {
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: refreshed.expires_at,
    user_id: refreshed.user_id,
    uuid: refreshed.user_meta.uuid,
  };
  await saveTokens(newTokens);
  return { token: newTokens.access_token, uuid: newTokens.uuid };
}
