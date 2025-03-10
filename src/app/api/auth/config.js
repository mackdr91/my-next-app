import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import { dbConnect } from '../../../utils/db';

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
            throw new Error('Invalid username or password');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            throw new Error('Invalid username or password');
          }

          return {
            id: user._id,
            username: user.username,
            email: user.email
          };
        } catch (error) {
          console.error('Authentication error:', error);
          if (error.message === 'Invalid username or password') {
            throw error;
          }
          throw new Error('An error occurred during authentication');
        }
      }
    })
  ],
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          let existingUser = await User.findByIdOrGoogleId(user.id);
          if (!existingUser) {
            existingUser = await User.findOne({ email: user.email });
          }
          
          if (!existingUser) {
            if (!user.name || !user.email) {
              console.error('Missing required Google profile data');
              return false;
            }

            await User.create({
              username: user.name,
              email: user.email,
              googleId: user.id,
              password: await bcrypt.hash(Math.random().toString(36), 10)
            });
          } else if (!existingUser.googleId) {
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
        token.username = user.username;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        try {
          await dbConnect();
          const dbUser = await User.findByIdOrGoogleIdSelect(token.sub, '-password');
          
          if (!dbUser) {
            console.error('User not found in database:', token.sub);
            return null;
          }

          session.user.id = dbUser._id.toString();
          session.user.username = dbUser.username;
          session.user.email = dbUser.email;
          session.user.googleId = dbUser.googleId || null;
        } catch (error) {
          console.error('Error fetching user session data:', error);
          return null;
        }
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
