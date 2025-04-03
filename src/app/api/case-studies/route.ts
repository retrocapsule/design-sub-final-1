import { NextResponse } from 'next/server';
import { caseStudies } from '@/data/case-studies';
import { CaseStudy } from '@/data/case-studies';

// In a real application, this would be replaced with actual database operations
let caseStudiesData = [...caseStudies];

export async function GET() {
  try {
    return NextResponse.json(caseStudiesData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const caseStudy = await request.json();
    const newCaseStudy: CaseStudy = {
      ...caseStudy,
      id: Date.now().toString()
    };
    caseStudiesData.push(newCaseStudy);
    return NextResponse.json(newCaseStudy);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create case study' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...caseStudy } = await request.json();
    const index = caseStudiesData.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    caseStudiesData[index] = {
      ...caseStudiesData[index],
      ...caseStudy
    };
    
    return NextResponse.json(caseStudiesData[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update case study' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const initialLength = caseStudiesData.length;
    caseStudiesData = caseStudiesData.filter(c => c.id !== id);
    
    if (caseStudiesData.length === initialLength) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
  }
} 