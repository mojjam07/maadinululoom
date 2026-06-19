import crypto from 'crypto'
import { authenticator } from 'otplib'

function encryptSecret(secret: string, keySeed = 'dev-key') {
  const key = crypto.createHash('sha256').update(process.env.JWT_SECRET || keySeed).digest()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function decryptSecret(storedB64: string, keySeed = 'dev-key') {
  const buf = Buffer.from(storedB64, 'base64')
  const iv = buf.slice(0, 12)
  const tag = buf.slice(12, 28)
  const encrypted = buf.slice(28)
  const key = crypto.createHash('sha256').update(process.env.JWT_SECRET || keySeed).digest()
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const secret = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
  return secret
}

async function run() {
  const secret = authenticator.generateSecret()
  const token = authenticator.generate(secret)

  const stored = encryptSecret(secret, 'test-key')
  const recovered = decryptSecret(stored, 'test-key')

  if (recovered !== secret) {
    console.error('Encryption roundtrip failed')
    process.exit(1)
  }

  const ok = authenticator.check(token, recovered)
  if (!ok) {
    console.error('TOTP verification failed')
    process.exit(1)
  }

  console.log('2FA local smoke test passed')
}

run().catch((err) => {
  console.error('2FA tests crashed:', err)
  process.exit(2)
})
