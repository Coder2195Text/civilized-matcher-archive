import NextAuth, { Session, Token, User } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { signIn } from "next-auth/react";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
    }),
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session?.user) {
        session.user = {
          ...token.user,
          ...session.user,
        };
      }
      return session;
    },
    async jwt({ user, token, account }) {
      if (user) {
        token.user = user;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};

//@ts-ignore
export default NextAuth(authOptions);
