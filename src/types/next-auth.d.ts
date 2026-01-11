import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string;
            image?: string;
            role: string;
            subscriptionStatus: string;
            approvalStatus: string;
        };
    }

    interface User {
        id: string;
        email: string;
        name?: string;
        image?: string;
        role: string;
        subscriptionStatus: string;
        approvalStatus: string;
    }
}
