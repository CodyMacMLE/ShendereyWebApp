'use client'

import UserTable from "@/components/UI/Tables/UserTable/page";
import { useEffect, useState } from 'react';

export default function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)

    type User = {
        User: User,
        isActive: boolean | null,
        isAthlete: boolean | null,
        isCoach: boolean | null,
        isProspect: boolean | null,
        isScouted: boolean | null,
        isAlumni: boolean | null,
        createdAt: Date | null,
        updatedAt: Date | null,
        images: {
            staffUrl: string | null,
            athleteUrl: string | null,
            prospectUrl: string | null,
            alumniUrl: string | null
        }
    }

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
                const transformedData = parsedData.data.map((user: User) => ({
                    ...user,
                    isActive: user.isActive ?? false,
                    isAthlete: user.isAthlete ?? false,
                    isCoach: user.isCoach ?? false,
                    isProspect: user.isProspect ?? false,
                    isScouted: user.isScouted ?? false,
                    isAlumni: user.isAlumni ?? false,
                    createdAt: user.createdAt ?? new Date(),
                    updatedAt: user.updatedAt ?? new Date(),
                    images: user.images ?? undefined
                }));
                return transformedData;
            }
        } catch (error) {
            return new Error('Error fetching users', error as Error);
        }
    }


    return (
        <UserTable users={users} isLoading={isLoading} />
    )
    
}