"use client"

import { Fragment, useEffect, useState } from "react";

import { EditGalleryMedia } from "@/components/Form/EditGalleryMedia/page";
import { Dialog, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

import Modal from "@/components/UI/Modal/page";
import imageCompression from 'browser-image-compression';

import ErrorModal from "@/components/UI/ErrorModal/page";

type Media = {
    id: number,
    name: string,
    description: string,
    date: Date,
    mediaType: string,
    mediaUrl: string,
    videoThumbnail: string
}

export default function OldGallery() {
    // Add State
    const [addModalEnabled, setAddModalEnabled] = useState(false);
    const [media, setMedia] = useState<Media[] | []>([]);

    useEffect(() => {
        fetchMedia();
        }, [])
    
    useEffect(() => {
        }, [media]);

    // Get Media
    const fetchMedia = async () => {
        try {
            const res = await fetch(`/api/gallery`, {
                method: 'GET',
            });
            if (res.ok) {
                const data = await res.json();
                if (setMedia && data.body) setMedia(data.body);
            } else {
                console.error('Error fetching media', await res.json());
            }
        } catch (error) {
            console.error('Error fetching media', error);
        }
    }

    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const openMediaModal = (item: Media) => {
        setSelectedMedia(item);
        setMediaModalOpen(true);
    };

    const closeMediaModal = () => {
        setMediaModalOpen(false);
        setSelectedMedia(null);
    };

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);

    const handleSubmit = async () => {
        const errors: { msg: string }[] = [];

        if (!name.trim()) errors.push({ msg: 'Name is required.' });
        description.trim()
        if (!date) errors.push({ msg: 'Date is required.' });
        if (!mediaFile) errors.push({ msg: 'Media file is required.' });

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('date', date);
            if (mediaFile) {
                formData.append('media', mediaFile);
                formData.append('mediaType', mediaFile.type)
            }

            const res = await fetch(`/api/gallery`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (setMedia && data.body) setMedia([...media, data.body]);
                if (setAddModalEnabled) setAddModalEnabled(false);
            } else {
                console.error('Upload failed.', await res.json());
            }
        } catch (err) {
            console.error('Error submitting form', err);
        }
    };

    const handleDelete = async () => {
        if (!selectedMedia) return;
        console.log('Entered Delete')

        const res = await fetch(`/api/gallery/${selectedMedia.id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setActionModalOpen(false);
            setMediaModalOpen(false);
            // Optionally trigger a refetch or update local state
            setMedia((prev) => prev.filter(item => item.id !== selectedMedia.id));
        }
    };

    const handleEdit = () => {
      setActionModalOpen(false);
      setEditModalOpen(true);
    }

    return (
        <>
            {addModalEnabled && (
                <Modal title="Add Media" setModalEnable={setAddModalEnabled}>
                    <div>
                        {formErrors.length > 0 && (
                            <div className="px-4 pt-6 sm:px-8">
                                <ErrorModal errors={formErrors} />
                            </div>
                        )}
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="space-y-12">
                            <div className="border-b border-[var(--border)] pb-12">
                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12 sm:min-w-4xl">

                                    {/* Title */}
                                    <div className="sm:col-span-4">
                                        <label htmlFor="media-title" className="block text-sm/6 font-medium text-[var(--foreground)]">Title</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                    id="media-title"
                                                    name="media-title"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Marilyn Hayes 2025"
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="sm:col-span-4">
                                        <label htmlFor="media-date" className="block text-sm/6 font-medium text-[var(--foreground)]">Date</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                    id="media-date"
                                                    name="media-date"
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="sm:col-span-full">
                                        <label htmlFor="media-description" className="block text-sm/6 font-medium text-[var(--foreground)]">Description</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <textarea
                                                    id="media-description"
                                                    name="media-description"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Level 3 Team Photo"
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                
                                </div>

                                {/* Media Input */}
                                <div className="col-span-full mt-6">
                                    <label htmlFor="media-item" className="block text-sm/6 font-medium text-[var(--foreground)]">Media</label>
                                    <div className="mt-2 flex items-center gap-x-3">
                                        <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        id="media-item"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                            if (file.size > 100 * 1024 * 1024) {
                                                console.warn("File too large (max 100MB):", file.name);
                                                return;
                                            }
                                            let processedFile = file;
                                            if (file.type.startsWith('image/')) {
                                            processedFile = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1024, useWebWorker: true });
                                            }
                                            setMediaFile(processedFile);
                                            }
                                        }}
                                        />
                                        <label 
                                            htmlFor="media-item" 
                                            className="cursor-pointer rounded-md bg-[var(--background)] px-2.5 py-1.5 text-sm font-bold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--muted)] hover:bg-[var(--primary)] hover:ring-[var(--primary-hover)]"
                                        >
                                            Change
                                        </label>
                                        {mediaFile && (
                                            <p className="text-sm text-[var(--foreground)] mt-1">
                                                Selected file: <span className="font-medium">{mediaFile.name}</span>
                                            </p>
                                        )}
                                    </div>
                                    <p id="image-warning" className="text-[var(--muted)] text-sm mt-2">
                                        Image or Video. 100MB max.
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-x-6">
                            <button
                                type="button"
                                onClick={() => setAddModalEnabled(false)}
                                className="rounded-md py-2 text-sm font-semibold text-red-600 hover:text-red-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                            >
                                Save
                            </button>
                        </div>

                        </form>
                    </div>
                </Modal>
            )} 

            <div className="px-4 sm:px-6 lg:px-8 py-0">

                {/* Title */}
                <div className="sm:flex sm:items-center mb-6">
                    <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-[var(--foreground)]">Gallery</h1>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={() => setAddModalEnabled(true)}
                        type="button"
                        className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                    >
                        Add Media
                    </button>
                    </div>
                </div>

                {media.length > 0 ? (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {media.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => openMediaModal(item)}
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

                    <Transition show={mediaModalOpen} as={Fragment}>
                        <Dialog as="div" className="relative z-50" onClose={closeMediaModal}>
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
                                                            <img
                                                                src={selectedMedia.mediaUrl}
                                                                alt={selectedMedia.name}
                                                                className="w-full h-auto rounded"
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
                            <EditGalleryMedia
                                media={selectedMedia}
                                closeModal={() => setEditModalOpen(false)}
                                // Pass onSuccess correctly to EditUserMedia
                                onSuccess={(updated: Media) => {
                                    setMedia(prev => prev.map(item => item.id === updated.id ? updated : item));
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
            </div>
        </>
    )
}