import { Platform } from 'react-native';
import NativeImpl from './WebViewWrapper.native';
import WebImpl from './WebViewWrapper.web';

export default (Platform.OS === 'web' ? WebImpl : NativeImpl);

