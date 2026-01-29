'use client'

import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Athlete } from './page';

const sortOptions = [
  { name: 'Level' },
  { name: 'Graduation Year' },
]

const sortOrder = ['National Senior', 'National Junior', 'National Novice', 'National Open', '10', '9', '8', 'Aspire 2', 'Aspire 1', '7', '6', '5', '4', '3', '2', '1']

export default function ProspectCards({athletes}: {athletes: Athlete[]}) {

    const [prospects, setProspects] = useState<Athlete[]>(() => {
        return [...athletes].sort((a, b) => {
            if ('Level' === 'Level') {
                return sortOrder.indexOf(a.level || '') - sortOrder.indexOf(b.level || '');
            }
            return 0;
        });
    });
    const [sort, setSort] = useState<'Level' | 'Graduation Year'>('Level');

    useEffect(() => {
        setProspects(
            [...athletes].sort((a, b) => {
                if (sort === 'Level') {
                    return sortOrder.indexOf(a.level || '') - sortOrder.indexOf(b.level || '');
                } else if (sort === 'Graduation Year') {
                    if (a.graduationYear === b.graduationYear) {
                        return sortOrder.indexOf(a.level || '') - sortOrder.indexOf(b.level || '');
                    }
                    return a.graduationYear && b.graduationYear ? a.graduationYear - b.graduationYear : 0;
                }
                return 0;
            })
        );
    }, [athletes, sort]);

  return (
    <>
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

            </div>
        </section>

        {/* Athlete Grid */}
        <section aria-labelledby="prospects-heading" className="mt-8">
            <h2 id="prospects-heading" className="sr-only">
                Prospects
            </h2>

            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {prospects.map((athlete) => (
                <a key={athlete.id} href={`/prospects/${athlete.id}`} className="group">
                    <Image
                        alt={athlete.name}
                        src={athlete.imageSrc || '/logos/default-profile.png'}
                        width={1000}
                        height={1000}
                        className={`aspect-square w-full rounded-lg object-cover group-hover:opacity-75 sm:aspect-[2/3] ${!athlete.imageSrc ? 'grayscale' : ''}`}
                    />
                    <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                        <h3>{athlete.name}</h3>
                        <p>{athlete.graduationYear}</p>
                    </div>
                    <p className="mt-1 text-sm italic text-gray-500">{isNaN(Number(athlete.level)) ? athlete.level : `Level ${athlete.level}`}</p>
                </a>
                ))}
            </div>
        </section>
    </>
  )
}
