"use client"

import Image from "next/image";

import Modal from "@/components/UI/Modal/page"
import AddAchievement from "@/components/Form/AddAchievement/page";
import EditAchievement from "@/components/Form/EditAchievement/page";

import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";

type Athlete = {
    id: number,
    name: string,
    image: string,
}

type Achievement =  {
    id: number,
    athlete: number,
    title: string,
    description: string,
    date: Date,
}

export default function AchievementsTable({ athlete } : { athlete : Athlete}) {
    // Add State
    const [addModalEnabled, setAddModalEnabled] = useState(false);
    // Edit State
    const [editModalEnabled, setEditModalEnabled] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    const [enabledStates, setEnabledStates] = useState<{ [key: number]: boolean }>({});
    const [athleteAchievements, setAthleteAchievements] = useState<Achievement[] | []>([]);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.confirm-delete-button')) {
      setEnabledStates((prev) => {
        const updated = { ...prev };
        for (const id in updated) {
          updated[id] = false;
        }
        return updated;
      });
    }
  };
  window.addEventListener('click', handleClickOutside);
  return () => {
    window.removeEventListener('click', handleClickOutside);
  };
}, []);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await fetch(`/api/users/${athlete.id}/achievements`);

                if (res.ok) {
                    const data = await res.json();
                    setAthleteAchievements(data.body);
                }
            } catch (error) {
                console.error("Fetch error")
            }
        }
        fetchAchievements();
    }, [athlete.id]);

    // Delete Achievement
    const deleteAchievement = async (athleteId : number, achievementId: number) => {
        try {
            const res = await fetch(`/api/users/${athlete.id}/achievements/${achievementId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                const data = await res.json();
                const newArray = athleteAchievements.filter(achievement => achievement.id !== data.body.id);
                setAthleteAchievements(newArray)
            }
        } catch (error) {
            console.error(error);
        }
    }


    const toggleEnabled = (id: number) => {
        setEnabledStates(prev => ({
        ...prev,
        [id]: !prev[id],
        }));
    };

    return (
        <>

        { addModalEnabled && (
            <Modal title="Add Achievement" setModalEnable={setAddModalEnabled}>
                <AddAchievement athleteId={athlete.id} setAthleteAchievements={setAthleteAchievements} setModalEnable={setAddModalEnabled}/>
            </Modal>
        )} 

        {editModalEnabled && selectedAchievement && (
            <Modal title="Edit Score" setModalEnable={setEditModalEnabled}>
            <EditAchievement athleteId={athlete.id} achievement={selectedAchievement} setModalEnable={setEditModalEnabled}/>
            </Modal>
        )} 

        <div className="px-4 sm:px-6 lg:px-8 mt-8">
            {/* Header Display */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto flex items-center gap-5">
                {athlete.image ? (
                        <div className="h-[50px] w-[50px] rounded-full overflow-hidden ring-1 ring-[var(--border)]">
                            <Image
                                src={athlete.image}
                                alt="Athlete Image"
                                width={100}
                                height={100}
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className='flex items-center justify-center bg-[var(--card-bg)] ring ring-[var(--border)] mt-8 h-[50px] w-[50px] rounded-full'>
                            <UserCircleIcon aria-hidden="true" className="size-20 text-[var(--muted)]" />
                        </div> 
                    )}
                    <h1 className="text-2xl font-semibold text-[var(--foreground)]">{athlete.name}'s Scores</h1>
                </div>
                <div className="mt-10 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                    type="button"
                    onClick={() => setAddModalEnabled(true)}
                    className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                    >
                    Add Achievement
                    </button>
                </div>
            </div>

            {/* Table */}
            {athleteAchievements.length > 0 ? (
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-x-auto shadow ring-1 ring-[var(--border)] sm:rounded-lg">
                            <table className="min-w-full divide-y divide-[var(--border)]">
                                <thead className="bg-[var(--card-bg)]">
                                    <tr>
                                        <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6">
                                            Title
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                                            Date
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                                            Description
                                        </th>
                                        <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                                    {athleteAchievements.map((achievement: Achievement) => { 
                                        const enabled = enabledStates[achievement.id] || false;

                                        const handleDeleteClick = async () => {
                                        if (!enabled) {
                                            toggleEnabled(achievement.id);
                                        } else {
                                            console.log("Delete score with id:", achievement.id);
                                            await deleteAchievement(athlete.id, achievement.id);
                                        }
                                        };

                                        return (
                                            <tr key={achievement.id} className="transition-colors duration-150">
                                                <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6">
                                                    {achievement.title}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                                    {new Date(achievement.date).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                                    {achievement.description}
                                                </td>
                                                <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6 ml-5">
                                                    <button
                                                        onClick={handleDeleteClick}
                                                        className={`confirm-delete-button cursor-pointer group relative inline-flex p-1 items-center justify-center rounded-full ${enabled ? 'bg-red-600 hover:bg-red-500' : 'hover:bg-red-600'}`}
                                                    >
                                                        <span className="relative w-[60px] h-[20px] flex items-center justify-center">
                                                          <span className={`absolute transition-opacity duration-150 text-xs text-white font-semibold ${enabled ? 'opacity-100' : 'opacity-0'}`}>
                                                            Confirm
                                                          </span>
                                                          <span className={`absolute transition-opacity duration-150 text-xs text-[var(--foreground)] group-hover:text-white font-semibold ${enabled ? 'opacity-0' : 'opacity-100'}`}>
                                                            <TrashIcon className="w-4 h-4" />
                                                          </span>
                                                        </span>
                                                    </button>
                                                    <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedAchievement(achievement);
                                                        setEditModalEnabled(true);
                                                    }}
                                                    className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold"
                                                    >
                                                    Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            ) : (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No achievements available.</div>
            )}
        </div>  
    </>
  )
}