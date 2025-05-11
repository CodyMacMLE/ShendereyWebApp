"use client"

import { useEffect, useState } from "react";
import ProgramLayout from "@/components/Layout/Admin/ProgramLayout/page";

enum NavPages {
    Programs = 'Programs',
    Classes = 'Classes',
}

type Program = {
    id: number,
    name: string,
    category: string,
    description: string,
    length: number,
    ages: string,
    programImgUrl: string,
}

type Group = {

}

export default function Programs() {

    // Nav Pages
    const [isPrograms, setIsPrograms] = useState(true);

    // Page Data
    const [programs, setPrograms] = useState<Program[] | []>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPrograms = async () => {
        try {
            const res = await fetch(`/api/programs`,{
                method: 'GET'
            });

            if (res.ok) {
                const data = await res.json();
                setPrograms(data.body);
            }
            
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms()
    },[])

    useEffect(() => {
    },[programs])

    return (
        <>
            {/* Content */}
            {isPrograms && (
                <ProgramLayout programs={programs} isLoading={isLoading}/>
            )}
        </>
    )
}