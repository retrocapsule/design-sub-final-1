import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth-service';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Verify credentials server-side
    const isValid = await verifyCredentials(email, password);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Fetch user data
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return success but let the client handle the session via next-auth
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Direct login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 