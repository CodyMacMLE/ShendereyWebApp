'use client';

import imageCompression from 'browser-image-compression';
import { Dispatch, SetStateAction, useState } from 'react';

import Dropdown from '@/components/UI/Dropdown/page';
import ErrorModal from '@/components/UI/ErrorModal/page';

type Media = {
    id: string,
    name: string,
    description: string,
    date: Date,
    mediaUrl: string
    mediaType: string,
    videoThumbnail: string
}

const categories = [
    { id: 1, name: "Vault" },
    { id: 2, name: "Bars" },
    { id: 3, name: "Beam" },
    { id: 4, name: "Floor" },
    { id: 5, name: "Other" },
]

export default function AddUserMedia({ userId, athleteId, setAthleteMedia, setModalEnable }: { 
    userId: number, 
    athleteId: number, 
    setAthleteMedia?: Dispatch<SetStateAction<Media[]>>,
    setModalEnable?: Dispatch<SetStateAction<boolean>>, 
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState({ id: 1, name: "Vault" });
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
            // Step 1: Upload the media item
            const presignedRes = await fetch(`/api/users/${userId}/media/${athleteId}/upload-url`, {
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
                                            const thumbnailPresignedRes = await fetch(`/api/users/${userId}/media/${athleteId}/upload-url?prefix=athlete/media/thumbnails/`, {
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
            const saveRes = await fetch(`/api/users/${userId}/media/${athleteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                    category: category.name,
                    date,
                    mediaType: mediaFile?.type,
                    mediaUrl,
                    videoThumbnail,
                }),
            });

            if (saveRes.ok) {
                const contentType = saveRes.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await saveRes.json();
                    if (setModalEnable) setModalEnable(false);
                    if (setAthleteMedia && data.body) setAthleteMedia(data.body);
                } else {
                    console.error('Unexpected response type:', contentType);
                    setFormErrors([{ msg: 'Server returned an unexpected response format.' }]);
                }
            } else {
                const contentType = saveRes.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await saveRes.json();
                    console.error('Save failed:', errorData);
                    setFormErrors([{ msg: errorData.error || 'Failed to save media record.' }]);
                } else {
                    console.error('Save failed with non-JSON response');
                    setFormErrors([{ msg: 'Failed to save media record.' }]);
                }
            }
        } catch (err) {
        console.error('Error submitting form', err);
        setFormErrors([{ msg: 'An unexpected error occurred. Please try again.' }]);
        }
    };

    return (
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
                                        placeholder="Marilyn Hayes 2025 - Vault 1"
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

                        {/* Category */}
                        <div className="sm:col-span-4">
                            <label htmlFor="media-category" className="block text-sm/6 font-medium text-[var(--foreground)]">Category</label>
                            <Dropdown items={categories} setSelected={setCategory} selected={category}/>
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
                                        placeholder="Scored a 9.450"
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
                    onClick={() => setModalEnable?.(false)}
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
    );
}