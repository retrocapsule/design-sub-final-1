import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all active packages
    const packages = await prisma.package.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    // If no packages exist, create default packages
    if (packages.length === 0) {
      const defaultPackages = await Promise.all([
        prisma.package.create({
          data: {
            name: 'Basic',
            originalPrice: 99,
            price: 49,
            features: [
              'Up to 5 design requests per month',
              'Standard support',
              'Basic design assets',
              '72-hour turnaround'
            ],
            isActive: true
          }
        }),
        prisma.package.create({
          data: {
            name: 'Pro',
            originalPrice: 199,
            price: 99,
            features: [
              'Unlimited design requests',
              'Priority support',
              'Premium design assets',
              '48-hour turnaround',
              'Custom branding'
            ],
            isActive: true
          }
        }),
        prisma.package.create({
          data: {
            name: 'Enterprise',
            originalPrice: 399,
            price: 199,
            features: [
              'Unlimited design requests',
              '24/7 priority support',
              'All design assets',
              '24-hour Priority Delivery',
              'Custom branding',
              'Dedicated designer',
              'API access'
            ],
            isActive: true
          }
        })
      ]);

      return NextResponse.json(defaultPackages);
    }

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
} 