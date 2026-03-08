'use client'

import BirthdayPackagesTable from '@/components/UI/Tables/BirthdayPackagesTable/page';
import { useEffect, useState } from 'react';

type BirthdayPackage = {
    id: number;
    name: string | null;
    price: number | null;
    description: string | null;
    features: string | null;
    isPopular: boolean | null;
    order: number | null;
};

export default function BirthdayPackagesPage() {
    const [packages, setPackages] = useState<BirthdayPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/birthday-packages');
                if (res.ok) {
                    const data = await res.json();
                    setPackages(data.body ?? []);
                }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    return (
        <BirthdayPackagesTable
            packages={packages}
            setPackages={setPackages}
            isLoading={isLoading}
        />
    );
}
