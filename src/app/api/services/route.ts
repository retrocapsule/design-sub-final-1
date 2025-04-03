import { NextResponse } from 'next/server';
import { services } from '@/data/services';
import { Service } from '@/data/services';

// In a real application, this would be replaced with actual database operations
let servicesData = [...services];

export async function GET() {
  try {
    return NextResponse.json(servicesData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const service = await request.json();
    const newService: Service = {
      ...service,
      id: Date.now().toString()
    };
    servicesData.push(newService);
    return NextResponse.json(newService);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...service } = await request.json();
    const index = servicesData.findIndex(s => s.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    servicesData[index] = {
      ...servicesData[index],
      ...service
    };
    
    return NextResponse.json(servicesData[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const initialLength = servicesData.length;
    servicesData = servicesData.filter(s => s.id !== id);
    
    if (servicesData.length === initialLength) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
} 