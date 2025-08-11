export const API_BASE_URL: string =
  (process.env.EXPO_PUBLIC_API_BASE as string) || 'http://localhost:8000';

export const WS_BASE_URL: string = API_BASE_URL.startsWith('https')
  ? API_BASE_URL.replace(/^https/, 'wss')
  : API_BASE_URL.replace(/^http/, 'ws');

export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID as string | undefined;
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID as string | undefined;
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined;


