'use client'

import TryoutsTable from '@/components/UI/Tables/TryoutsTable/page';
import { useState, useEffect } from 'react';

type Tryout = {
    id: number;
    athleteName: string;
    athleteDOB: string;
    athleteAbout: string;
    experienceProgram: string;
    experienceLevel: string;
    experienceYears: number;
    currentClub: string;
    currentCoach: string;
    currentHours: number;
    tryoutPreferences: string;
    tryoutLevel: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contactRelationship: string;
    readStatus: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function Tryouts() {
    const [tryouts, setTryouts] = useState<Tryout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTryouts();
    }, []);

    useEffect(() => {
        console.log(tryouts);
    }, [tryouts]);

    const fetchTryouts = async () => {
        const res = await fetch('/api/tryouts', {
            method: 'GET',
        });
    
        if (!res.ok) {
            throw new Error('Failed to fetch tryouts');
        }
    
        const data = await res.json();
        const sorted = data.body.sort((a: Tryout, b: Tryout) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTryouts(sorted);
        setIsLoading(false);
    };

    return (
       <TryoutsTable tryouts={tryouts} setTryouts={setTryouts} isLoading={isLoading} />
    )
}