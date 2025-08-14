import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { ensureAccessToken } from '@/lib/auth';
import { WS_BASE_URL } from '@/lib/config';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getCapturedImageBase64, clearCapturedImageBase64 } from '@/lib/captureStore';
import MathView from 'react-native-math-view';

export default function ModalScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'sending' | 'streaming' | 'done' | 'error'>('idle');
  const statusRef = useRef(status);
  statusRef.current = status;
  const [solution, setSolution] = useState('');
  const wsRef = useRef<WebSocket | null>(null);


  useEffect(() => {
    async function run() {
      console.log("uri", uri);
      try {
        console.log("connecting");
        setStatus('connecting');
        let base64 = getCapturedImageBase64();
        if (!base64 && uri) {
          base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        }
        if (!base64) {
          setStatus('error');
          setSolution('ERROR: No image');
          return;
        }
        const token = await ensureAccessToken();
        console.log("token", token);
        const wsUrl = `${WS_BASE_URL}/ws/calculate${token ? `?token=${encodeURIComponent(token)}` : ''}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setStatus('sending');
          ws.send(JSON.stringify({ action: 'solve', image: base64 }));
          setStatus('streaming');
        };
        ws.onmessage = (event) => {
          console.log("message", event.data);
          const text = String(event.data ?? '');
          if (text.includes('[DONE]')) {
            setStatus('done');
            ws.close();
            return;
          }
          if (text.startsWith('ERROR')) {
            console.log("error", text);
            setStatus('error');
            setSolution(text);
            return;
          }
          setSolution((prev) => prev + text);
        };
        ws.onerror = (e) => {
          console.log("ws error", e);
          console.log("url", wsUrl)
          setStatus('error');
        };
        ws.onclose = () => {
          if (statusRef.current !== 'done' && statusRef.current !== 'error') {
            setStatus('error');
          }
        };
        } catch (e) {
        console.log("error", e);
        setStatus('error');
      }
    }
    run();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      clearCapturedImageBase64();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  // const parsedSolution = useMemo(() => {
  //   if (!solution) return [];
  //   const regex = /(\$\$[\s\S]*?\$\$|\\[[\s\S]*?\\]|\(.*?\)|\$.*?\$)/g;
  //   return solution
  //     .split(regex)
  //     .filter(Boolean)
  //     .map((part, index) => {
  //       const isMath = /^(\$|\\|\().*(\$|\\|\))$/.test(part);
  //       if (isMath) {
  //         let math = part;
  //         if (part.startsWith('$$') && part.endsWith('$$')) {
  //           math = part.substring(2, part.length - 2);
  //         } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
  //           math = part.substring(2, part.length - 2);
  //         } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
  //           math = part.substring(2, part.length - 2);
  //         } else if (part.startsWith('$') && part.endsWith('$')) {
  //           math = part.substring(1, part.length - 1);
  //         }
  //         return { type: 'math', value: math, key: `part-${index}` };
  //       }
  //       return { type: 'text', value: part, key: `part-${index}` };
  //     });
  // }, [solution]);

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Text style={styles.title}>Solution</Text>
      <View style={styles.body}>
        {status === 'connecting' || status === 'sending' || status === 'streaming' ? (
          <>
            <ActivityIndicator color="#fff" />
            <Text style={styles.progressText}>
              {status === 'connecting' && 'Connecting...'}
              {status === 'sending' && 'Uploading image...'}
              {status === 'streaming' && 'Solving...'}
            </Text>
          </>
        ) : null}
        <ScrollView style={styles.solutionScrollView}>
          <Text style={styles.solutionText}>{solution}</Text>
        </ScrollView>
        {status === 'error' && solution.length === 0 ? (
          <Text style={styles.errorText}>Failed to solve. Please try again.</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#000',
    padding: 16,
    gap: 12,
  },
  solutionScrollView: {
    flex: 1,
  },
  solutionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  mathViewWrapper: {
    marginVertical: 4,
  },
  mathView: {
    backgroundColor: 'transparent',
    color: '#fff',
  },
  solutionText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  progressText: {
    color: '#bbb',
    marginTop: 8,
  },
  errorText: {
    color: '#fca5a5',
  },
  actions: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    color: '#000',
    fontWeight: '600',
  },
});
