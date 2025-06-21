"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

interface GalleryMedia {
    id: string;
    name: string;
    mediaUrl: string;
    mediaType: string;
    videoThumbnail?: string;
}

export default function PublicGallery({ galleryMedia }: { galleryMedia: GalleryMedia[] }) {
    const [media, setMedia] = useState<GalleryMedia[]>(galleryMedia ?? []);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<GalleryMedia | null>(null);


    useEffect(() => {
        setMedia(galleryMedia ?? []);
    }, [galleryMedia]);

    const openModal = (item: GalleryMedia) => {
        setSelectedMedia(item);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedMedia(null);
    };

    return (
        <div className="mx-auto w-full px-6 lg:px-8">
                {media.length > 0 ? (
                    <>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {media.map((item: GalleryMedia) => (
                            <div
                                key={item.id}
                                onClick={() => openModal(item)}
                                className="flex flex-col h-full group overflow-hidden bg-[var(--card-bg)] shadow hover:shadow-lg cursor-pointer hover:ring-1 hover:ring-[var(--border)]"
                            >
                                {/* Media Section */}
                                <div className="relative flex-grow">
                                    {item.mediaType.startsWith("video/") ? (
                                        <img
                                            key={`thumb-${item.id}`}
                                            src={item.videoThumbnail}
                                            alt={item.name}
                                            className="h-60 w-full object-cover transition duration-300 group-hover:brightness-75"
                                        />
                                    ) : (
                                        <img
                                            key={`img-${item.id}`}
                                            src={item.mediaUrl}
                                            alt={item.name}
                                            className="h-60 w-full object-cover transition duration-300 group-hover:brightness-75"
                                        />
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
                                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-[var(--background)] p-6 text-left align-middle shadow-xl transition-all flex gap-6">
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
                )}
            </div>
    )
}
