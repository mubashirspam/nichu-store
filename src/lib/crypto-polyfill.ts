// crypto.randomUUID is only available in secure contexts (HTTPS/localhost).
// This polyfill enables it for HTTP dev environments (e.g. LAN IP access).
if (
  typeof globalThis !== 'undefined' &&
  globalThis.crypto &&
  typeof globalThis.crypto.randomUUID !== 'function'
) {
  (globalThis.crypto as any).randomUUID = function (): `${string}-${string}-${string}-${string}-${string}` {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const uuid = bytes.reduce((acc, b, i) => {
      const hex = b.toString(16).padStart(2, '0');
      return acc + ([4, 6, 8, 10].includes(i) ? '-' : '') + hex;
    }, '');
    return uuid as unknown as `${string}-${string}-${string}-${string}-${string}`;
  };
}
