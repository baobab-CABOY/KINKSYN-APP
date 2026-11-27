// Web Crypto AES-256-GCM + PBKDF2 helpers for the local vault.
export const vaultCrypto = {
  async deriveKey(passphrase, saltBytes) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  async encryptPayload(plainObj, passphrase) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(passphrase, salt);
    const enc = new TextEncoder();
    const cipherBuf = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(JSON.stringify(plainObj))
    );
    return {
      encrypted: true,
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv)),
      cipher: btoa(String.fromCharCode(...new Uint8Array(cipherBuf)))
    };
  },

  async decryptPayload(envelope, passphrase) {
    const salt = Uint8Array.from(atob(envelope.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(envelope.iv), c => c.charCodeAt(0));
    const cipher = Uint8Array.from(atob(envelope.cipher), c => c.charCodeAt(0));
    const key = await this.deriveKey(passphrase, salt);
    const plainBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipher
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(plainBuf));
  }
};
