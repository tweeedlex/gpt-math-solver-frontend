let lastImageBase64: string | undefined;

export function setCapturedImageBase64(data: string) {
  lastImageBase64 = data;
}

export function getCapturedImageBase64(): string | undefined {
  return lastImageBase64;
}

export function clearCapturedImageBase64() {
  lastImageBase64 = undefined;
}


