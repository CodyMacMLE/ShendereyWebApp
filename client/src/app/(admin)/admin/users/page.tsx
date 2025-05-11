'use client'

import UserTable from "@/components/UI/Tables/UserTable/page";
import { useState, useEffect } from 'react';

export default function Users() {
    const [users, setUsers] = useState([])
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
            let res = await fetch('/api/users', {
                method: 'GET'
            })
        
            if (res.ok) {
                const parsedData = await res.json();
                const transformedData = parsedData.data.map((user: any) => ({
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
            return new Error('Error fetching users');
        }
    }


    return (
        <UserTable users={users} isLoading={isLoading} />
    )
    
}