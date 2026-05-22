/**
 * Privacy Cryptography Module
 * Client-side AES-256-GCM encryption/decryption using the browser's Web Crypto API.
 * The master encryption key is derived from the user's password using PBKDF2.
 * The raw password/key is never sent to any server.
 */

// Helper to convert ArrayBuffer to Base64 string for JSON transmission
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 string back to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derives a cryptographic key from a user passcode using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

/**
 * Encrypts plaintext string using AES-256-GCM.
 * Returns a JSON string containing the base64-encoded ciphertext, IV, and salt.
 */
export async function encryptText(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  
  const encoder = new TextEncoder();
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encoder.encode(plaintext)
  );

  const data: EncryptedData = {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt)
  };

  return JSON.stringify(data);
}

/**
 * Decrypts AES-256-GCM encrypted data using the password.
 * Returns the raw decrypted plaintext string.
 */
export async function decryptText(encryptedJson: string, password: string): Promise<string> {
  try {
    const data: EncryptedData = JSON.parse(encryptedJson);
    const salt = new Uint8Array(base64ToBuffer(data.salt));
    const iv = new Uint8Array(base64ToBuffer(data.iv));
    const ciphertext = base64ToBuffer(data.ciphertext);
    
    const key = await deriveKey(password, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (e) {
    console.error('Decryption failed:', e);
    throw new Error('Decryption failed. Please verify your passcode or check data integrity.');
  }
}
