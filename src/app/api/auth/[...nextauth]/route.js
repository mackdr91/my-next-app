import NextAuth from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import User from '../../../../models/User';
import { dbConnect } from '../../../../utils/db';
import { NextResponse } from 'next/server';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required');
        }

        if (typeof credentials.username !== 'string' || typeof credentials.password !== 'string') {
          throw new Error('Invalid credential format');
        }

        if (credentials.username.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }

        if (credentials.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        try {
          await dbConnect();
          const user = await User.findOne({ username: credentials.username }).select('+password').lean();
          
          if (!user) {
            // Use consistent error message for security
            throw new Error('Invalid username or password');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            // Use consistent error message for security
            throw new Error('Invalid username or password');
          }

          // Only return necessary user data
          return {
            id: user._id,
            username: user.username,
            email: user.email
          };
        } catch (error) {
          console.error('Authentication error:', error);
          // Don't expose internal errors to client
          if (error.message === 'Invalid username or password') {
            throw error;
          }
          throw new Error('An error occurred during authentication');
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          // First try to find by Google ID, then by email
          let existingUser = await User.findByIdOrGoogleId(user.id);
          if (!existingUser) {
            existingUser = await User.findOne({ email: user.email });
          }
          
          if (!existingUser) {
            // Validate required Google profile data
            if (!user.name || !user.email) {
              console.error('Missing required Google profile data');
              return false;
            }

            // Create new user with Google profile
            await User.create({
              username: user.name,
              email: user.email,
              googleId: user.id,
              password: await bcrypt.hash(Math.random().toString(36), 10)
            });
          } else if (!existingUser.googleId) {
            // Update existing user's Google ID if not set
            existingUser.googleId = user.id;
            await existingUser.save();
          }
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Include additional user info in the token
        token.username = user.username;
        token.sub = user.id; // Ensure we're using the correct ID
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        try {
          // Get user from database to ensure latest data
          await dbConnect();
          const dbUser = await User.findByIdOrGoogleIdSelect(token.sub, '-password');
          
          if (!dbUser) {
            console.error('User not found in database:', token.sub);
            return null;
          }

          // Update session with latest user data
          session.user.id = dbUser._id.toString(); // Convert ObjectId to string
          session.user.username = dbUser.username;
          session.user.email = dbUser.email;
          session.user.googleId = dbUser.googleId || null; // Include Google ID if available
        } catch (error) {
          console.error('Error fetching user session data:', error);
          return null;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Utility function to protect API routes
export async function withProtectedSession(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      };
    }

    const user = await User.findByIdOrGoogleIdSelect(session.user.id, '-password');
    if (!user) {
      return {
        error: NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      };
    }

    return { session, user };
  } catch (error) {
    console.error('Protected session error:', error);
    return {
      error: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    };
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
