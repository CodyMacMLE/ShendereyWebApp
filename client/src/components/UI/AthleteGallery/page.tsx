import { EditUserMedia } from "@/components/Form/EditUserMedia/page";
import { Dialog, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';
import { Fragment, useEffect, useState } from "react";

type Athlete = {
    userId: number,
    athleteId: number
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

export default function AthleteGallery({ athlete, media }: { athlete: Athlete, media: Media[] | [] }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [mediaItems, setMediaItems] = useState<Media[] | []>([]);

    useEffect(() => {
        if (media) {
            if (media.length > 0) setMediaItems(media);
        } else {
            setMediaItems([]);
        }
    }, [media])

    useEffect(() => {
    }, [mediaItems])

    const openModal = (item: Media) => {
        setSelectedMedia(item);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedMedia(null);
    };

    const handleDelete = async () => {
        if (!selectedMedia) return;
        console.log('Entered Delete')

        const res = await fetch(`/api/users/${athlete.userId}/media/${athlete.athleteId}?mediaId=${selectedMedia.id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setActionModalOpen(false);
            setModalOpen(false);
            // Optionally trigger a refetch or update local state
            setMediaItems((prev) => prev.filter(item => item.id !== selectedMedia.id));
        }
    };

    const handleEdit = () => {
      setActionModalOpen(false);
      setEditModalOpen(true);
    }

    return (
      <>
        {mediaItems.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mediaItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => openModal(item)}
                        className="flex flex-col h-full group overflow-hidden rounded-lg bg-[var(--card-bg)] shadow hover:shadow-lg cursor-pointer hover:ring-1 hover:ring-[var(--border)]"
                    >
                        {/* Media Section */}
                        <div className="relative flex-grow">
                            {item.mediaType.startsWith("video/") ? (
                                <Image
                                    src={item.videoThumbnail}
                                    alt={item.name}
                                    className="h-60 w-full object-cover transition duration-300 group-hover:brightness-75"
                                    width={1000}
                                    height={1000}
                                />
                            ) : (
                                <Image
                                    src={item.mediaUrl}
                                    alt={item.name}
                                    className="h-60 w-full object-cover transition duration-300 group-hover:brightness-75"
                                    width={1000}
                                    height={1000}
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
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-[var(--background)] p-6 text-left align-middle shadow-xl transition-all flex gap-6">
                                    {/* Media */}
                                    {selectedMedia && (
                                        <>
                                            <div className="w-1/2">
                                                {selectedMedia.mediaType.startsWith("video/") ? (
                                                    <video controls className="w-full h-auto rounded">
                                                        <source src={selectedMedia.mediaUrl} type={selectedMedia.mediaType} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <Image
                                                        src={selectedMedia.mediaUrl}
                                                        alt={selectedMedia.name}
                                                        className="w-full h-auto rounded"
                                                        width={1000}
                                                        height={1000}
                                                    />
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="w-1/2">
                                                <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-semibold">
                                                    {selectedMedia.name}
                                                </h3>
                                                <button onClick={() => setActionModalOpen(true)}>
                                                    <EllipsisVerticalIcon className="w-5 h-5 text-[var(--muted)] hover:text-[var(--foreground)]" />
                                                </button>
                                                </div>
                                                <p className="text-sm text-[var(--muted)] mt-1">
                                                    {new Date(selectedMedia.date).toLocaleDateString()}
                                                </p>
                                                <p className="mt-5">
                                                    {selectedMedia.description || "No description provided."}
                                                </p>
                                                <p className="italic text-sm text-[var(--muted)]">
                                                    Category: {selectedMedia.category || "Uncategorized"}
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

            <Transition show={actionModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setActionModalOpen(false)}>
                <div className="fixed inset-0 bg-black bg-opacity-25" />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-xs transform overflow-hidden rounded-lg bg-[var(--card-bg)] p-6 text-left align-middle shadow-xl transition-all space-y-4">
                    <Dialog.Title className="text-lg font-medium">Manage Media</Dialog.Title>
                    <button
                        onClick={handleEdit}
                        className="text-sm w-full text-left hover:text-[var(--accent)]"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="text-sm w-full text-left text-red-500 hover:underline"
                    >
                        Delete
                    </button>
                </Dialog.Panel>
                </div>
            </Dialog>
            </Transition>

            <Transition show={editModalOpen} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => setEditModalOpen(false)}>
                <div className="fixed inset-0 bg-black bg-opacity-25" />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-[var(--background)] p-6 text-left align-middle shadow-xl transition-all space-y-4">
                    <Dialog.Title className="text-lg font-medium mb-4">Edit Media</Dialog.Title>
                    {selectedMedia && (
                      <EditUserMedia
                        media={selectedMedia}
                        athlete={athlete}
                        closeModal={() => setEditModalOpen(false)}
                        // Pass onSuccess correctly to EditUserMedia
                        onSuccess={(updated: Media) => {
                          setMediaItems(prev => prev.map(item => item.id === updated.id ? updated : item));
                          setSelectedMedia(updated);
                          setEditModalOpen(false);
                        }}
                      />
                    )}
                  </Dialog.Panel>
                </div>
              </Dialog>
            </Transition>
            </>
        ) : (
            <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No media items available.</div>
        )}
      </>
    );
}