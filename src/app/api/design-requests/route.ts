import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Explicitly cast the role to text in the query to avoid enum type casting issues
 */
export async function POST(request: Request) {
  try {
    // Get user session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;
    console.log("Session data:", {
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        id: user.id,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        onboardingCompleted: user.onboardingCompleted
      }
    });

    // Parse request body
    const body = await request.json();
    console.log("Received request body:", body);
    
    const { title, description, priority, projectType, fileFormat, dimensions } = body;
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
      // Find the first available admin - use explicit text casting for role
      console.log("Finding admin with role cast to text to avoid enum issues");
      const admin = await prisma.$queryRaw`
        SELECT id, name, email
        FROM "User"
        WHERE "role"::text = 'ADMIN'
        LIMIT 1
      `;
      
      let adminId = null;
      if (Array.isArray(admin) && admin.length > 0) {
        adminId = admin[0].id;
        console.log(`Found admin: ${adminId}`);
      } else {
        console.error("No admin found in the system");
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
          assignedToId: adminId, // Assign to admin if found, otherwise null
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

      console.log("Created design request:", designRequest.id); // Debug log
      return NextResponse.json(designRequest);
    } catch (prismaError) {
      console.error("[DESIGN_REQUEST_POST_PRISMA_ERROR]", prismaError);
      // Return detailed error for debugging
      return NextResponse.json({ 
        error: "Database error", 
        message: prismaError instanceof Error ? prismaError.message : "Unknown database error",
        stack: prismaError instanceof Error ? prismaError.stack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[DESIGN_REQUEST_POST_ERROR]", error);
    return NextResponse.json({ 
      error: "Failed to create design request",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
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