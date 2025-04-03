import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST handler to create dummy payment data
export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: 'This API route is under development',
    success: false
  }, { status: 503 });
}

// GET handler to fetch all payments with user info
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'This API route is under development',
    payments: []
  });
} 