import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  url: process.env.NEXTAUTH_URL,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Call your .NET backend API for authentication
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
          
          if (!apiUrl) {
            console.error("[NextAuth] NEXT_PUBLIC_API_URL is not set");
            return null;
          }
          
          const loginUrl = `${apiUrl}/api/auth/login`;
          console.log("[NextAuth] Attempting login to:", loginUrl);
          
          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          console.log("[NextAuth] Login response status:", response.status);

          if (response.ok) {
            const user = await response.json();
            console.log("[NextAuth] Login successful for user:", user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          }
          
          // Log error details
          const errorText = await response.text();
          console.error("[NextAuth] Login failed:", response.status, errorText);
          
          // If credentials don't match, return null
          return null;
        } catch (error) {
          console.error("[NextAuth] Auth error:", error);
          console.error("[NextAuth] Error details:", {
            message: error.message,
            stack: error.stack,
            apiUrl: process.env.NEXT_PUBLIC_API_URL
          });
          
          // Fallback to test credentials for development only
          if (process.env.NODE_ENV === 'development' && 
              credentials.email === "test@example.com" && 
              credentials.password === "password") {
            return {
              id: "1",
              email: credentials.email,
              name: "Test User",
            };
          }
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
    callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST }; 