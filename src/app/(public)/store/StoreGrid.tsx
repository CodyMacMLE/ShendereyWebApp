'use client'

import Image from "next/image";
import { useMemo, useState } from "react";

type Product = {
    id: number;
    name: string | null;
    category: string | null;
    sizes: string | null;
    description: string | null;
    price: number | null;
    productImgUrl: string | null;
};

export default function StoreGrid({ products }: { products: Product[] }) {
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const categories = ["Apparel", "Accessories", "Grips & Wrist Bands", "Other"];

    // Filter and search products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (filterCategory !== 'All') {
            filtered = filtered.filter(product => product.category === filterCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [products, filterCategory, searchQuery]);

    return (
        <div>
            {/* Filter and Search Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center">
                {/* Category Filter Buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                    <button
                        onClick={() => setFilterCategory('All')}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                            filterCategory === 'All'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                filterCategory === cat
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="sm:w-64">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="block w-full px-4 py-2 rounded-full bg-gray-100 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                    />
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group rounded-lg shadow divide-y divide-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Product Image */}
                            <div className="relative aspect-square w-full bg-gray-100">
                                {product.productImgUrl ? (
                                    <Image
                                        src={product.productImgUrl}
                                        alt={product.name || 'Product'}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-5">
                                {/* Category Badge */}
                                {product.category && (
                                    <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 mb-2">
                                        {product.category}
                                    </span>
                                )}

                                {/* Name */}
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {product.name}
                                </h3>

                                {/* Price */}
                                {product.price != null && (
                                    <p className="mt-1 text-lg font-bold text-[var(--primary)]">
                                        ${product.price.toFixed(2)}
                                    </p>
                                )}

                                {/* Description */}
                                {product.description && (
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                        {product.description}
                                    </p>
                                )}

                                {/* Sizes */}
                                {product.sizes && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Sizes: {product.sizes}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    No products found.
                </div>
            )}
        </div>
    );
}
