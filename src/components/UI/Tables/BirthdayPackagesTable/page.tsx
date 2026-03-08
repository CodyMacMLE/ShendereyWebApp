"use client"

import { CheckIcon, PencilSquareIcon, TrashIcon, XMarkIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Dispatch, SetStateAction, useState } from 'react';

type Feature = {
    text: string;
    included: boolean;
};

type BirthdayPackage = {
    id: number;
    name: string | null;
    price: number | null;
    description: string | null;
    features: string | null;
    isPopular: boolean | null;
    order: number | null;
};

interface Props {
    packages: BirthdayPackage[];
    setPackages: Dispatch<SetStateAction<BirthdayPackage[]>>;
    isLoading?: boolean;
}

const emptyForm = {
    name: '',
    price: '',
    description: '',
    features: [] as Feature[],
    isPopular: false,
};

function parseFeatures(raw: string | null): Feature[] {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
}

// ─── Package Modal ─────────────────────────────────────────────────────────────

function PackageModal({
    title,
    initial,
    onSave,
    onClose,
    isSaving,
}: {
    title: string;
    initial: typeof emptyForm;
    onSave: (data: typeof emptyForm) => void;
    onClose: () => void;
    isSaving: boolean;
}) {
    const [form, setForm] = useState(initial);
    const [newFeatureText, setNewFeatureText] = useState('');

    const addFeature = () => {
        if (!newFeatureText.trim()) return;
        setForm(f => ({ ...f, features: [...f.features, { text: newFeatureText.trim(), included: true }] }));
        setNewFeatureText('');
    };

    const removeFeature = (i: number) => {
        setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
    };

    const toggleFeature = (i: number) => {
        setForm(f => ({
            ...f,
            features: f.features.map((feat, idx) => idx === i ? { ...feat, included: !feat.included } : feat),
        }));
    };

    const updateFeatureText = (i: number, text: string) => {
        setForm(f => ({
            ...f,
            features: f.features.map((feat, idx) => idx === i ? { ...feat, text } : feat),
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-[var(--card-bg)] rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
                    <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Package Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Bronze"
                            className="w-full rounded-md bg-[var(--background)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Price (CAD)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                placeholder="300"
                                className="w-full rounded-md bg-[var(--background)] border border-[var(--border)] pl-7 pr-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Description <span className="text-[var(--muted)] font-normal">(optional)</span></label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Brief description of this package..."
                            rows={2}
                            className="w-full rounded-md bg-[var(--background)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>

                    {/* Most Popular toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-[var(--foreground)]">Mark as Most Popular</label>
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, isPopular: !f.isPopular }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isPopular ? 'bg-[var(--primary)]' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isPopular ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Features</label>
                        <div className="space-y-2 mb-3">
                            {form.features.map((feat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleFeature(i)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${feat.included ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}
                                        title={feat.included ? 'Included — click to exclude' : 'Excluded — click to include'}
                                    >
                                        {feat.included
                                            ? <CheckIcon className="h-3.5 w-3.5" />
                                            : <XMarkIcon className="h-3.5 w-3.5" />
                                        }
                                    </button>
                                    <input
                                        type="text"
                                        value={feat.text}
                                        onChange={e => updateFeatureText(i, e.target.value)}
                                        className="flex-1 rounded-md bg-[var(--background)] border border-[var(--border)] px-2 py-1 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(i)}
                                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeatureText}
                                onChange={e => setNewFeatureText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                                placeholder="Add a feature..."
                                className="flex-1 rounded-md bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-1 rounded-md bg-[var(--primary)] text-white px-3 py-1.5 text-sm font-medium hover:bg-[var(--primary-hover)]"
                            >
                                <PlusIcon className="h-4 w-4" /> Add
                            </button>
                        </div>
                        <p className="mt-1.5 text-xs text-[var(--muted)]">Click the circle icon to toggle included/excluded.</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 pb-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={isSaving || !form.name.trim() || !form.price}
                        onClick={() => onSave(form)}
                        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Package'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BirthdayPackagesTable({ packages, setPackages, isLoading }: Props) {
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState<BirthdayPackage | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [reorderingId, setReorderingId] = useState<number | null>(null);

    const sorted = [...packages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const handleAdd = async (form: typeof emptyForm) => {
        setIsSaving(true);
        try {
            const maxOrder = packages.length > 0 ? Math.max(...packages.map(p => p.order ?? 0)) + 1 : 0;
            const res = await fetch('/api/birthday-packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    price: parseFloat(form.price),
                    description: form.description || null,
                    features: form.features,
                    isPopular: form.isPopular,
                    order: maxOrder,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setPackages(prev => [...prev, data.body]);
                setAddModal(false);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = async (form: typeof emptyForm) => {
        if (!selectedPkg) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/birthday-packages/${selectedPkg.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    price: parseFloat(form.price),
                    description: form.description || null,
                    features: form.features,
                    isPopular: form.isPopular,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setPackages(prev => prev.map(p => p.id === selectedPkg.id ? data.body : p));
                setEditModal(false);
                setSelectedPkg(null);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        setDeletingIds(prev => new Set(prev).add(id));
        try {
            const res = await fetch(`/api/birthday-packages/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setPackages(prev => prev.filter(p => p.id !== id));
                setConfirmDeleteId(null);
            }
        } finally {
            setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        }
    };

    const handleReorder = async (id: number, direction: 'up' | 'down') => {
        const idx = sorted.findIndex(p => p.id === id);
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === sorted.length - 1) return;

        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        const current = sorted[idx];
        const swap = sorted[swapIdx];

        const newOrderCurrent = swap.order ?? swapIdx;
        const newOrderSwap = current.order ?? idx;

        setReorderingId(id);
        try {
            const res = await fetch('/api/birthday-packages/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [
                    { id: current.id, order: newOrderCurrent },
                    { id: swap.id, order: newOrderSwap },
                ]}),
            });
            if (res.ok) {
                setPackages(prev => prev.map(p => {
                    if (p.id === current.id) return { ...p, order: newOrderCurrent };
                    if (p.id === swap.id) return { ...p, order: newOrderSwap };
                    return p;
                }));
            }
        } finally {
            setReorderingId(null);
        }
    };

    const openEdit = (pkg: BirthdayPackage) => {
        setSelectedPkg(pkg);
        setEditModal(true);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-[var(--foreground)]">Birthday Packages</h1>
                    <p className="mt-1 text-sm text-[var(--muted)]">Manage the party packages displayed on the public Birthday Parties page.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={() => setAddModal(true)}
                        className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
                    >
                        <PlusIcon className="h-4 w-4" /> Add Package
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-[var(--card-bg)] rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <div className="text-center py-16 bg-[var(--card-bg)] rounded-xl border border-dashed border-[var(--border)]">
                    <p className="text-sm text-[var(--muted)]">No packages yet. Click &ldquo;Add Package&rdquo; to create your first one.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sorted.map((pkg, idx) => {
                        const features = parseFeatures(pkg.features);
                        const isDeleting = deletingIds.has(pkg.id);
                        const isReordering = reorderingId === pkg.id;

                        return (
                            <div
                                key={pkg.id}
                                className="bg-[var(--card-bg)] rounded-lg border border-[var(--border)] p-4 shadow-sm"
                            >
                                <div className="flex items-start gap-4">

                                    {/* Reorder controls */}
                                    <div className="flex flex-col gap-1 flex-shrink-0 pt-0.5">
                                        <button
                                            onClick={() => handleReorder(pkg.id, 'up')}
                                            disabled={idx === 0 || isReordering}
                                            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Move up"
                                        >
                                            <ArrowUpIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleReorder(pkg.id, 'down')}
                                            disabled={idx === sorted.length - 1 || isReordering}
                                            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Move down"
                                        >
                                            <ArrowDownIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Package info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-[var(--foreground)]">{pkg.name}</span>
                                            <span className="text-sm font-semibold text-[var(--primary)]">
                                                ${pkg.price != null ? pkg.price.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'}
                                            </span>
                                            {pkg.isPopular && (
                                                <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                                                    Most popular
                                                </span>
                                            )}
                                        </div>
                                        {pkg.description && (
                                            <p className="mt-0.5 text-xs text-[var(--muted)] truncate max-w-md">{pkg.description}</p>
                                        )}
                                        {features.length > 0 && (
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                {features.filter(f => f.included).length} included / {features.filter(f => !f.included).length} excluded features
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => openEdit(pkg)}
                                            className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--primary)]"
                                            title="Edit"
                                        >
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </button>
                                        {confirmDeleteId === pkg.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleDelete(pkg.id)}
                                                    disabled={isDeleting}
                                                    className="confirm-delete-button rounded px-2 py-1 text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {isDeleting ? '...' : 'Confirm'}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="rounded px-2 py-1 text-xs font-medium border border-[var(--border)] text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDeleteId(pkg.id)}
                                                className="p-1.5 rounded text-[var(--muted)] hover:text-red-500"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Modal */}
            {addModal && (
                <PackageModal
                    title="Add Package"
                    initial={emptyForm}
                    onSave={handleAdd}
                    onClose={() => setAddModal(false)}
                    isSaving={isSaving}
                />
            )}

            {/* Edit Modal */}
            {editModal && selectedPkg && (
                <PackageModal
                    title="Edit Package"
                    initial={{
                        name: selectedPkg.name ?? '',
                        price: selectedPkg.price?.toString() ?? '',
                        description: selectedPkg.description ?? '',
                        features: parseFeatures(selectedPkg.features),
                        isPopular: selectedPkg.isPopular ?? false,
                    }}
                    onSave={handleEdit}
                    onClose={() => { setEditModal(false); setSelectedPkg(null); }}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}
