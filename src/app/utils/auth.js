import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { dbConnect } from '../../utils/db';
import User from '../../models/User';
import { authOptions } from '../api/auth/config';

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
