// This file is for server usage only - do not import directly in client components
import { db } from './db';
import { compare } from 'bcrypt';

/**
 * Checks if a user is already registered with the given email
 * Server-side only
 */
export async function isUserRegistered(email: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true }
    });
    
    return !!user;
  } catch (error) {
    console.error('Error checking user registration:', error);
    return false;
  }
}

/**
 * Verifies user credentials server-side
 * Server-side only
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, password: true }
    });

    if (!user || !user.password) {
      return false;
    }

    return await compare(password, user.password);
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return false;
  }
} 