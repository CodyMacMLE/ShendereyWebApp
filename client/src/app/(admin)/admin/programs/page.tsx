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
    const [isClasses, setIsClasses] = useState(false);

    function setNav(newPage: NavPages) {
        setIsPrograms(newPage === NavPages.Programs);
        setIsClasses(newPage === NavPages.Classes);
    }

    // Page Data
    const [programs, setPrograms] = useState<Program[] | []>([]);
    const [groups, setGroups] = useState<Group[] | []>([]);
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
        }
    };

    useEffect(() => {
        fetchPrograms()
        // fetchClasses()
        setIsLoading(false);
    },[])

    useEffect(() => {
        console.log(programs)
    },[programs, groups])

    return (
        <>
            {/* Programs Nav */}
            <header className="border-b border-[var(--border)]">
            {/* Secondary navigation */}
            <nav className="flex overflow-x-auto py-4">
                <ul
                role="list"
                className="flex min-w-full flex-none gap-x-6 px-4 text-sm/6 font-semibold text-[var(--muted)] sm:px-6 lg:px-8"
                >
                    {/* Programs Nav */}
                    <li>
                        <a onClick={() => setNav(NavPages.Programs)} className={isPrograms ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                            Programs
                        </a>
                    </li>

                    {/* Groups Nav */}
                    <li>
                        <a onClick={() => setNav(NavPages.Classes)} className={isClasses ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                            Groups
                        </a>
                    </li>

                </ul>
            </nav>
        </header>

        {/* Content */}
        {isPrograms && (
            <ProgramLayout programs={programs} isLoading={isLoading}/>
        )}

        {isClasses && (
            <></>
        )}
    </>
    )
}