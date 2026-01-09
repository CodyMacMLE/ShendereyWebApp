"use client"

import { Fragment, useEffect, useMemo, useState } from "react";

import { EditGalleryMedia } from "@/components/Form/EditGalleryMedia/page";
import { Dialog, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, MagnifyingGlassIcon, PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

import Modal from "@/components/UI/Modal/page";
import imageCompression from 'browser-image-compression';

import ErrorModal from "@/components/UI/ErrorModal/page";
import Image from "next/image";
import { formatShortDate } from '../../../../lib/utils';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

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
    const [selectedMediaIds, setSelectedMediaIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const openMediaModal = (item: Media) => {
        setSelectedMedia(item);
        setMediaModalOpen(true);
    };

    const closeMediaModal = () => {
        setMediaModalOpen(false);
        setSelectedMedia(null);
    };

    // Helper function to format today's date as YYYY-MM-DD
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(getTodayDateString());
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const resetForm = () => {
        setName('');
        setDescription('');
        setDate(getTodayDateString());
        setMediaFile(null);
        setFormErrors([]);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const errors: { msg: string }[] = [];

        if (!name.trim()) errors.push({ msg: 'Name is required.' });
        description.trim()
        if (!date) errors.push({ msg: 'Date is required.' });
        if (!mediaFile) errors.push({ msg: 'Media file is required.' });

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Step 1: Upload the media item
            const presignedRes = await fetch(`/api/gallery/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: mediaFile?.name,
                    fileType: mediaFile?.type,
                }),
            });

            if (!presignedRes.ok) {
                const errorData = await presignedRes.json();
                setFormErrors([{ msg: errorData.error || 'Failed to get upload URL.' }]);
                return;
            }

            const { uploadUrl, mediaUrl } = await presignedRes.json();

            // Step 2: Upload file directly to S3
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: mediaFile,
                headers: {
                    'Content-Type': mediaFile?.type || 'application/octet-stream',
                },
            });

            if (!uploadRes.ok) {
                setFormErrors([{ msg: 'Failed to upload file to S3.' }]);
                return;
            }

            // Step 3: Check if the media item is a video and generate thumbnail
            let videoThumbnail = '';
            if (mediaFile?.type?.startsWith('video/')) {
                try {
                    // Create a video element to generate thumbnail
                    const video = document.createElement('video');
                    video.crossOrigin = 'anonymous';
                    video.muted = true;
                    video.playsInline = true;
                    
                    // Create a canvas to capture the thumbnail
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas size for thumbnail
                    canvas.width = 640;
                    canvas.height = 360;
                    
                    // Create a promise to handle video loading and thumbnail generation
                    const generateThumbnail = new Promise<string>((resolve, reject) => {
                        video.onloadeddata = () => {
                            try {
                                // Seek to 2 seconds into the video
                                video.currentTime = 2;
                            } catch {
                                // If seeking fails, try at 0 seconds
                                video.currentTime = 0;
                            }
                        };
                        
                        video.onseeked = () => {
                            try {
                                if (ctx) {
                                    // Draw the video frame to canvas
                                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                    
                                    // Convert canvas to blob
                                    canvas.toBlob(async (blob) => {
                                        if (blob) {
                                            // Create a file from the blob
                                            const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
                                            
                                            // Get presigned URL for thumbnail upload using the same route with prefix
                                            const thumbnailPresignedRes = await fetch(`/api/gallery/upload-url?prefix=gallery/thumbnails/`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    fileName: thumbnailFile.name,
                                                    fileType: thumbnailFile.type,
                                                }),
                                            });

                                            if (thumbnailPresignedRes.ok) {
                                                const { uploadUrl: thumbnailUploadUrl, mediaUrl: thumbnailMediaUrl } = await thumbnailPresignedRes.json();
                                                
                                                // Upload thumbnail to S3
                                                const thumbnailUploadRes = await fetch(thumbnailUploadUrl, {
                                                    method: 'PUT',
                                                    body: thumbnailFile,
                                                    headers: {
                                                        'Content-Type': thumbnailFile.type,
                                                    },
                                                });

                                                if (thumbnailUploadRes.ok) {
                                                    resolve(thumbnailMediaUrl);
                                                } else {
                                                    console.warn('Failed to upload thumbnail to S3');
                                                    resolve('');
                                                }
                                            } else {
                                                console.warn('Failed to get thumbnail upload URL');
                                                resolve('');
                                            }
                                        } else {
                                            reject(new Error('Failed to create thumbnail blob'));
                                        }
                                    }, 'image/jpeg', 0.8);
                                } else {
                                    reject(new Error('Canvas context not available'));
                                }
                            } catch (err) {
                                reject(err);
                            }
                        };
                        
                        video.onerror = () => reject(new Error('Failed to load video'));
                        
                        // Set video source
                        video.src = URL.createObjectURL(mediaFile);
                    });
                    
                    // Wait for thumbnail generation and upload
                    videoThumbnail = await generateThumbnail;
                    
                } catch (error) {
                    console.warn('Failed to generate thumbnail:', error);
                    videoThumbnail = '';
                }
            }

            // Step 4: Save media record to database with both media and thumbnail URLs
            const saveRes = await fetch(`/api/gallery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                    date,
                    mediaType: mediaFile?.type,
                    mediaUrl,
                    videoThumbnail,
                }),
            });

            if (saveRes.ok) {
                const data = await saveRes.json();
                if (setMedia && data.body) setMedia([...media, data.body]);
                if (setAddModalEnabled) setAddModalEnabled(false);
                resetForm();
            } else {
                const errorData = await saveRes.json();
                console.error('Save failed:', errorData);
                setFormErrors([{ msg: errorData.error || 'Failed to save media record.' }]);
            }
        } catch (err) {
            console.error('Error submitting form', err);
            setFormErrors([{ msg: 'An unexpected error occurred. Please try again.' }]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMedia || isDeleting) return;
        setIsDeleting(true);
        console.log('Entered Delete')

        try {
            const res = await fetch(`/api/gallery/${selectedMedia.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setActionModalOpen(false);
                setMediaModalOpen(false);
                // Remove from media list
                setMedia((prev) => prev.filter(item => item.id !== selectedMedia.id));
                // Remove from selected items if it was selected
                setSelectedMediaIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(selectedMedia.id);
                    return newSet;
                });
            } else {
                setIsDeleting(false);
            }
        } catch (error) {
            console.error('Delete error:', error);
            setIsDeleting(false);
        }
    };

    const handleEdit = () => {
      setActionModalOpen(false);
      setEditModalOpen(true);
    }

    // Handle checkbox selection
    const handleSelectMedia = (mediaId: number) => {
        setSelectedMediaIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(mediaId)) {
                newSet.delete(mediaId);
            } else {
                newSet.add(mediaId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedMediaIds.size === filteredAndSortedMedia.length) {
            setSelectedMediaIds(new Set());
        } else {
            setSelectedMediaIds(new Set(filteredAndSortedMedia.map(item => item.id)));
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedMediaIds.size === 0 || isBulkDeleting) return;
        
        if (!confirm(`Are you sure you want to delete ${selectedMediaIds.size} media item(s)?`)) {
            return;
        }

        setIsBulkDeleting(true);
        const idsToDelete = Array.from(selectedMediaIds);
        
        try {
            // Delete all selected items in parallel
            const deletePromises = idsToDelete.map(id => 
                fetch(`/api/gallery/${id}`, {
                    method: "DELETE",
                })
            );

            const results = await Promise.all(deletePromises);
            const successful = results.filter(res => res.ok);
            
            if (successful.length === idsToDelete.length) {
                // Remove deleted items from state
                setMedia(prev => prev.filter(item => !selectedMediaIds.has(item.id)));
                setSelectedMediaIds(new Set());
            } else {
                console.error('Some deletions failed');
                // Still remove successfully deleted items
                const failedIds = new Set(
                    idsToDelete.filter((_, index) => !results[index].ok)
                );
                setMedia(prev => prev.filter(item => !selectedMediaIds.has(item.id) || failedIds.has(item.id)));
                setSelectedMediaIds(failedIds);
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    // Filter and sort media
    const filteredAndSortedMedia = useMemo(() => {
        let filtered = media;
        
        // Filter by search query
        if (searchQuery.trim()) {
            filtered = media.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Sort media
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                // Sort by date (newest first)
                // Handle both Date objects and date strings
                const dateA = a.date instanceof Date ? a.date : new Date(a.date);
                const dateB = b.date instanceof Date ? b.date : new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            }
        });
        
        return sorted;
    }, [media, searchQuery, sortBy]);

    // Clear selections for items that are no longer in the filtered results
    useEffect(() => {
        const visibleIds = new Set(filteredAndSortedMedia.map(item => item.id));
        setSelectedMediaIds(prev => {
            const newSet = new Set<number>();
            prev.forEach(id => {
                if (visibleIds.has(id)) {
                    newSet.add(id);
                }
            });
            return newSet;
        });
    }, [filteredAndSortedMedia]);

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
                                onClick={() => {
                                    setAddModalEnabled(false);
                                    resetForm();
                                }}
                                className="rounded-md py-2 text-sm font-semibold text-red-600 hover:text-red-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)]"
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
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
                        onClick={() => {
                            setDate(getTodayDateString());
                            setAddModalEnabled(true);
                        }}
                        type="button"
                        className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                    >
                        Add Media
                    </button>
                    </div>
                </div>

                {/* Search and Sort Controls */}
                {media.length > 0 && (
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1">
                            <label htmlFor="search" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                                Search by Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-[var(--muted)]" />
                                </div>
                                <input
                                    id="search"
                                    name="search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search media..."
                                    className="block w-full pl-10 pr-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--muted)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Sort Dropdown */}
                        <div className="sm:w-48">
                            <label htmlFor="sort" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                                Sort By
                            </label>
                            <select
                                id="sort"
                                name="sort"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                                className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                            >
                                <option value="date">Date (Newest First)</option>
                                <option value="name">Name (A-Z)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Bulk Actions Bar */}
                {selectedMediaIds.size > 0 && (
                    <div className="mb-4 flex items-center justify-between rounded-md bg-[var(--card-bg)] p-4 border border-[var(--border)]">
                        <span className="text-sm font-medium text-[var(--foreground)]">
                            {selectedMediaIds.size} item{selectedMediaIds.size !== 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isBulkDeleting ? 'Deleting...' : `Delete ${selectedMediaIds.size} item${selectedMediaIds.size !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                )}

                {media.length > 0 ? (
                    <>
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-[var(--border)]">
                                        <thead className="bg-[var(--card-bg)]">
                                            <tr>
                                                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                                        checked={filteredAndSortedMedia.length > 0 && selectedMediaIds.size === filteredAndSortedMedia.length}
                                                        onChange={handleSelectAll}
                                                        aria-label="Select all media"
                                                    />
                                                </th>
                                                <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-[var(--foreground)]">
                                                    Preview
                                                </th>
                                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                                            {filteredAndSortedMedia.length > 0 ? (
                                                filteredAndSortedMedia.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="transition-colors duration-150"
                                                >
                                                    <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                                            checked={selectedMediaIds.has(item.id)}
                                                            onChange={() => handleSelectMedia(item.id)}
                                                            aria-label={`Select ${item.name}`}
                                                        />
                                                    </td>
                                                    <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6">
                                                        <div className="flex items-center gap-3">
                                                            {item.mediaType.startsWith("video/") ? (
                                                                <VideoCameraIcon className="w-5 h-5 text-[var(--muted)]" />
                                                            ) : (
                                                                <PhotoIcon className="w-5 h-5 text-[var(--muted)]" />
                                                            )}
                                                            <span>{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                                        {formatShortDate(item.date)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                                        {item.mediaType.startsWith("video/") ? "Video" : "Image"}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] text-center">
                                                        <button
                                                            onClick={() => openMediaModal(item)}
                                                            className="text-[var(--primary)] bg-[var(--card-bg)] hover:text-[var(--background)] hover:bg-[var(--primary)] cursor-pointer rounded-full ring-1 ring-[var(--border)] py-1 px-3"
                                                        >
                                                            Preview<span className="sr-only">, {item.name}</span>
                                                        </button>
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMedia(item);
                                                                setActionModalOpen(true);
                                                            }}
                                                            className="text-[var(--primary)] bg-[var(--card-bg)] hover:text-[var(--background)] hover:bg-[var(--primary)] cursor-pointer rounded-full ring-1 ring-[var(--border)] py-1 px-3"
                                                        >
                                                            <EllipsisVerticalIcon className="w-5 h-5" />
                                                            <span className="sr-only">Actions, {item.name}</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--muted)]">
                                                        No media found matching your search.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
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
                                                            {formatShortDate(selectedMedia.date)}
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
                                disabled={isDeleting}
                                className={`text-sm w-full text-left ${isDeleting ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:underline'}`}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
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