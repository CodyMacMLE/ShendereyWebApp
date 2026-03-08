import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

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

function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

function parseFeatures(raw: string | null): Feature[] {
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export default function BirthdayPackages({ packages }: { packages: BirthdayPackage[] }) {
    if (packages.length === 0) return null;

    return (
        <div className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                <div className="mx-auto max-w-2xl lg:mx-0 mb-12">
                    <p className="text-base/7 font-semibold text-[var(--primary)]">Party Packages</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Choose Your Perfect Party</h2>
                </div>

                <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-y-8 sm:mt-4 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {packages.map((pkg, idx) => {
                        const features = parseFeatures(pkg.features);
                        const isPopular = pkg.isPopular ?? false;
                        const isFirst = idx === 0;
                        const isLast = idx === packages.length - 1;

                        return (
                            <div
                                key={pkg.id}
                                className={classNames(
                                    isPopular ? 'lg:z-10 lg:rounded-b-none ring-2 ring-[var(--primary)]' : 'ring-1 ring-gray-200 lg:mt-8',
                                    packages.length >= 3 && isFirst ? '-mr-px lg:rounded-r-none' : '',
                                    packages.length >= 3 && isLast ? '-ml-px lg:rounded-l-none' : '',
                                    'flex flex-col justify-between rounded-3xl bg-white p-8 xl:p-10',
                                )}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-x-4">
                                        <h3
                                            className={classNames(
                                                isPopular ? 'text-[var(--primary)]' : 'text-gray-900',
                                                'text-lg/8 font-semibold',
                                            )}
                                        >
                                            {pkg.name}
                                        </h3>
                                        {isPopular && (
                                            <p className="rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs/5 font-semibold text-[var(--primary)]">
                                                Most popular
                                            </p>
                                        )}
                                    </div>

                                    {pkg.description && (
                                        <p className="mt-4 text-sm/6 text-gray-600">{pkg.description}</p>
                                    )}

                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className="text-4xl font-semibold tracking-tight text-gray-900">
                                            ${pkg.price != null ? pkg.price.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'}
                                        </span>
                                    </p>

                                    {features.length > 0 && (
                                        <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-600">
                                            {features.map((feature, i) => (
                                                <li key={i} className="flex gap-x-3">
                                                    {feature.included ? (
                                                        <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-[var(--primary)]" />
                                                    ) : (
                                                        <XMarkIcon aria-hidden="true" className="h-6 w-5 flex-none text-gray-400" />
                                                    )}
                                                    <span className={feature.included ? '' : 'text-gray-400'}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <Link
                                    href={`#event-form?tab=birthday&package=${encodeURIComponent(pkg.name ?? '')}`}
                                    className={classNames(
                                        isPopular
                                            ? 'bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-hover)]'
                                            : 'text-[var(--primary)] ring-1 ring-inset ring-[var(--primary)]/30 hover:ring-[var(--primary)]/50',
                                        'mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
                                    )}
                                >
                                    Book Now
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
