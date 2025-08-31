import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      await db.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? "Unknown User",
        },
        create: {
          name: user.name ?? "Unknown User",
          email: user.email,
        },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
