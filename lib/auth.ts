import { API_BASE_URL } from '@/lib/config';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  accessToken?: string;
  refreshToken?: string;
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
}

export async function loginWithGoogleIdToken(idToken: string): Promise<TokenPair> {
  const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    // Follow redirect so we can read the final URL containing tokens
    redirect: 'follow',
  });
  const finalUrl = (res.url ?? '').toString();
  try {
    const url = new URL(finalUrl);
    const accessToken = url.searchParams.get('accessToken') ?? undefined;
    const refreshToken = url.searchParams.get('refreshToken') ?? undefined;
    if (!accessToken || !refreshToken) {
      throw new Error('Missing tokens in redirect URL');
    }
    const tokens: TokenPair = { accessToken, refreshToken };
    setTokens(tokens);
    return tokens;
  } catch (e) {
    throw new Error('Google login failed');
  }
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


