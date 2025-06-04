'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import imageCompression from 'browser-image-compression';

import ErrorModal from '@/components/UI/ErrorModal/page';
import Dropdown from '@/components/UI/Dropdown/page';

type Sponsor = {
    id: number;
    organization: string;
    description: string;
    sponsorLevel: string;
    sponsorImgUrl: string;
    website: string;
  };

const sponsorLevels = [
    { id: 1, name: "Diamond" },
    { id: 2, name: "Platinum" },
    { id: 3, name: "Gold" },
    { id: 4, name: "Silver" },
    { id: 5, name: "Affiliate" },
]

export default function AddSponsor({ setSponsors, setModalEnable }: { 
    setSponsors: Dispatch<SetStateAction<Sponsor[]>>,
    setModalEnable?: Dispatch<SetStateAction<boolean>>, 
}) {
    const [organization, setOrganization] = useState('');
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [sponsorLevel, setSponsorLevel] = useState(sponsorLevels[0]);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);

    const handleSubmit = async () => {
        const errors: { msg: string }[] = [];

        if (!organization.trim()) errors.push({ msg: 'Organization is required.' });
        if (!description.trim()) errors.push({ msg: 'Description is required.' });
        if (!sponsorLevel) errors.push({ msg: 'Sponsor level is required.' });
        if (!website.trim()) errors.push({ msg: 'Website is required.' });
        if (!mediaFile) errors.push({ msg: 'Media file is required.' });

        if (errors.length > 0) {
        setFormErrors(errors);
        return;
        }

        try {
        const formData = new FormData();
        formData.append('organization', organization);
        formData.append('description', description);
        formData.append('sponsorLevel', sponsorLevel.name);
        formData.append('website', website);
        if (mediaFile) {
            formData.append('media', mediaFile);
            formData.append('mediaType', mediaFile.type)
        }

        const res = await fetch(`/api/sponsors`, {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            setSponsors((prevSponsors) => [...prevSponsors, data.body]);
            if (setModalEnable) setModalEnable(false);
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
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12 sm:min-w-4xl">

                        {/* Organization */}
                        <div className="sm:col-span-4">
                            <label htmlFor="sponsor-organization" className="block text-sm/6 font-medium text-[var(--foreground)]">Organization</label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="organization"
                                        name="organization"
                                        type="text"
                                        value={organization}
                                        onChange={(e) => setOrganization(e.target.value)}
                                        placeholder="Shenderey Gymnastics Institute"
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sponsor Level */}
                        <div className="sm:col-span-4">
                            <label htmlFor="sponsor-sponsorLevel" className="block text-sm/6 font-medium text-[var(--foreground)]">Sponsor Level</label>
                            <Dropdown items={sponsorLevels} setSelected={setSponsorLevel} selected={sponsorLevel}/>
                        </div>

                        {/* Website */}
                        <div className="sm:col-span-4">
                            <label htmlFor="sponsor-website" className="block text-sm/6 font-medium text-[var(--foreground)]">Website</label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="website"
                                        name="website"
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="www.shendereygymnastics.ca"
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
                                        placeholder="Shenderey Gymnastics Insitute (SGI) is the longest running and most successful gymnastics program in Newmarket..."
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
    
                    </div>

                    {/* Media Input */}
                    <div className="col-span-full mt-6">
                        <label htmlFor="sponsor-logo" className="block text-sm/6 font-medium text-[var(--foreground)]">Logo</label>
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