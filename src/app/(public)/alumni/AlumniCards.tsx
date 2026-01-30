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
  { name: 'School' },
  { name: 'Graduation Year' },
]

export default function AlumniCards({athletes}: {athletes: Athlete[]}) {

    const [alumni, setAlumni] = useState<Athlete[]>(athletes);
    const [sort, setSort] = useState<'School' | 'Graduation Year'>('Graduation Year');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAlumni, setSelectedAlumni] = useState<Athlete | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        // Always sort the incoming athletes prop when it changes
        setAlumni(
            [...athletes].sort((a, b) => {
                if (sort === 'School') {
                    return a.school?.localeCompare(b.school || '') || 0;
                } else if (sort === 'Graduation Year') {
                    if (a.graduationYear === b.graduationYear) {
                        return a.school?.localeCompare(b.school || '') || 0;
                    }
                    return a.graduationYear && b.graduationYear ? b.graduationYear - a.graduationYear : 0;
                }
                return 0;
            })
        );
        setIsLoading(false);
    }, [athletes, sort]);

  const openModal = (athlete: Athlete) => {
    setSelectedAlumni(athlete);
    setModalOpen(true);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [modalOpen]);

  return (
    <>
        {modalOpen && selectedAlumni && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 bg-black opacity-75"
                    onClick={() => {
                        setModalOpen(false);
                        setSelectedAlumni(null);
                    }}
                />
                {/* Modal container - scrollable */}
                <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8 py-8 md:py-8">
                    {/* Modal shell */}
                    <div
                        className="relative bg-[var(--card-bg)] rounded-lg ring-1 ring-[var(--border)] z-50
                                 w-full max-w-5xl flex flex-col md:flex-row md:max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setModalOpen(false);
                                setSelectedAlumni(null);
                            }}
                            className="absolute top-4 right-4 z-50 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Image Section - Left */}
                        <div className="w-full md:w-1/2 flex-shrink-0 bg-black flex items-center justify-center aspect-[2/3] md:aspect-auto md:max-h-[90vh] rounded-t-lg md:rounded-l-lg md:rounded-tr-none overflow-hidden">
                            <Image
                                alt={selectedAlumni.name}
                                src={selectedAlumni.imageSrc || '/logos/sg_logo.png'}
                                width={600}
                                height={800}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/logos/sg_logo.png';
                                }}
                            />
                        </div>
                        {/* Content Section - Right (or below on mobile) */}
                        <div className="w-full md:w-1/2 flex flex-col p-6 overflow-y-auto md:max-h-[90vh]">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{selectedAlumni.name}</h3>
                                <p className="text-lg text-[var(--muted)]">
                                    {selectedAlumni.school || 'N/A'} • {selectedAlumni.graduationYear || 'N/A'}
                                </p>
                            </div>
                            {selectedAlumni.description && (
                                <div className="pt-6 border-t border-[var(--border)]">
                                    <h4 className="text-lg font-semibold text-[var(--foreground)] mb-4">About</h4>
                                    <p className="text-base text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">{selectedAlumni.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
        {/* Filters */}
        <section aria-labelledby="filter-heading" className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                            Sort by {sort === 'School' ? 'School' : 'Graduation Year'}
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
                                    onClick={() => setSort(option.name as 'School' | 'Graduation Year')}
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

        {isLoading ? (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        ) : (
            <section aria-labelledby="alumni-heading" className="mt-8">
                <h2 id="alumni-heading" className="sr-only">
                    Alumni
                </h2>

                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {alumni.map((athlete) => (
                    <button
                        key={athlete.id}
                        onClick={() => openModal(athlete)}
                        className="group text-left"
                    >
                        <Image
                            alt={athlete.name}
                            src={athlete.imageSrc || '/logos/sg_logo.png'}
                            width={800}
                            height={1000}
                            className="aspect-square w-full rounded-lg object-cover group-hover:opacity-75 sm:aspect-[2/3]"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/logos/sg_logo.png';
                            }}
                        />
                        <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                            <h3>{athlete.name}</h3>
                            <p>{athlete.graduationYear}</p>
                        </div>
                        <p className="mt-1 text-sm italic text-gray-500">{athlete.school}</p>
                    </button>
                    ))}
                </div>
            </section>
        )}
    </>
  )
}
