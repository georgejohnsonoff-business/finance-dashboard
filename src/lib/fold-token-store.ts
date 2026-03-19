import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { refreshAccessToken } from './fold-client';

const TOKEN_PATH = join(process.cwd(), 'fold-tokens.json');

export interface FoldTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user_id: string;
  uuid: string;
}

export function getTokens(): FoldTokens | null {
  if (!existsSync(TOKEN_PATH)) return null;
  try {
    const raw = readFileSync(TOKEN_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveTokens(tokens: FoldTokens): void {
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

export function clearTokens(): void {
  if (existsSync(TOKEN_PATH)) unlinkSync(TOKEN_PATH);
}

export function isTokenExpired(): boolean {
  const tokens = getTokens();
  if (!tokens) return true;
  return new Date(tokens.expires_at).getTime() < Date.now();
}

export async function getValidToken(): Promise<{ token: string; uuid: string }> {
  const tokens = getTokens();
  if (!tokens) throw new Error('Not connected to Fold');

  if (!isTokenExpired()) {
    return { token: tokens.access_token, uuid: tokens.uuid };
  }

  // Token expired, try refresh
  const refreshed = await refreshAccessToken(tokens.refresh_token);
  const newTokens: FoldTokens = {
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: refreshed.expires_at,
    user_id: refreshed.user_id,
    uuid: refreshed.user_meta.uuid,
  };
  saveTokens(newTokens);
  return { token: newTokens.access_token, uuid: newTokens.uuid };
}
