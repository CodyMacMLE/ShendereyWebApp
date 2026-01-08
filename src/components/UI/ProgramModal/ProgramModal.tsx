'use client'

import { useState } from 'react';
import Image from 'next/image';
import { CursorArrowRaysIcon } from '@heroicons/react/20/solid';

// Define a type for the program
interface Program {
    name: string;
    imageUrl: string | null;
    length: string;
    ages: string;
    description: string;
}

// Define a type for the props
interface ProgramModalProps {
    programs: Program[];
    CallToAction: string;
    CallToActionHref: string;
}

export default function ProgramModal({ programs, CallToAction, CallToActionHref }: ProgramModalProps) { // Use the props type

    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null); // Modal state
    const [hoveredProgram, setHoveredProgram] = useState<string | null>(null); // Store the name of the hovered program

    const openModal = (program: Program) => {
        setSelectedProgram(program);
    };

    const closeModal = () => {
        setSelectedProgram(null);
    };

    return (
        <>
            {/* Program List */}
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-10">
                {programs.map((program) => (
                    <li
                        key={program.name}
                        className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow hover:shadow-xl hover:ring-1 hover:ring-gray-300"
                        onMouseEnter={() => setHoveredProgram(program.name)}
                        onMouseLeave={() => setHoveredProgram(null)}
                    >
                        <div className="flex flex-1 flex-col p-8 cursor-pointer" onClick={() => openModal(program)}>
                            <Image alt="" src={program.imageUrl || '/default-profile.png'} className="mx-auto size-32 shrink-0 rounded-full" height={300} width={300} style={{ objectFit: 'cover'}}/>
                            <h3 className="mt-6 text-sm font-medium text-gray-900">{program.name}</h3>
                            <dl className="mt-1 flex grow flex-col justify-between">
                                <dt className="sr-only">Title</dt>
                                <dd className="text-sm text-gray-500">{program.length}</dd>
                                <dt className="sr-only">Role</dt>
                                <dd className="mt-3">
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        {hoveredProgram === program.name ? 'Click for More Info' : program.ages}
                                    </span>
                                </dd>
                            </dl>
                        </div>
                        <div>
                            <div className="-mt-px flex divide-x divide-gray-200">
                                <div className="flex w-0 flex-1 hover:bg-magenta-500 rounded-b-lg">
                                    <a
                                        href={CallToActionHref}
                                        className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 group"
                                    >
                                        <CursorArrowRaysIcon 
                                            aria-hidden="true" 
                                            className="size-5 text-gray-400 group-hover:text-white" 
                                        />
                                        <span className="group-hover:text-white">{CallToAction}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal */}
            {selectedProgram && (
                <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                onClick={closeModal} // Close modal on overlay click
                >
                <div
                    className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
                >
                    <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    onClick={closeModal}
                    >
                    &times;
                    </button>
                    <h2 className="text-lg font-semibold">{selectedProgram.name}</h2>
                    <p className="mt-4 text-sm text-gray-700">{selectedProgram.length}</p>
                    <p className="mt-2 text-sm text-gray-700">{selectedProgram.ages}</p>
                    <p className="mt-2 text-sm text-gray-700">{selectedProgram.description}</p>
                </div>
                </div>
            )}
        </>
    )
}