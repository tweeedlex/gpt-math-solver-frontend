import React from 'react';
import { WebView } from 'react-native-webview';
import type { WebViewProps } from 'react-native-webview';

export default function WebViewWrapper(props: WebViewProps) {
  return <WebView {...props} />;
}

