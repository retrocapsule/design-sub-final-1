import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session data:", session); // Debug log for session

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists in database or create them
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.log("User not found, creating new user:", session.user);
      try {
        user = await prisma.user.create({
          data: {
            id: session.user.id,
            name: session.user.name || "",
            email: session.user.email || "",
            role: "USER",
          },
        });
        console.log("Created new user:", user);
      } catch (createError) {
        console.error("Error creating user:", createError);
        return NextResponse.json({ 
          error: "Failed to create user",
          details: createError instanceof Error ? createError.message : "Unknown error"
        }, { status: 500 });
      }
    }

    const body = await request.json();
    console.log("Received request body:", body); // Debug log

    const { title, description, priority, projectType, fileFormat, dimensions } = body;

    // Log each field to check for undefined or null values
    console.log("Field values:", {
      title,
      description,
      priority,
      projectType,
      fileFormat,
      dimensions,
      userId: user.id
    });

    if (!title || !description || !priority || !projectType || !fileFormat || !dimensions) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          title: !title,
          description: !description,
          priority: !priority,
          projectType: !projectType,
          fileFormat: !fileFormat,
          dimensions: !dimensions
        }
      }, { status: 400 });
    }

    try {
      // Find the first available admin
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
      });

      if (!admin) {
        console.error("No admin found in the system");
        return NextResponse.json({ 
          error: "No staff available",
          details: "There are no staff members available to handle your request"
        }, { status: 503 });
      }

      // Create the design request with exactly the fields from the schema
      const designRequest = await prisma.designRequest.create({
        data: {
          title: String(title),
          description: String(description),
          status: "PENDING",
          priority: String(priority),
          projectType: String(projectType),
          fileFormat: String(fileFormat),
          dimensions: String(dimensions),
          userId: user.id,
          assignedToId: admin.id, // Assign to the first available admin
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      console.log("Created design request:", designRequest); // Debug log
      return NextResponse.json(designRequest);
    } catch (prismaError) {
      console.error("[DESIGN_REQUEST_POST_PRISMA_ERROR]", prismaError);
      return NextResponse.json(
        { 
          error: "Database error",
          details: prismaError instanceof Error ? prismaError.message : "Unknown database error",
          stack: prismaError instanceof Error ? prismaError.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[DESIGN_REQUEST_POST]", error);
    return NextResponse.json(
      { 
        error: "Failed to create design request",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    console.log("Starting GET request for design requests");
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);

    if (!session?.user) {
      console.log("No session found, returning unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    console.log("Query parameters:", { status, priority });

    const where = {
      ...(session.user.role !== "ADMIN" && { userId: session.user.id }),
      ...(status && { status }),
      ...(priority && { priority }),
    };

    console.log("Prisma where clause:", where);

    try {
      // First, verify the database connection
      await prisma.$connect();
      console.log("Database connection successful");

      const designRequests = await prisma.designRequest.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      console.log(`Successfully fetched ${designRequests.length} design requests`);
      return NextResponse.json(designRequests);
    } catch (prismaError) {
      console.error("Prisma error details:", {
        name: prismaError.name,
        message: prismaError.message,
        code: prismaError.code,
        meta: prismaError.meta,
      });
      return NextResponse.json(
        { 
          error: "Database error",
          details: prismaError instanceof Error ? prismaError.message : "Unknown database error",
          code: prismaError.code,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/design-requests:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch design requests",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
} 