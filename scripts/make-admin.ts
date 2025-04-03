import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log('User updated successfully:', user);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin('gorillaflix@gmail.com'); 