import { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "database",
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
        async session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
                (session.user as any).role = (user as any).role || 'USER';
                (session.user as any).status = (user as any).status || 'ACTIVE';
                (session.user as any).plan = (user as any).plan || 'FREE';
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
