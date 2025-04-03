import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(caseStudies);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch case studies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const caseStudy = await prisma.caseStudy.create({
      data: {
        title: data.title,
        category: data.category,
        image: data.image,
        features: data.features,
        metrics: data.metrics,
        testimonial: data.testimonial,
        process: data.process,
        gallery: data.gallery,
      },
    });

    return NextResponse.json(caseStudy);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create case study" },
      { status: 500 }
    );
  }
} 