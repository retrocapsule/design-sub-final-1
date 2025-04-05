import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Adjust path if your auth options are elsewhere

// Removed session imports/checks for simplification
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth"; 

console.log("------------------------------------");
console.log("[Uploadthing Core] Initializing...");
const secretLoaded = !!process.env.UPLOADTHING_SECRET;
const appIdLoaded = !!process.env.UPLOADTHING_APP_ID;
const tokenLoaded = !!process.env.UPLOADTHING_TOKEN;
console.log(`[Uploadthing Core] UPLOADTHING_SECRET loaded: ${secretLoaded}`);
console.log(`[Uploadthing Core] UPLOADTHING_APP_ID loaded: ${appIdLoaded}`);
console.log(`[Uploadthing Core] UPLOADTHING_TOKEN loaded: ${tokenLoaded}`);
console.log("------------------------------------");

// Create the uploadthing instance with simplified configuration
const f = createUploadthing();

// Function to get the user session
const getUserSession = async () => {
  return await getServerSession(authOptions);
}

// FileRouter for your app with simplified configuration
export const ourFileRouter = {
  // Define a simpler uploader with minimal configuration
  designRequestUploader: f({
      image: { maxFileSize: "4MB", maxFileCount: 5 }, 
      pdf: { maxFileSize: "16MB", maxFileCount: 5 },
     })
    .middleware(async () => {
      console.log("[Uploadthing Middleware] Checking session...");
      const session = await getUserSession(); 
 
      if (!session?.user?.id) {
          console.error("[Uploadthing Middleware] Unauthorized: No session user ID found.");
          throw new Error("Unauthorized");
      }
 
      console.log(`[Uploadthing Middleware] Authorized for user: ${session.user.id}`);
      return { userId: session.user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log("[Uploadthing onUploadComplete] Upload complete for userId:", metadata.userId);
      console.log("[Uploadthing onUploadComplete] file url", file.url);
 
      // Return simplified data
      return {
          uploadedBy: metadata.userId, 
          fileName: file.name, 
          fileSize: file.size,
          fileUrl: file.url,
          key: file.key
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 