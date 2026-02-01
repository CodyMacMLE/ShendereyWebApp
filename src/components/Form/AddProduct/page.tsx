'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import imageCompression from 'browser-image-compression';

import ErrorModal from '@/components/UI/ErrorModal/page';
import Dropdown from '@/components/UI/Dropdown/page';

type Product = {
    id: number;
    name: string | null;
    category: string | null;
    sizes: string | null;
    description: string | null;
    price: number | null;
    productImgUrl: string | null;
};

const productCategories = [
    { id: 1, name: "Apparel" },
    { id: 2, name: "Accessories" },
    { id: 3, name: "Grips & Wrist Bands" },
    { id: 4, name: "Other" },
];

export default function AddProduct({ setProducts, setModalEnable }: {
    setProducts: Dispatch<SetStateAction<Product[]>>,
    setModalEnable?: Dispatch<SetStateAction<boolean>>,
}) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState(productCategories[0]);
    const [price, setPrice] = useState('');
    const [sizes, setSizes] = useState('');
    const [description, setDescription] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        const errors: { msg: string }[] = [];

        if (!name.trim()) errors.push({ msg: 'Name is required.' });
        if (!category) errors.push({ msg: 'Category is required.' });
        if (!price.trim()) errors.push({ msg: 'Price is required.' });
        if (!mediaFile) errors.push({ msg: 'Image is required.' });

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category.name);
        formData.append('price', price);
        formData.append('sizes', sizes);
        formData.append('description', description);
        if (mediaFile) {
            formData.append('media', mediaFile);
        }

        const res = await fetch(`/api/store`, {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            setProducts((prevProducts) => [...prevProducts, data.body]);
            if (setModalEnable) setModalEnable(false);
        } else {
            const contentType = res.headers.get('content-type');
            let errorMessage = `Server error (${res.status}): ${res.statusText || 'Unknown error'}`;

            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await res.json();
                    if (errorData && errorData.error && typeof errorData.error === 'string') {
                        errorMessage = errorData.error;
                    } else if (!errorData || (typeof errorData === 'object' && Object.keys(errorData).length === 0)) {
                        errorMessage = `Server returned an empty response (${res.status})`;
                    } else if (errorData && typeof errorData === 'object') {
                        errorMessage = `Server error (${res.status}): ${JSON.stringify(errorData)}`;
                    }
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                }
            }

            console.error('Upload failed - Status:', res.status, 'StatusText:', res.statusText, 'Message:', errorMessage);
            setFormErrors([{ msg: errorMessage }]);
        }
        } catch (err) {
            console.error('Error submitting form', err);
            setFormErrors([{ msg: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.' }]);
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

                        {/* Name */}
                        <div className="sm:col-span-4">
                            <label htmlFor="product-name" className="block text-sm/6 font-medium text-[var(--foreground)]">Name</label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="product-name"
                                        name="product-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="SGI Team Hoodie"
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="sm:col-span-4">
                            <label htmlFor="product-category" className="block text-sm/6 font-medium text-[var(--foreground)]">Category</label>
                            <Dropdown items={productCategories} setSelected={setCategory} selected={category}/>
                        </div>

                        {/* Price */}
                        <div className="sm:col-span-2">
                            <label htmlFor="product-price" className="block text-sm/6 font-medium text-[var(--foreground)]">Price ($)</label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="product-price"
                                        name="product-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="49.99"
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sizes */}
                        <div className="sm:col-span-6">
                            <label htmlFor="product-sizes" className="block text-sm/6 font-medium text-[var(--foreground)]">Sizes</label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="product-sizes"
                                        name="product-sizes"
                                        type="text"
                                        value={sizes}
                                        onChange={(e) => setSizes(e.target.value)}
                                        placeholder="S, M, L, XL"
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-full">
                            <label htmlFor="product-description" className="block text-sm/6 font-medium text-[var(--foreground)]">Description</label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <textarea
                                        id="product-description"
                                        name="product-description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Premium quality team hoodie with embroidered SGI logo..."
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Media Input */}
                    <div className="col-span-full mt-6">
                        <label htmlFor="product-image" className="block text-sm/6 font-medium text-[var(--foreground)]">Product Image</label>
                        <div className="mt-2 flex items-center gap-x-3">
                            <input
                            type="file"
                            accept="image/*"
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
                                Choose File
                            </label>
                            {mediaFile && (
                                <p className="text-sm text-[var(--foreground)] mt-1">
                                    Selected file: <span className="font-medium">{mediaFile.name}</span>
                                </p>
                            )}
                        </div>
                        <p id="image-warning" className="text-[var(--muted)] text-sm mt-2">
                            Image only. 100MB max.
                        </p>
                    </div>

                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                    type="button"
                    onClick={() => {setModalEnable?.(false)}}
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
