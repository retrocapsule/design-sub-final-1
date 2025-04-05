import { createRouteHandler } from "uploadthing/next";

// Try importing using the path alias
import { ourFileRouter } from "@/app/api/uploadthing/core";

// Debug logging for environment variables
console.log("------------------------------------");
console.log("[UploadThing Route] Initializing...");
const secretLoaded = !!process.env.UPLOADTHING_SECRET;
const appIdLoaded = !!process.env.UPLOADTHING_APP_ID;
const tokenLoaded = !!process.env.UPLOADTHING_TOKEN;
console.log(`[UploadThing Route] UPLOADTHING_SECRET loaded: ${secretLoaded}`);
console.log(`[UploadThing Route] UPLOADTHING_APP_ID loaded: ${appIdLoaded}`);
console.log(`[UploadThing Route] UPLOADTHING_TOKEN loaded: ${tokenLoaded}`);
console.log(`[UploadThing Route] Callback URL: ${process.env.NEXT_PUBLIC_CALLBACK_URL || "not set"}`);
console.log("------------------------------------");

// Export routes for Next App Router with optimized configuration
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    uploadthingId: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
    isDev: process.env.NODE_ENV === "development",
    callbackUrl: `${process.env.NEXT_PUBLIC_CALLBACK_URL || "https://design-sub-final-1.vercel.app"}/api/uploadthing`
  }
});

// Remove placeholder exports
// export async function GET() { ... }
// export async function POST() { ... } 