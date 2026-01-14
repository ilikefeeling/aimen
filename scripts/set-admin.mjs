/**
 * ADMIN 사용자 설정 스크립트
 * 
 * 사용법:
 *    node scripts/set-admin.mjs <user_email>
 * 
 * 예시:
 *    node scripts/set-admin.mjs admin@example.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin(email) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                status: 'ACTIVE'
            }
        });

        console.log('✅ ADMIN 권한이 부여되었습니다:');
        console.log(`   이름: ${user.name}`);
        console.log(`   이메일: ${user.email}`);
        console.log(`   역할: ${user.role}`);
        console.log(`   상태: ${user.status}`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error('❌ 해당 이메일의 사용자를 찾을 수 없습니다:', email);
        } else {
            console.error('❌ 오류 발생:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];

if (!email) {
    console.log('사용법: node scripts/set-admin.mjs <user_email>');
    console.log('예시: node scripts/set-admin.mjs admin@example.com');
    process.exit(1);
}

setAdmin(email);
