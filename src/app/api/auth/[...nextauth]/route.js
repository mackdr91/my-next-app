import NextAuth from 'next-auth';
import { authOptions } from '../config';

// Create the handler
const handler = NextAuth(authOptions);

// Export route handlers
export async function GET(request) {
  return handler(request);
}

export async function POST(request) {
  return handler(request);
}
