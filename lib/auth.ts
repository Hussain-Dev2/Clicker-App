import bcryptjs from 'bcryptjs';

// NOTE: JWT authentication has been removed
// The app now uses NextAuth with Google OAuth exclusively

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}