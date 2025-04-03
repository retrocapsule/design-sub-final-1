import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Adjust path if your auth options are elsewhere

// Removed session imports/checks for simplification
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth"; 

console.log("------------------------------------");
console.log("[Uploadthing Core - Restored] Initializing...");
const secretLoaded = !!process.env.UPLOADTHING_SECRET;
const appIdLoaded = !!process.env.UPLOADTHING_APP_ID;
console.log(`[Uploadthing Core - Restored] UPLOADTHING_SECRET loaded: ${secretLoaded}`);
console.log(`[Uploadthing Core - Restored] UPLOADTHING_APP_ID loaded: ${appIdLoaded}`);
if (!secretLoaded || !appIdLoaded) {
  console.error("[Uploadthing Core - Restored] FATAL ERROR: Required env vars missing!");
  // NOTE: In a real app, you might want to throw here to prevent startup
}
console.log("------------------------------------");

// Revert to basic createUploadthing call without errorFormatter
const f = createUploadthing();

// Function to get the user session
const getUserSession = async () => {
  return await getServerSession(authOptions);
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Restored original uploader with session check
  designRequestUploader: f({
      image: { maxFileSize: "4MB", maxFileCount: 5 }, 
      pdf: { maxFileSize: "16MB", maxFileCount: 5 },
     })
    .middleware(async ({ req }) => {
      console.log("[Uploadthing Middleware - Restored] Checking session...");
      const session = await getUserSession(); 
 
      if (!session?.user?.id) {
          console.error("[Uploadthing Middleware - Restored] Unauthorized: No session user ID found.");
          throw new Error("Unauthorized");
      }
 
      console.log(`[Uploadthing Middleware - Restored] Authorized for user: ${session.user.id}`);
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[Uploadthing onUploadComplete - Restored] Upload complete for userId:", metadata.userId);
      console.log("[Uploadthing onUploadComplete - Restored] file url", file.url);
 
      // Return detailed data needed by the frontend/backend
      return { 
          uploadedBy: metadata.userId, 
          fileName: file.name, 
          fileSize: file.size,
          fileUrl: file.url 
        };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 