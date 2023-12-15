import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import appConfig from "@/appConfig";

const handler = NextAuth({
  secret: appConfig.AUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GithubProvider({
      clientId: appConfig.GITHUB_APP_CLIENT_ID!,
      clientSecret: appConfig.GITHUB_APP_CLIENT_SECRET!,
      authorization: { params: { scope: 'access_token', }, },
      accessTokenUrl: "https://github.com/login/oauth/access_token",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token = Object.assign({}, token, { access_token: account.access_token });
      }

      return token;
    },
    async session({ session, token }) {
      if (session) {
        session = Object.assign({}, session, { access_token: token.access_token });
      }

      return session;
    }
  },
  session: {
    strategy: 'jwt',
  }
});

export { handler as GET, handler as POST }
