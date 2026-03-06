// AES-GCM 256-bit encryption with PBKDF2 key derivation.
// File format: [version(1)] [salt(16)] [iv(12)] [ciphertext(...)]

const VERSION = 1;
const SALT_LEN = 16;
const IV_LEN = 12;
const ITERATIONS = 200_000;

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const raw = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptBackup(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(password, salt);
  const plain = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);

  const out = new Uint8Array(1 + SALT_LEN + IV_LEN + ciphertext.byteLength);
  out[0] = VERSION;
  out.set(salt, 1);
  out.set(iv, 1 + SALT_LEN);
  out.set(new Uint8Array(ciphertext), 1 + SALT_LEN + IV_LEN);
  return out;
}

export async function decryptBackup(bytes, password) {
  if (bytes[0] !== VERSION) throw new Error("Unknown backup version");
  const salt = bytes.slice(1, 1 + SALT_LEN);
  const iv = bytes.slice(1 + SALT_LEN, 1 + SALT_LEN + IV_LEN);
  const ciphertext = bytes.slice(1 + SALT_LEN + IV_LEN);
  const key = await deriveKey(password, salt);
  // decrypt throws DOMException if password is wrong (AES-GCM auth tag fails)
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plain));
}
