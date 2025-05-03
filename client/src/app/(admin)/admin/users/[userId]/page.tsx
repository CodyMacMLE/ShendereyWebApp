'use client'

import { useState, useEffect } from 'react';
import { redirect, useParams } from 'next/navigation';

import DisplayUser from '@/components/Layout/DisplayUser/page';
import ScoresTable from '@/components/UI/Tables/ScoresTable/page';
import UserGallery from '@/component/Layout/UserGallery/page'
import AchievementsTable from '@/components/UI/Tables/AchievementsTable/page';

import { ChevronLeftIcon } from '@heroicons/react/24/outline';

type UserData = {
    id: number,
    name: string,
    isActive: boolean,
    isAthlete: boolean,
    isAlumni: boolean,
    isProspect: boolean,
    isCoach: boolean,
    isScouted: boolean,
    createdAt: Date,
    updatedAt: Date,
    images: {
        staffUrl: string,
        athleteUrl: string,
        prospectUrl: string,
        alumniUrl: string,
    },
    coach?: {
        id: number,
        title: string,
        description: string,
        isSeniorStaff: boolean,
    },
    athlete?: {
        id: number,
        level: string,
        alumni?: {
            school: string,
            year: Date,
            description: string,
        },
        prospect?: {
            graduationYear: Date,
            gpa: number,
            institution: string,
            major: string,
            instagramLink: string,
            youtubeLink: string,
            description: string,
        },
    }
}

enum NavPages {
    Profile = 'Profile',
    Groups = 'Groups',
    Scores = 'Scores',
    Gallery = 'Gallery',
    Achievements = 'Achievements',
}

export default function UserPage() {

    const { userId } = useParams();
    const [userData, setUserData] = useState<UserData | null>(null);

    const [isProfile, setIsProfile] = useState(true);
    const [isGroups, setIsGroups] = useState(false);
    const [isScores, setIsScores] = useState(false);
    const [isGallery, setIsGallery] = useState(false);
    const [isAchievements, setIsAchievements] = useState(false);

    function setNav(newPage: NavPages) {
        setIsProfile(newPage === NavPages.Profile);
        setIsGroups(newPage === NavPages.Groups);
        setIsScores(newPage === NavPages.Scores);
        setIsGallery(newPage === NavPages.Gallery);
        setIsAchievements(newPage === NavPages.Achievements);
    }

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/users/${userId}`,{
                method: 'GET'
            });

            if (res.ok) {
                const data = await res.json();
                setUserData(data.body);
            }

            if (userData === null) {
                redirect("/admin/users/create-user")
            }
            
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    useEffect(() => {
        if (!userId || typeof window === 'undefined') return;
        fetchUser();
    }, [userId]);

    return (
        <>
            {/* Back Button */}
            <div className="px-6 mb-10">
                <div className="flex">
                    <div onClick={() => redirect("/admin/users") } className="group flex items-center cursor-pointer">
                        <ChevronLeftIcon className="h-4 w-4 mr-2 text-[var(--muted)] group-hover:text-[var(--primary)]" />
                        <span className="text-[var(--muted)] group-hover:text-[var(--primary)] font-semibold items-center">Back</span>
                    </div>
                </div>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl px-7 mb-4">User Profile</h1>

            {/* Profile Nav */}
            <header className="border-b border-[var(--border)]">
                {/* Secondary navigation */}
                <nav className="flex overflow-x-auto py-4">
                    <ul
                    role="list"
                    className="flex min-w-full flex-none gap-x-6 px-4 text-sm/6 font-semibold text-[var(--muted)] sm:px-6 lg:px-8"
                    >
                        {/* User Profile Nav */}
                        <li>
                            <a onClick={() => setNav(NavPages.Profile)} className={isProfile ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                                Profile
                            </a>
                        </li>

                        {/* Groups Nav */}
                        {userData?.isCoach && (
                            <li>
                                <a onClick={() => setNav(NavPages.Groups)} className={isGroups ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                                    Groups
                                </a>
                            </li>
                        )}

                        {/* Athlete Navlinks */}
                        {userData?.isAthlete && (
                            <>
                                {/* Scores Nav */}
                                <li>
                                    <a onClick={() => setNav(NavPages.Scores)} className={isScores ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                                        Scores
                                    </a>
                                </li>

                                {/* Videos Nav */}
                                <li>
                                    <a onClick={() => setNav(NavPages.Gallery)} className={isGallery ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                                        Gallery
                                    </a>
                                </li>

                                {/* Achievements Nav */}
                                <li>
                                    <a onClick={() => setNav(NavPages.Achievements)} className={isAchievements ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                                    Achievements
                                    </a>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </header>
            
            {isProfile && userData && (
                <DisplayUser user={userData} />
            )}

            {isScores && userData && (
                <ScoresTable  
                    athlete={{ id: userData.athlete!.id, name: userData.name }} 
                    images={userData.images}
                />
            )}

            {isGallery && userData && (
                <UserGallery  
                    athlete={{ id: userData.athlete!.id, name: userData.name, image:userData.images.athleteUrl }}
                />
            )}

            {isAchievements && userData && (
                <AchievementsTable  
                    athlete={{ id: userData.athlete!.id, name: userData.name, image:userData.images.athleteUrl }}
                />
            )}
        </>
    )
};