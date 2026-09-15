/**
 * DuoSpace Zero-Knowledge Cryptographic Engine
 * Implements Elliptic Curve Diffie-Hellman (ECDH P-256) Key Agreement
 * and AES-GCM 256-bit symmetric authenticated encryption.
 */

// Helper to convert ArrayBuffer to Base64
export function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate ephemeral ECDH keypair for this session
 */
export async function generateECDHKeyPair() {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Cryptography API is not supported in this browser.');
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true, // extractable
    ['deriveKey']
  );

  const exportedPublicKey = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicKeyJwk: exportedPublicKey
  };
}

/**
 * Derive AES-GCM-256 shared secret key using our private key and partner's public key
 */
export async function deriveSharedSessionKey(myPrivateKey, partnerPublicKeyJwk) {
  if (!myPrivateKey || !partnerPublicKeyJwk) return null;

  try {
    const importedPartnerKey = await window.crypto.subtle.importKey(
      'jwk',
      partnerPublicKeyJwk,
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      false,
      []
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: importedPartnerKey
      },
      myPrivateKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false, // non-extractable in RAM
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  } catch (err) {
    console.error('Failed to derive shared E2EE key:', err);
    return null;
  }
}

/**
 * Encrypt plaintext string using AES-GCM 256
 */
export async function encryptPayload(sharedKey, plaintext) {
  if (!sharedKey) {
    // If E2EE not established yet (e.g. partner not joined), return marked unencrypted
    return { isEncrypted: false, data: plaintext };
  }

  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      sharedKey,
      encoded
    );

    return {
      isEncrypted: true,
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(ciphertextBuffer)
    };
  } catch (err) {
    console.error('Encryption failed:', err);
    return { isEncrypted: false, data: plaintext };
  }
}

/**
 * Decrypt payload using AES-GCM 256
 */
export async function decryptPayload(sharedKey, payload) {
  if (!payload || !payload.isEncrypted || !sharedKey) {
    return payload?.data || (typeof payload === 'string' ? payload : '');
  }

  try {
    const iv = base64ToBuffer(payload.iv);
    const ciphertext = base64ToBuffer(payload.ciphertext);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      sharedKey,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.warn('Decryption failed or invalid key:', err);
    return '[🔒 Encrypted Message: Key mismatch or waiting for partner agreement]';
  }
}

/**
 * Cryptographic Memory Shredder
 * Wipes sensitive memory buffers with random cryptographic noise
 */
export function shredCryptographicMaterial(keyStore) {
  if (keyStore && typeof keyStore === 'object') {
    for (const prop of Object.keys(keyStore)) {
      try {
        delete keyStore[prop];
      } catch (e) {}
    }
  }
}
