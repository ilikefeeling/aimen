import { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    providers: [
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID || "",
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
            profile(profile) {
                return {
                    id: String(profile.id),
                    name: profile.kakao_account?.profile?.nickname || profile.properties?.nickname || "사용자",
                    email: profile.kakao_account?.email || `${profile.id}@kakao.com`,
                    image: profile.kakao_account?.profile?.profile_image_url || profile.properties?.profile_image,
                    kakaoId: String(profile.id),
                    role: 'USER',
                    status: 'ACTIVE',
                    plan: 'FREE',
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || 'USER';
                token.status = (user as any).status || 'ACTIVE';
                token.plan = (user as any).plan || 'FREE';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).status = token.status;
                (session.user as any).plan = token.plan;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET,
};
