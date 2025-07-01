import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ZZZZZZZZZZZZ';

export function verifyAuth(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.match(/token=([^;]+)/)?.[1];
    if (!token) return null;

    return jwt.verify(token, JWT_SECRET); // returns decoded payload
  } catch {
    return null;
  }
}
