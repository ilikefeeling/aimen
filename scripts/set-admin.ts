/**
 * ADMIN 사용자 설정 스크립트
 * 
 * 사용법:
 * 1. 기존 사용자를 ADMIN으로 승격하려면:
 *    npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/set-admin.ts <user_email>
 * 
 * 2. 또는 Prisma Studio에서 직접 role을 ADMIN으로 변경:
 *    npx prisma studio
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin(email: string) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                status: 'ACTIVE' // ADMIN은 자동으로 활성화
            }
        });

        console.log('✅ ADMIN 권한이 부여되었습니다:');
        console.log(`   이름: ${user.name}`);
        console.log(`   이메일: ${user.email}`);
        console.log(`   역할: ${user.role}`);
        console.log(`   상태: ${user.status}`);
    } catch (error) {
        console.error('❌ 오류 발생:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// CLI에서 이메일 인자 받기
const email = process.argv[2];

if (!email) {
    console.log('사용법: npx ts-node scripts/set-admin.ts <user_email>');
    console.log('예시: npx ts-node scripts/set-admin.ts admin@example.com');
    process.exit(1);
}

setAdmin(email);
