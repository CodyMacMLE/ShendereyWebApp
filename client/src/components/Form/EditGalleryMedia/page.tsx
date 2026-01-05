'use client';

import React, { useState, useEffect } from 'react';

import ErrorModal from '@/components/UI/ErrorModal/page';

type Media = {
    id: number,
    name: string,
    description: string,
    date: Date,
    mediaType: string,
    mediaUrl: string,
    videoThumbnail: string
}

export function EditGalleryMedia({ media, closeModal, onSuccess }: {
    media: Media,
    closeModal?: () => void,
    onSuccess: (updated: Media) => void
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');

    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log(media)
        if (media) {
            setName(media.name || '');
            setDescription(media.description || '');
            setDate(media.date ? new Date(media.date).toISOString().split('T')[0] : '');
        }
    }, [media]);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const errors: { msg: string }[] = [];

        if (!name.trim()) errors.push({ msg: 'Name is required.' });
        description.trim();
        if (!date) errors.push({ msg: 'Date is required.' });

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('date', date);

            const res = await fetch(`/api/gallery/${media.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (res.ok) {
                const updatedMedia: Media = {
                    ...media,
                    name,
                    description,
                    date: new Date(date),
                };
                onSuccess(updatedMedia);
                if (closeModal) closeModal();
            } else {
                console.error('Upload failed.', await res.json());
            }
        } catch (err) {
            console.error('Error submitting form', err);
        } finally {
            setIsSubmitting(false);
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

                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                    type="button"
                    onClick={() => { closeModal?.(); }}
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
    );
}