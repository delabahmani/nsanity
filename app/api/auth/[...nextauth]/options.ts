import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prismadb";
import "next-auth";
import { Adapter } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
    };
  }

  interface User {
    isAdmin?: boolean;
  }
}

const customPrismaAdapter: Adapter = PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        // Fetch additional user data from the database
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            isAdmin: true,
            // Add any other fields you want to include
            // For example:
            name: true,
            email: true,
            image: true,
            // Add other custom fields from your database
          },
        });

        // Update session with the fetched data
        session.user.isAdmin = userData?.isAdmin || false;
        session.user.id = userData?.id || "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
