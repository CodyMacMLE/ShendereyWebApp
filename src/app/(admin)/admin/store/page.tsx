'use client'

import ProductTable from "@/components/UI/Tables/ProductTable/page";
import { useState, useEffect } from 'react';

type Product = {
    id: number;
    name: string | null;
    category: string | null;
    sizes: string | null;
    description: string | null;
    price: number | null;
    productImgUrl: string | null;
};

export default function Store() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadProducts = async () => {
            const data = await fetchProducts();
            setProducts(data);
            setIsLoading(false);
        };
        loadProducts();
    }, []);

    useEffect(() => {
    }, [products]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/store', {
                method: 'GET'
            })

            if (res.ok) {
                const parsedData = await res.json();
                return parsedData.body;
            }
        } catch (error) {
            return new Error('Error fetching products', error as Error);
        }
    }

    return (
        <ProductTable products={products} setProducts={setProducts} isLoading={isLoading} />
    )

}
