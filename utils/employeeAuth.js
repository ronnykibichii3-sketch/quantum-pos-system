const crypto = require('crypto');

const AUTH_SECRET = process.env.AUTH_SECRET || 'payment-system-dev-secret';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }

  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + (12 * 60 * 60 * 1000)
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) {
    throw new Error('Missing or invalid token');
  }

  const [body, signature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));

  if (payload.exp && Date.now() > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new Error('Authorization header missing Bearer token');
  }

  return token;
}

function authenticateEmployee(req, res, next) {
  try {
    const token = getBearerToken(req);
    req.employee = verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.employee) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.employee.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
}

module.exports = {
  authenticateEmployee,
  getBearerToken,
  hashPassword,
  requireRoles,
  signToken,
  verifyPassword
};