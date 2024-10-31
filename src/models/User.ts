interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    phone: string;
    role: 'USER' | 'ADMIN' | 'DEALER';
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UserCreateData {
    email: string;
    password: string;
    name: string;
    phone: string;
    role?: 'USER' | 'ADMIN' | 'DEALER';
}

interface UserUpdateData {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

interface UserSettings {
    notifications: boolean;
    twoFactorAuth: boolean;
}

export { User, UserCreateData, UserUpdateData, UserSettings };
