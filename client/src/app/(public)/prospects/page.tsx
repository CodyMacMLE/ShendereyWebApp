'use client'

import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';

const sortOptions = [
  { name: 'Level', href: '#' },
  { name: 'Graduation Year', href: '#' },
]

interface Athlete {
  id: number;
  name: string;
  href: string;
  level: string;
  graduationYear: number;
  imageSrc: string;
}

const prospectsData: Athlete[] = [
  {
    id: 1,
    name: 'John Doe',
    href: '#',
    level: '9',
    graduationYear: 2026,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-01-image-card-01.jpg',
  },
  {
    id: 2,
    name: 'Jane Doe',
    href: '#',
    level: 'National Senior',
    graduationYear: 2019,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-01-image-card-02.jpg',
  },
  {
    id: 3,
    name: 'John Smith',
    href: '#',
    level: '8',
    graduationYear: 2020,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-01-image-card-03.jpg',
  },
  {
    id: 7,
    name: 'Jane Smith',
    href: '#',
    level: '7',
    graduationYear: 2029,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-01-image-card-07.jpg',
  },
  {
    id: 8,
    name: 'John Doe',
    href: '#',
    level: '6',
    graduationYear: 2021,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-01-image-card-08.jpg',
  },
  {
    id: 9,
    name: 'Jane Doe',
    href: '#',
    level: '7',
    graduationYear: 2031,
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-01-image-card-09.jpg',
  },
]

export default function Prospects() {

    const [prospects, setProspects] = useState<Athlete[]>(prospectsData);
    const [sort, setSort] = useState<'Level' | 'Graduation Year'>('Level');

    useEffect(() => {
        sortProspects();
    }, []);

    useEffect(() => {
        sortProspects();
    }, [sort]);

    const sortProspects = () => {
        const sorted = [...prospects].sort((a, b) => {
            const sortOrder = ['National Senior', 'National Junior', 'National Novice', 'National Open', '10', '9', '8', 'Aspire 2', 'Aspire 1', '7', '6', '5', '4', '3', '2', '1']
            if (sort === 'Level') {
                return sortOrder.indexOf(a.level) - sortOrder.indexOf(b.level);
            } else if (sort === 'Graduation Year') {
                if (a.graduationYear === b.graduationYear) {
                    return sortOrder.indexOf(a.level) - sortOrder.indexOf(b.level);
                }
                // ascending
                return a.graduationYear - b.graduationYear;
            }
            return 0; // fallback
        });

        setProspects(sorted);
    }

  return (
    <div className="bg-white">
        <main>
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="py-24 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        NCAA Shenderey Prospects
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">
                        Putting the spotlight on our athletes.
                    </p>
                </div>

                {/* Filters */}
                <section aria-labelledby="filter-heading" className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                        <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                                Sort by {sort === 'Level' ? 'Level' : 'Graduation Year'}
                            <ChevronDownIcon
                                aria-hidden="true"
                                className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                            />
                            </MenuButton>
                        </div>

                        <MenuItems
                            transition
                            className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                            <div className="py-1">
                            {sortOptions.map((option) => (
                                <MenuItem key={option.name}>
                                    <div
                                        onClick={() => setSort(option.name as 'Level' | 'Graduation Year')}
                                        className="block px-4 py-2 text-sm font-medium text-gray-900 data-[focus]:bg-gray-100 data-[focus]:outline-none cursor-pointer"
                                    >
                                        {option.name}
                                    </div>
                                </MenuItem>
                            ))}
                            </div>
                        </MenuItems>
                        </Menu>

                        <button
                        type="button"
                        className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
                        >
                        Filters
                        </button>

                    </div>
                </section>

                {/* Product grid */}
                <section aria-labelledby="products-heading" className="mt-8">
                <h2 id="products-heading" className="sr-only">
                    Products
                </h2>

                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {prospects.map((athlete) => (
                    <a key={athlete.id} href={athlete.href} className="group">
                        <img
                            alt={athlete.name}
                            src={athlete.imageSrc}
                            className="aspect-square w-full rounded-lg object-cover group-hover:opacity-75 sm:aspect-[2/3]"
                        />
                        <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                            <h3>{athlete.name}</h3>
                            <p>{athlete.graduationYear}</p>
                        </div>
                        <p className="mt-1 text-sm italic text-gray-500">{athlete.level}</p>
                    </a>
                    ))}
                </div>
                </section>
            </div>
        </main>
    </div>
  )
}
