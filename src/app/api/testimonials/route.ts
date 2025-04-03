import { NextResponse } from 'next/server';
import { testimonialService } from '@/services/testimonial.service';
import { Testimonial } from '@/data/testimonials';

export async function GET() {
  try {
    const testimonials = await testimonialService.getAllTestimonials();
    return NextResponse.json(testimonials);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const testimonial = await request.json();
    const created = await testimonialService.createTestimonial(testimonial);
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...testimonial } = await request.json();
    const updated = await testimonialService.updateTestimonial(id, testimonial);
    if (!updated) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const success = await testimonialService.deleteTestimonial(id);
    if (!success) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
} 