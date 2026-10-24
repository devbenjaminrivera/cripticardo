import crypto from 'crypto';

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  'cripticardo-secure-salt-key-danielfajardo-2026-secret-hmac';

export const ADMIN_COOKIE_NAME = 'cripticardo_admin_session';

interface SessionPayload {
  username: string;
  exp: number; // timestamp en milisegundos
}

// Genera un token HMAC firmado para la sesión de administrador
export function signAdminToken(username: string, daysValid: number = 7): string {
  const payload: SessionPayload = {
    username: username.trim().toLowerCase(),
    exp: Date.now() + daysValid * 24 * 60 * 60 * 1000,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

// Verifica si un token es válido y no ha expirado
export function verifyAdminToken(token: string | undefined | null): {
  valid: boolean;
  username?: string;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadStr, providedSignature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');

  // Comparación resistente a timing attacks
  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  );

  if (!isSignatureValid) {
    return { valid: false };
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf8')
    );

    if (Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, username: payload.username };
  } catch {
    return { valid: false };
  }
}
