'use client'

import UserTable from "@/components/UI/Tables/UserTable/page";
import { User, UserImages } from '@/lib/types';
import { useEffect, useState } from 'react';

// Type for the API response user data
type ApiUser = {
    id: number;
    name: string;
    isActive: boolean;
    isAthlete: boolean;
    isCoach: boolean;
    isProspect: boolean;
    isScouted: boolean;
    isAlumni: boolean;
    createdAt: string;
    updatedAt: string;
    images: UserImages | null;
};

export default function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadUsers = async () => {
            const data = await fetchUsers();
            setUsers(data);
            setIsLoading(false);
        };
        loadUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users', {
                method: 'GET'
            })
        
            if (res.ok) {
                const parsedData = await res.json();
                const transformedData = parsedData.data.map((user: ApiUser) => ({
                    id: user.id,
                    name: user.name,
                    isActive: user.isActive ?? false,
                    isAthlete: user.isAthlete ?? false,
                    isCoach: user.isCoach ?? false,
                    isProspect: user.isProspect ?? false,
                    isScouted: user.isScouted ?? false,
                    isAlumni: user.isAlumni ?? false,
                    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                    updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
                    images: user.images ?? undefined
                }));
                return transformedData;
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }


    return (
        <UserTable users={users} isLoading={isLoading} />
    )
    
}