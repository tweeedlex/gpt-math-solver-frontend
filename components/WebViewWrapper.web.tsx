import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

type Source = {
  html?: string;
  uri?: string;
};

type Props = {
  style?: StyleProp<ViewStyle>;
  source?: Source;
  originWhitelist?: string[];
  javaScriptEnabled?: boolean;
  scalesPageToFit?: boolean;
  setSupportMultipleWindows?: boolean;
};

export default function WebViewWrapper({ style, source }: Props) {
  const html = source?.html;
  const uri = source?.uri;

  return (
    <View style={[{ flex: 1, backgroundColor: 'transparent' }, style]}> 
      {/* Use a raw iframe on web to mimic WebView */}
      <iframe
        srcDoc={html}
        src={html ? undefined : uri}
        style={{ border: '0', width: '100%', height: '100%' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  );
}

