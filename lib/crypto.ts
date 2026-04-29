export async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: 250000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function getChunkIV(baseIV: Uint8Array, index: number) {
  const iv = new Uint8Array(baseIV);
  const view = new DataView(iv.buffer);
  view.setUint32(iv.length - 4, index);
  return iv;
}