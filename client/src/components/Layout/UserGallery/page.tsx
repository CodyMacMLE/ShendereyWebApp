import Image from "next/image";
import { useState, useEffect } from "react";

import Modal from "@/components/UI/Modal/page"
import Gallery from '@/component/UI/Gallery/page'
//import AddVideo from "@/components/Form/AddVideo/page";

import { UserCircleIcon } from "@heroicons/react/24/solid";

type Athlete = {
    id: number,
    name: string,
    image: string,
}

type Media = {
    id: string,
    name: string,
    description: string,
    date: Date,
    mediaUrl: string
}

export default function UserGallery({ athlete } : { athlete : Athlete}) {
        // Add State
        const [addModalEnabled, setAddModalEnabled] = useState(false);
        // Edit State
        const [editModalEnabled, setEditModalEnabled] = useState(false);
        //const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    
        const [enabledStates, setEnabledStates] = useState<{ [key: number]: boolean }>({});
        const [athleteMedia, setAthleteMedia] = useState<Media[] | []>([]);

    return (
        <>
            {addModalEnabled && (
                <Modal title="Add Achievement" setModalEnable={setAddModalEnabled}>
                    "Adding Video" {/* <AddVideo athleteId={athlete.id} setAthleteAchievements={setAthleteAchievements} setModalEnable={setAddModalEnabled}/> */}
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
                        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{athlete.name}'s Gallery</h1>
                    </div>
                    <div className="mt-10 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                        type="button"
                        onClick={() => setAddModalEnabled(true)}
                        className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                        >
                        Add Media
                        </button>
                    </div>
                </div>

                {/* Gallery */}
                <div className="py-10">
                    <Gallery media={athleteMedia} />
                </div>
            </div>

        </>
    )
}