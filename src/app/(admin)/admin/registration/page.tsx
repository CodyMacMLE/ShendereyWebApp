"use client"

import ErrorModal from "@/components/UI/ErrorModal/page";
import Modal from "@/components/UI/Modal/page";
import { TrashIcon } from "@heroicons/react/24/outline";
import imageCompression from 'browser-image-compression';
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Policy {
    id?: number;
    policy: string;
    order: number;
}

interface RegistrationImage {
    id: number;
    imageUrl: string | null;
    title: string | null;
    slot: string | null;
}

interface PendingUpload {
    file: File;
    preview: string | null; // null for PDFs
    title: string;
}

// ─── Image Card ──────────────────────────────────────────────────────────────

function ImageCard({
    img,
    onDelete,
    isDeleting,
}: {
    img: RegistrationImage;
    onDelete: (id: number) => void;
    isDeleting: boolean;
}) {
    const isPdf = img.imageUrl?.split('?')[0].toLowerCase().endsWith('.pdf');

    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
            {isPdf ? (
                <div className="flex items-center justify-center h-40 bg-red-50">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        <p className="mt-1 text-xs font-medium text-red-600">PDF</p>
                    </div>
                </div>
            ) : (
                <Image
                    src={img.imageUrl!}
                    alt={img.title || 'Schedule'}
                    width={400}
                    height={280}
                    className="w-full h-40 object-cover"
                />
            )}
            <div className="p-3 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[var(--foreground)] truncate flex-1">
                    {img.title || 'Untitled'}
                </p>
                <button
                    onClick={() => onDelete(img.id)}
                    disabled={isDeleting}
                    title="Delete"
                    className="flex-shrink-0 p-1.5 rounded-md bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting
                        ? <span className="block w-4 h-4 text-center text-xs leading-4">…</span>
                        : <TrashIcon className="w-4 h-4" />
                    }
                </button>
            </div>
        </div>
    );
}

// ─── PDF icon helper ──────────────────────────────────────────────────────────

function PdfIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Registration() {

    // ── Page data ──
    const [isLoading, setIsLoading] = useState(true);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [enabledStates, setEnabledStates] = useState<{ [key: number]: boolean }>({});
    const [deletingStates, setDeletingStates] = useState<{ [key: number]: boolean }>({});

    // ── Images ──
    const [sessionImages, setSessionImages] = useState<RegistrationImage[]>([]);
    const [campImages, setCampImages] = useState<RegistrationImage[]>([]);
    const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

    // ── Upload modal ──
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadCategory, setUploadCategory] = useState<'session' | 'camp' | null>(null);
    const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const placeholderSession = `Fall ${new Date().getFullYear()}`;

    // ── Click-outside handler for policy delete confirmations ──
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.confirm-delete-button')) {
                setEnabledStates(prev => {
                    const updated = { ...prev };
                    for (const key in updated) updated[key] = false;
                    return updated;
                });
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // ── Fetch data on mount ──
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [policiesRes, imagesRes] = await Promise.all([
                    fetch('/api/register/policies'),
                    fetch('/api/register/session-image'),
                ]);

                const policiesData = await policiesRes.json();
                setPolicies(policiesData.success ? (policiesData.body || []) : []);

                const imageData = await imagesRes.json();
                if (imageData.success && imageData.body) {
                    const sessions: RegistrationImage[] = [];
                    const camps: RegistrationImage[] = [];
                    for (const img of imageData.body as RegistrationImage[]) {
                        if (!img.imageUrl) continue;
                        if (img.slot === 'session' || img.slot === 'current' || img.slot === 'next') {
                            sessions.push(img);
                        } else if (img.slot === 'camp') {
                            camps.push(img);
                        }
                    }
                    setSessionImages(sessions);
                    setCampImages(camps);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setPolicies([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── File selection (multi) ──
    const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newUploads: PendingUpload[] = [];
        for (const file of files) {
            if (file.size > 100 * 1024 * 1024) {
                setFormErrors([{ msg: `"${file.name}" exceeds 100 MB limit` }]);
                continue;
            }

            let processedFile = file;
            if (file.type.startsWith('image/')) {
                try {
                    processedFile = await imageCompression(file, {
                        maxSizeMB: 0.8,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true,
                    });
                } catch (err) {
                    console.error("Compression error:", err);
                }
            }

            const preview = file.type.startsWith('image/') ? URL.createObjectURL(processedFile) : null;
            const titleFromFilename = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
            newUploads.push({ file: processedFile, preview, title: titleFromFilename });
        }

        setPendingUploads(prev => [...prev, ...newUploads]);
        setFormErrors([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePendingUpload = (index: number) => {
        setPendingUploads(prev => {
            const next = [...prev];
            if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
            next.splice(index, 1);
            return next;
        });
    };

    const updatePendingTitle = (index: number, title: string) => {
        setPendingUploads(prev => {
            const next = [...prev];
            next[index] = { ...next[index], title };
            return next;
        });
    };

    // ── Upload all pending files ──
    const handleUploadAll = async () => {
        if (pendingUploads.length === 0) {
            setFormErrors([{ msg: 'Please select at least one file' }]);
            return;
        }

        const emptyIdx = pendingUploads.findIndex(u => !u.title.trim());
        if (emptyIdx !== -1) {
            setFormErrors([{ msg: `Please enter a title for file ${emptyIdx + 1}` }]);
            return;
        }

        try {
            setIsUploading(true);
            setFormErrors([]);

            const slot = uploadCategory === 'session' ? 'session' : 'camp';
            const uploaded: RegistrationImage[] = [];

            for (let i = 0; i < pendingUploads.length; i++) {
                setUploadProgress({ current: i + 1, total: pendingUploads.length });
                const { file, title } = pendingUploads[i];

                const formData = new FormData();
                formData.append('image', file);
                formData.append('title', title.trim());
                formData.append('slot', slot);

                const res = await fetch('/api/register/session-image', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success) {
                    uploaded.push(data.body);
                } else {
                    setFormErrors([{ msg: `Failed to upload "${title}": ${data.error || 'Unknown error'}` }]);
                    setIsUploading(false);
                    setUploadProgress(null);
                    return;
                }
            }

            if (uploadCategory === 'session') {
                setSessionImages(prev => [...prev, ...uploaded]);
            } else {
                setCampImages(prev => [...prev, ...uploaded]);
            }

            closeUploadModal();
            setMessage({ type: 'success', text: `${uploaded.length} file${uploaded.length !== 1 ? 's' : ''} uploaded successfully!` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Upload error:", error);
            setFormErrors([{ msg: 'Error uploading files. Please try again.' }]);
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const closeUploadModal = () => {
        pendingUploads.forEach(u => { if (u.preview) URL.revokeObjectURL(u.preview); });
        setPendingUploads([]);
        setUploadModalOpen(false);
        setUploadCategory(null);
        setFormErrors([]);
    };

    // ── Delete image by ID ──
    const handleDeleteImage = async (id: number) => {
        try {
            setDeletingImageId(id);
            const res = await fetch('/api/register/session-image', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();

            if (data.success) {
                setSessionImages(prev => prev.filter(img => img.id !== id));
                setCampImages(prev => prev.filter(img => img.id !== id));
                setMessage({ type: 'success', text: 'Image removed successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to remove image' });
                setTimeout(() => setMessage(null), 5000);
            }
        } catch (error) {
            console.error("Delete error:", error);
            setMessage({ type: 'error', text: 'Error removing image. Please try again.' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setDeletingImageId(null);
        }
    };

    // ── Policy handlers ──
    const handlePolicyChange = (index: number, value: string) => {
        const updated = [...policies];
        updated[index] = { ...updated[index], policy: value };
        setPolicies(updated);
    };

    const handleAddPolicy = () => {
        setPolicies([...policies, { policy: "", order: policies.length }]);
    };

    const toggleEnabled = (index: number) => {
        setEnabledStates(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleDeletePolicy = async (index: number) => {
        setDeletingStates(prev => ({ ...prev, [index]: true }));
        setTimeout(() => {
            const updated = policies.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i }));
            setPolicies(updated);
            setDeletingStates(prev => { const n = { ...prev }; delete n[index]; return n; });
            setEnabledStates(prev => { const n = { ...prev }; delete n[index]; return n; });
        }, 100);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const validPolicies = policies
                .map((p, i) => ({ ...p, order: i }))
                .filter(p => p.policy.trim() !== "");

            const res = await fetch('/api/register/policies', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ policies: validPolicies }),
            });
            const data = await res.json();

            if (data.success) {
                setPolicies(data.body || []);
                setMessage({ type: 'success', text: 'Policies saved successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Error saving policies: ' + (data.error || 'Unknown error') });
                setTimeout(() => setMessage(null), 5000);
            }
        } catch (error) {
            console.error("Error saving policies:", error);
            setMessage({ type: 'error', text: 'Error saving policies. Please try again.' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-0">

            {/* Page header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-[var(--foreground)]">Schedule Images</h1>
                    <p className="text-sm text-[var(--muted)] mt-2">
                        Upload images or PDFs for the registration page. Each category has its own carousel on the public site.
                    </p>
                </div>
            </div>

            {/* Status message */}
            {message && (
                <div className={`mt-4 rounded-md p-4 ${
                    message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">Loading...</div>
            ) : (
                <>
                    {/* ══════════ Rec Sessions ══════════ */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-semibold text-[var(--foreground)]">Rec Sessions</h2>
                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                    {sessionImages.length} image{sessionImages.length !== 1 ? 's' : ''} — shown as a carousel on the register page
                                </p>
                            </div>
                            <button
                                onClick={() => { setUploadCategory('session'); setUploadModalOpen(true); }}
                                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)]"
                            >
                                + Add Session Images
                            </button>
                        </div>

                        {sessionImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {sessionImages.map(img => (
                                    <ImageCard
                                        key={img.id}
                                        img={img}
                                        onDelete={handleDeleteImage}
                                        isDeleting={deletingImageId === img.id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border-2 border-dashed border-[var(--border)] p-10 text-center">
                                <p className="text-sm text-[var(--muted)]">No session images uploaded yet</p>
                                <button
                                    onClick={() => { setUploadCategory('session'); setUploadModalOpen(true); }}
                                    className="mt-3 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                                >
                                    Upload your first session image →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ══════════ Camps ══════════ */}
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-semibold text-[var(--foreground)]">Camps</h2>
                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                    {campImages.length} image{campImages.length !== 1 ? 's' : ''} — only shown on register page when at least one image is uploaded
                                </p>
                            </div>
                            <button
                                onClick={() => { setUploadCategory('camp'); setUploadModalOpen(true); }}
                                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)]"
                            >
                                + Add Camp Images
                            </button>
                        </div>

                        {campImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {campImages.map(img => (
                                    <ImageCard
                                        key={img.id}
                                        img={img}
                                        onDelete={handleDeleteImage}
                                        isDeleting={deletingImageId === img.id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border-2 border-dashed border-[var(--border)] p-10 text-center">
                                <p className="text-sm text-[var(--muted)]">No camp images uploaded yet</p>
                                <button
                                    onClick={() => { setUploadCategory('camp'); setUploadModalOpen(true); }}
                                    className="mt-3 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                                >
                                    Upload your first camp image →
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ══════════ Upload Modal ══════════ */}
            {uploadModalOpen && uploadCategory && (
                <Modal
                    title={`Add ${uploadCategory === 'session' ? 'Rec Session' : 'Camp'} Images`}
                    setModalEnable={closeUploadModal}
                >
                    <div>
                        {formErrors.length > 0 && (
                            <div className="mb-4"><ErrorModal errors={formErrors} /></div>
                        )}

                        {/* Drop zone / file picker */}
                        <div className="mb-5">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                className="hidden"
                                id="multi-file-input"
                                onChange={handleFilesSelected}
                            />
                            <label
                                htmlFor="multi-file-input"
                                className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-[var(--border)] cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--background)] transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--muted)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                <p className="text-sm text-[var(--muted)]">
                                    Click to select files — <span className="text-[var(--primary)] font-medium">multiple allowed</span>
                                </p>
                                <p className="text-xs text-[var(--muted)] mt-1">Images or PDFs · max 100 MB each</p>
                            </label>
                        </div>

                        {/* Pending uploads list */}
                        {pendingUploads.length > 0 && (
                            <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                                {pendingUploads.map((upload, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                                    >
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0 w-14 h-14 rounded-md border border-[var(--border)] overflow-hidden bg-[var(--card-bg)] flex items-center justify-center">
                                            {upload.preview ? (
                                                <Image
                                                    src={upload.preview}
                                                    alt="Preview"
                                                    width={56}
                                                    height={56}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="bg-red-50 w-full h-full flex items-center justify-center">
                                                    <PdfIcon />
                                                </div>
                                            )}
                                        </div>

                                        {/* Title input */}
                                        <input
                                            type="text"
                                            value={upload.title}
                                            onChange={e => updatePendingTitle(index, e.target.value)}
                                            placeholder={placeholderSession}
                                            className="flex-1 min-w-0 text-sm rounded-md border-0 py-1.5 px-3 text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--border)] focus:ring-2 focus:ring-inset focus:ring-[var(--primary)] bg-[var(--card-bg)]"
                                        />

                                        {/* Remove from list */}
                                        <button
                                            type="button"
                                            onClick={() => removePendingUpload(index)}
                                            disabled={isUploading}
                                            className="flex-shrink-0 p-1.5 rounded-md text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload progress */}
                        {uploadProgress && (
                            <p className="text-sm text-center text-[var(--muted)] mb-4">
                                Uploading {uploadProgress.current} of {uploadProgress.total}…
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-x-4 pt-1">
                            <button
                                type="button"
                                onClick={closeUploadModal}
                                disabled={isUploading}
                                className="rounded-md py-2 text-sm font-semibold text-red-600 hover:text-red-500 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUploadAll}
                                disabled={isUploading || pendingUploads.length === 0}
                                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading
                                    ? `Uploading${uploadProgress ? ` ${uploadProgress.current}/${uploadProgress.total}` : '…'}`
                                    : pendingUploads.length > 0
                                        ? `Upload ${pendingUploads.length} File${pendingUploads.length !== 1 ? 's' : ''}`
                                        : 'Upload'
                                }
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ══════════ Registration Policies ══════════ */}
            <div className="sm:flex sm:items-center mt-10">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-[var(--foreground)]">Registration Policies</h1>
                    <p className="text-sm text-[var(--muted)] mt-2">Edit the registration policies for the gym.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">Loading...</div>
            ) : (
                <>
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <div className="overflow-visible shadow outline outline-1 outline-[var(--border)] sm:rounded-lg">
                                    <div className="overflow-hidden sm:rounded-lg">
                                        <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                                            <thead className="bg-[var(--card-bg)]">
                                                <tr>
                                                    <th scope="col" className="w-12 py-3.5 pl-4 pr-2 text-left text-sm font-semibold text-[var(--foreground)]">
                                                        Policy
                                                    </th>
                                                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-[var(--foreground)]">
                                                        Description
                                                    </th>
                                                    <th scope="col" className="w-16 py-3.5 pl-3 pr-4 text-right">
                                                        <span className="sr-only">Delete</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                                                {policies.length > 0 ? (
                                                    policies.map((policy, index) => (
                                                        <tr key={policy.id || `new-${index}`}>
                                                            <td className="w-12 whitespace-nowrap py-4 pl-4 pr-2 text-sm font-medium text-[var(--foreground)]">
                                                                {index + 1}.
                                                            </td>
                                                            <td className="py-4 px-3 text-sm text-[var(--foreground)]">
                                                                <input
                                                                    type="text"
                                                                    value={policy.policy}
                                                                    onChange={e => handlePolicyChange(index, e.target.value)}
                                                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                                                    placeholder="Enter policy description..."
                                                                />
                                                            </td>
                                                            <td className="w-16 whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                                                {(() => {
                                                                    const enabled = enabledStates[index] || false;
                                                                    const isDeleting = deletingStates[index] || false;
                                                                    return (
                                                                        <button
                                                                            onClick={() => {
                                                                                if (isDeleting) return;
                                                                                if (!enabled) toggleEnabled(index);
                                                                                else handleDeletePolicy(index);
                                                                            }}
                                                                            disabled={isDeleting}
                                                                            className={`confirm-delete-button relative inline-flex p-1 items-center justify-center rounded-full ${isDeleting ? 'bg-gray-400 cursor-not-allowed opacity-60' : enabled ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'hover:bg-red-600 cursor-pointer'}`}
                                                                        >
                                                                            <span className="relative w-[60px] h-[20px] flex items-center justify-center">
                                                                                {isDeleting ? (
                                                                                    <span className="text-xs text-white font-semibold">...</span>
                                                                                ) : (
                                                                                    <>
                                                                                        <span className={`absolute transition-opacity duration-150 text-xs text-white font-semibold ${enabled ? 'opacity-100' : 'opacity-0'}`}>
                                                                                            Confirm
                                                                                        </span>
                                                                                        <span className={`absolute transition-opacity duration-150 text-xs text-[var(--foreground)] font-semibold ${enabled ? 'opacity-0' : 'opacity-100'}`}>
                                                                                            <TrashIcon className="w-4 h-4" />
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-3 py-4 text-sm text-center text-[var(--muted)]">
                                                            No policies found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleAddPolicy}
                            className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                        >
                            + Add Another Policy
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
