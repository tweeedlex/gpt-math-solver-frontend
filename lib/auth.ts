import { API_BASE_URL } from '@/lib/config';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type UserInfo = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  credits: number;
  subscriptionExpiresAt: string | null;
};

type AuthState = {
  accessToken?: string;
  refreshToken?: string;
  user?: UserInfo;
};

const state: AuthState = {};

export function setTokens(tokens: TokenPair) {
  state.accessToken = tokens.accessToken;
  state.refreshToken = tokens.refreshToken;
}

export function getAccessToken(): string | undefined {
  return state.accessToken;
}

export function getRefreshToken(): string | undefined {
  return state.refreshToken;
}

export function clearTokens() {
  state.accessToken = undefined;
  state.refreshToken = undefined;
  state.user = undefined;
}

export async function loginWithGoogleIdToken(idToken: string): Promise<{ tokens: TokenPair; user: UserInfo }> {
  const form = new URLSearchParams();
  // Send both keys for backend compatibility
  form.set('idToken', idToken);
  form.set('credential', idToken);
  const url = new URL(`${API_BASE_URL}/auth/google-login`);
  // Also pass as query to satisfy either location
  url.searchParams.set('idToken', idToken);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: form.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google login failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const tokens: TokenPair = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
  const user: UserInfo = data.user;
  setTokens(tokens);
  state.user = user;
  return { tokens, user };
}

export async function loginTestUser(email?: string): Promise<TokenPair> {
  const body = { email: email ?? `user@example.com` };
  const res = await fetch(`${API_BASE_URL}/auth/test-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }
  const data = await res.json();
  const tokens: TokenPair = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
  setTokens(tokens);
  return tokens;
}

export async function refreshAccessToken(): Promise<string> {
  const token = getRefreshToken();
  if (!token) throw new Error('No refresh token');
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  const data = await res.json();
  state.accessToken = data.accessToken;
  return state.accessToken!;
}

export async function ensureAccessToken(): Promise<string> {
  if (state.accessToken) return state.accessToken;
  if (state.refreshToken) {
    try {
      return await refreshAccessToken();
    } catch (_) {
      // fall through
    }
  }
  throw new Error('Not authenticated');
}

export function getUser(): UserInfo | undefined {
  return state.user;
}
