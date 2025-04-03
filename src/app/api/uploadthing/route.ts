import { createRouteHandler } from "uploadthing/next";

// Try importing using the path alias
import { ourFileRouter } from "@/app/api/uploadthing/core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

// Remove placeholder exports
// export async function GET() { ... }
// export async function POST() { ... } 