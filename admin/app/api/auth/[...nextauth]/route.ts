import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple admin login - production'da database'den kontrol edilmeli
        if (credentials?.username === 'admin' && credentials?.password === 'eagle2025') {
          return {
            id: '1',
            name: 'Admin User',
            email: 'admin@eagledtfsupply.com',
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };

