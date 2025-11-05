import { getServerSession } from "next-auth";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { authOptions } from "../auth/[...nextauth]/options";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: "16MB", maxFileCount: 3 },
  })
    // Permissions and file types for this route
    .middleware(async () => {
      const session = await getServerSession(authOptions);

      if (!session?.user || !session.user.isAdmin) {
        throw new Error("Unauthorized: Only admins can upload files.");
      }

      return { userId: session.user.id };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
