import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

// Define the schema for message validation
const messageSchema = z.object({
  content: z.string().min(1, { message: 'Message content is required' }),
  designRequestId: z.string().cuid('Invalid design request ID'),
  recipientId: z.string().cuid('Invalid recipient ID').optional(),
});

// GET handler for fetching messages
export async function GET(req: Request) {
  try {
    console.log("Starting GET request for messages");
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);
    
    if (!session || !session.user) {
      console.log("No session found, returning unauthorized");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const designRequestId = searchParams.get('designRequestId');

    const userId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    console.log("Query parameters:", { designRequestId, userId, isAdmin });

    // Build the where clause based on user role and query parameters
    const where = {
      ...(designRequestId && { designRequestId }),
      ...(!isAdmin && !designRequestId && {
        OR: [
          { userId: userId }, // Messages sent by the user
          { recipientId: userId }, // Messages received by the user
          {
            designRequest: {
              userId: userId // Messages in the user's design requests
            }
          }
        ]
      })
    };

    console.log("Prisma where clause:", where);

    try {
      // First, verify the database connection
      await prisma.$connect();
      console.log("Database connection successful");

      const messages = await prisma.message.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          },
          designRequest: {
            select: {
              id: true,
              title: true,
              status: true,
              userId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`Successfully fetched ${messages.length} messages`);

      // Transform messages to match the expected interface
      const transformedMessages = messages.map(message => ({
        ...message,
        sender: message.user,
        senderId: message.userId,
        recipient: message.recipient,
        recipientId: message.recipientId,
        designRequest: message.designRequest
      }));

      return NextResponse.json(transformedMessages);
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
    console.error("Error in GET /api/messages:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch messages",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// POST handler for creating a new message
export async function POST(req: Request) {
  try {
    console.log("Starting POST request for messages");
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);
    
    if (!session || !session.user) {
      console.log("No session found, returning unauthorized");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", body);
    
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      console.log("Validation failed:", validation.error);
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { content, designRequestId, recipientId } = validation.data;
    const senderId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    // Verify that the design request exists
    const designRequest = await prisma.designRequest.findUnique({
      where: { id: designRequestId },
      include: {
        user: true
      }
    });

    if (!designRequest) {
      console.log("Design request not found:", designRequestId);
      return NextResponse.json(
        { error: 'Design request not found' },
        { status: 404 }
      );
    }

    // Regular users can only send messages for their own design requests
    if (!isAdmin && designRequest.userId !== senderId) {
      console.log("User not authorized to send message for this design request");
      return NextResponse.json(
        { error: 'You can only send messages for your own design requests' },
        { status: 403 }
      );
    }

    // Determine the recipient if not specified
    let actualRecipientId = recipientId;
    
    if (!actualRecipientId) {
      if (isAdmin) {
        // If admin is sending and no recipient specified, send to request owner
        actualRecipientId = designRequest.userId;
      } else {
        // If user is sending and no recipient specified, send to admin
        // Find an admin user
        const admin = await prisma.user.findFirst({
          where: { role: 'ADMIN' }
        });
        
        if (admin) {
          actualRecipientId = admin.id;
        }
      }
    }

    console.log("Creating message with data:", {
      content,
      designRequestId,
      senderId,
      recipientId: actualRecipientId,
      isAdmin
    });

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        designRequestId,
        userId: senderId,
        recipientId: actualRecipientId,
        isFromAdmin: isAdmin,
        isRead: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        designRequest: {
          select: {
            id: true,
            title: true,
            status: true,
            userId: true
          }
        }
      }
    });

    console.log("Message created successfully:", message);

    // Send email notification
    if (message.recipient?.email) {
      const senderName = message.user.name || message.user.email;
      const requestTitle = message.designRequest.title;
      
      await sendEmail({
        to: message.recipient.email,
        subject: `New message about design request: ${requestTitle}`,
        html: `<p>${senderName} sent you a message regarding your design request "${requestTitle}":</p>
        <p style="padding: 10px; background-color: #f5f5f5; border-left: 4px solid #333; margin: 10px 0;">${content}</p>
        <p>Log in to view and respond: <a href="${process.env.NEXTAUTH_URL}/dashboard/messages">${process.env.NEXTAUTH_URL}/dashboard/messages</a></p>`,
      });
    }

    // Transform the message to match the expected interface
    const transformedMessage = {
      ...message,
      sender: message.user,
      senderId: message.userId,
      recipient: message.recipient,
      recipientId: message.recipientId,
      designRequest: message.designRequest
    };

    return NextResponse.json(transformedMessage);
  } catch (error) {
    console.error("Error in POST /api/messages:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: "Failed to create message",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT handler for marking messages as read
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messageIds } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    // Check if the user can mark these messages as read
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds }
      },
      select: {
        id: true,
        recipientId: true
      }
    });

    const canUpdate = messages.every(message => 
      message.recipientId === userId || isAdmin
    );

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'You can only mark messages sent to you as read' },
        { status: 403 }
      );
    }

    // Mark the messages as read
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds }
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Failed to update messages' }, { status: 500 });
  }
} 