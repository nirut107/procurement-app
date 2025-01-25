import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { PrismaAdapter } from '@auth/prisma-adapter'

const prisma = new PrismaClient()

declare module 'next-auth' {
	interface User {
	  id: string
	}
  
	interface Session {
	  user: {
		id: string | null
		name?: string | null
		email?: string | null
		image?: string | null
	  }
	}
  
	interface JWT {
	  id: string
	}
  }

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'john@doe.com' }, 
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
          }
        } else {
          throw new Error('Invalid email or password')
        }
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = String(user.id)
      }
      return token
    },
    session: async ({ session, token }) => {
		session.user = {
			...session.user,
			id: token.id as string,
		  }
      return session
    },
  },
}

const handler = NextAuth(authOptions)


export { handler as GET, handler as POST }
