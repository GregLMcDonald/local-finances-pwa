const PBKDF2_ITERATIONS = 100_000

function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  const bytes = Array.from(atob(b64), (c) => c.charCodeAt(0))
  return new Uint8Array(bytes)
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export interface EncryptedPayload {
  salt: string
  iv: string
  ciphertext: string
}

export async function encrypt(plaintext: string, passphrase: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
  return {
    salt: bufToBase64(salt.buffer as ArrayBuffer),
    iv: bufToBase64(iv.buffer as ArrayBuffer),
    ciphertext: bufToBase64(ciphertext),
  }
}

export async function decrypt(payload: EncryptedPayload, passphrase: string): Promise<string> {
  const salt = base64ToBuf(payload.salt)
  const iv = base64ToBuf(payload.iv)
  const ciphertext = base64ToBuf(payload.ciphertext)
  const key = await deriveKey(passphrase, salt)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}

export async function encryptToFile(data: unknown, passphrase: string): Promise<Blob> {
  const json = JSON.stringify(data)
  const payload = await encrypt(json, passphrase)
  return new Blob([JSON.stringify(payload)], { type: 'application/octet-stream' })
}

export async function decryptFromFile(file: File, passphrase: string): Promise<unknown> {
  const text = await file.text()
  const payload = JSON.parse(text) as EncryptedPayload
  const json = await decrypt(payload, passphrase)
  return JSON.parse(json)
}
