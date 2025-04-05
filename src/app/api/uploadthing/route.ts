import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/app/api/uploadthing/core";

// Debug logging for environment variables
console.log("------------------------------------");
console.log("[UploadThing Route] Initializing API route");
console.log("[UploadThing Route] Environment check:");
console.log(`- UPLOADTHING_SECRET: ${process.env.UPLOADTHING_SECRET ? "✓" : "✗"}`);
console.log(`- UPLOADTHING_APP_ID: ${process.env.UPLOADTHING_APP_ID ? "✓" : "✗"}`);
console.log(`- UPLOADTHING_TOKEN: ${process.env.UPLOADTHING_TOKEN ? "✓" : "✗"}`);
console.log(`- NEXT_PUBLIC_UPLOADTHING_APP_ID: ${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID ? "✓" : "✗"}`);
console.log(`- CALLBACK URL: ${process.env.NEXT_PUBLIC_CALLBACK_URL || "(using default)"}`);
console.log("------------------------------------");

// Simplified version - only provide the essential configuration
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

// Remove placeholder exports
// export async function GET() { ... }
// export async function POST() { ... } 