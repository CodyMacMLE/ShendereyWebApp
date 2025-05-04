'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import imageCompression from 'browser-image-compression';

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

export default function AddUserMedia({ userId, athleteId, setAthleteMedia, setModalEnable }: { 
    userId: number, 
    athleteId: number, 
    setAthleteMedia?: Dispatch<SetStateAction<Media[]>>,
    setModalEnable?: Dispatch<SetStateAction<boolean>>, 
}) {



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

      const res = await fetch(`/api/users/${userId}/media/${athleteId}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (setModalEnable) setModalEnable(false);
        if (setAthleteMedia && data.body) setAthleteMedia(data.body);
      } else {
        console.error('Upload failed.', await res.json());
      }
    } catch (err) {
      console.error('Error submitting form', err);
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
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-10 sm:min-w-4xl">

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
                onClick={() => {setModalEnable? setModalEnable(false) : "" }}
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