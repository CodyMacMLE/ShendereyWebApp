import Image from "next/image";
import { useState, useEffect, use } from "react";

import Modal from "@/components/UI/Modal/page"
import Gallery from '@/components/UI/AthleteGallery/page'
import AddUserMedia from "@/components/Form/AddUserMedia/page";

import { UserCircleIcon } from "@heroicons/react/24/solid";

type Athlete = {
    userId: number
    athleteId: number,
    name: string,
    image: string,
}

type Media = {
    id: string,
    name: string,
    description: string,
    category: string,
    date: string | Date,
    mediaUrl: string,
    mediaType: string,
    videoThumbnail: string
}

export default function UserGallery({ athlete } : { athlete : Athlete}) {
        // Add State
        const [addModalEnabled, setAddModalEnabled] = useState(false);
        // Edit State
        const [editModalEnabled, setEditModalEnabled] = useState(false);
        //const [selectedMediaItem, setSelectedMediaItem] = useState<Media | null>(null);
    
        const [athleteMedia, setAthleteMedia] = useState<Media[] | []>([]);

        useEffect(() => {
            fetchMedia();
          }, [])
        
        useEffect(() => {
            console.log(athleteMedia)
            }, [athleteMedia]);

        // Get Media
        const fetchMedia = async () => {
            try {
            const res = await fetch(`/api/users/${athlete.userId}/media/${athlete.athleteId}`, {
                method: 'GET',
            })

            if (res.ok) {
                const data = await res.json();
                setAthleteMedia(data.body || []);
            }
            } catch (error) {
            console.error(error)
            }
        }

    return (
        <>
            {addModalEnabled && (
                <Modal title="Add Media" setModalEnable={setAddModalEnabled}>
                    <AddUserMedia userId={athlete.userId} athleteId={athlete.athleteId} setAthleteMedia={(media) => setAthleteMedia(media as Media[])} setModalEnable={setAddModalEnabled}/>
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
                    <Gallery athlete={athlete} media={athleteMedia} />
                </div>
            </div>

        </>
    )
}