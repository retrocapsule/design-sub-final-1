import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Logging environment variables to debug
console.log("[UploadThing Core] Initializing with the following environment variables:");
console.log(`- UPLOADTHING_SECRET: ${process.env.UPLOADTHING_SECRET ? "✓" : "✗"}`);
console.log(`- UPLOADTHING_APP_ID: ${process.env.UPLOADTHING_APP_ID ? "✓" : "✗"}`);
console.log(`- UPLOADTHING_TOKEN: ${process.env.UPLOADTHING_TOKEN ? "✓" : "✗"}`);

// Basic setup - less configuration is often more stable
const f = createUploadthing();

// Simple function to get the user session
const getUserSession = async () => {
  return await getServerSession(authOptions);
};

// FileRouter for your app with minimal configuration
export const ourFileRouter = {
  designRequestUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      // Get session using Next-Auth
      const session = await getUserSession();
      
      // Check if user is authenticated
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }
      
      return { userId: session.user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log(`File uploaded: ${file.name}`);
      
      // Return file information
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