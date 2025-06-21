'use client';

import { Dialog, Transition } from "@headlessui/react";
import { PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
import { Score, Media, Achievement } from "@/lib/types";

enum NavPages {
    Scores = 'Scores',
    Gallery = 'Gallery',
    Achievements = 'Achievements',
}

export default function ProspectSubNav({ athleteScores, athleteMedia, athleteAchievements }: { athleteScores: Score[], athleteMedia: Media[], athleteAchievements: Achievement[] }) {

    const [isGallery, setIsGallery] = useState(true);
    const [isScores, setIsScores] = useState(false);
    const [isAchievements, setIsAchievements] = useState(false);

    const [media, setMedia] = useState<Media[]>(athleteMedia ?? []);
    const [scores, setScores] = useState<Score[]>(athleteScores ?? []);
    const [achievements, setAchievements] = useState<Achievement[]>(athleteAchievements ?? []);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    

    function setNav(newPage: NavPages) {
        setIsScores(newPage === NavPages.Scores);
        setIsGallery(newPage === NavPages.Gallery);
        setIsAchievements(newPage === NavPages.Achievements);
    }
    
    const openModal = (item: Media) => {
        setSelectedMedia(item);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedMedia(null);
    };

    useEffect(() => {
        setMedia(athleteMedia ?? []);
        setScores(athleteScores ?? []);
        setAchievements(athleteAchievements ?? []);
    }, [athleteMedia, athleteScores, athleteAchievements]);

    return (
        <>
            <header className="border-b border-[var(--border)]">
                {/* Secondary navigation */}
                <nav className="flex overflow-x-auto py-4">
                    <ul
                    role="list"
                    className="flex min-w-full flex-none gap-x-6 px-4 text-sm/6 font-semibold text-[var(--muted)] sm:px-6 lg:px-8"
                    >    
                        {/* Gallery Nav */}
                        <li>
                            <a onClick={() => setNav(NavPages.Gallery)} className={isGallery ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                                Gallery
                            </a>
                        </li>

                        {/* Scores Nav */}
                        <li>
                            <a onClick={() => setNav(NavPages.Scores)} className={isScores ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                                Scores
                            </a>
                        </li>

                        {/* Achievements Nav */}
                        <li>
                            <a onClick={() => setNav(NavPages.Achievements)} className={isAchievements ? 'text-[var(--primary)] cursor-pointer' : 'hover:text-[var(--primary)] cursor-pointer'}>
                            Achievements
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* Scores Table */}
            {isScores && (scores.length > 0 ? (
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-x-auto shadow ring-1 ring-[var(--border)] sm:rounded-lg">
                    <table className="min-w-full divide-y divide-[var(--border)]">
                        <thead className="bg-[#eeeeee]">
                        <tr>
                            <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6">
                            Competition
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                            Date
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                            Category
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                            Vault
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                            Bars
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                            Beam
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                            Floor
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                            Overall
                            </th>
                            <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] bg-[#eeeeee]">
                        {scores.map((score: Score) => { 
    
                            return (
                                <tr key={score.id} className="transition-colors duration-150">
                                    <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6">
                                        {score.competition}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                        {new Date(score.date).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                        {score.category}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                        {score.vault}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                        {score.bars}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                        {score.beam}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                        {score.floor}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                        {score.overall}
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
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No scores available.</div>
            ))}

            {/* Gallery Table */}
            {isGallery && (media.length > 0 ? (
                <>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {media.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => openModal(item)}
                                className="flex flex-col h-full group overflow-hidden rounded-lg bg-[var(--card-bg)] shadow hover:shadow-lg cursor-pointer hover:ring-1 hover:ring-[var(--border)]"
                            >
                                {/* Media Section */}
                                <div className="relative flex-grow">
                                    {item.mediaType.startsWith("video/") ? (
                                        <img
                                            src={item.videoThumbnail}
                                            alt={item.name}
                                            className="h-60 w-full object-cover transition duration-300 group-hover:brightness-75"
                                        />
                                    ) : (
                                        <img
                                            src={item.mediaUrl}
                                            alt={item.name}
                                            className="h-60 w-full object-cover transition duration-300 group-hover:brightness-75"
                                        />
                                    )}
                                </div>
                                {/* Title Section */}
                                <div className="px-4 py-3 sm:px-6 flex justify-between items-center">
                                    <span className="font-semibold overflow-ellipsis">{item.name}</span>
                                    {item.mediaType.startsWith("video/") ? (
                                        <VideoCameraIcon className="w-5 h-5" />
                                    ) : (
                                        <PhotoIcon className="w-5 h-5" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
        
                    <Transition show={modalOpen} as={Fragment}>
                        <Dialog as="div" className="relative z-50" onClose={closeModal}>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-black bg-opacity-50" />
                            </Transition.Child>
        
                            <div className="fixed inset-0 z-50 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4 text-center">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-[var(--background)] p-6 text-left align-middle shadow-xl transition-all flex-row gap-6">
                                            {/* Media */}
                                            {selectedMedia && (
                                                <>
                                                    <div className="w-full">
                                                        {selectedMedia.mediaType.startsWith("video/") ? (
                                                            <video controls className="w-full h-auto rounded">
                                                                <source src={selectedMedia.mediaUrl} type={selectedMedia.mediaType} />
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        ) : (
                                                            <img
                                                                src={selectedMedia.mediaUrl}
                                                                alt={selectedMedia.name}
                                                                className="w-full h-auto rounded"
                                                            />
                                                        )}
                                                    </div>
        
                                                    {/* Details */}
                                                    <div className="w-full">
                                                        <div className="flex justify-between items-start pt-4">
                                                            <h3 className="text-xl font-semibold">
                                                                {selectedMedia.name}
                                                            </h3>
                                                            <p className="text-sm text-[var(--muted)]">
                                                                {new Date(selectedMedia.date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        
                                                        <p className="mt-5">
                                                            {selectedMedia.description || "No description provided."}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </>
                ) : (
                    <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No media items available.</div>
                ))}

            {/* Achievements Table */}
            {isAchievements && (achievements.length > 0 ? (
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-x-auto shadow ring-1 ring-[var(--border)] sm:rounded-lg">
                                <table className="min-w-full divide-y divide-[var(--border)]">
                                    <thead className="bg-[#eeeeee]">
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)] bg-[#eeeeee]">
                                        {achievements.map((achievement: Achievement) => { 
    
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
                ))}
        </>
    );
}