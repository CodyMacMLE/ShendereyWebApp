"use client"

import { Dispatch, SetStateAction, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({
    children,
    title,
    setModalEnable,
}: Readonly<{
    children: React.ReactNode;
    title: string;
    setModalEnable: Dispatch<SetStateAction<boolean>>;
}>) {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-2 md:p-20 lg:p-40">
            {/* Background overlay */}
            <div 
              className="absolute inset-0 bg-black opacity-60"
              onClick={() => setModalEnable(false)}
            />

            {/* Modal shell */}
            <div
              className="relative bg-[var(--card-bg)] rounded-lg overflow-hidden ring-1 ring-[var(--border)] z-50
                         max-h-[calc(100vh-20px)] w-full max-w-[2000px]"
              style={{ scrollbarGutter: 'stable both-edges' }}
            >
                {/* SCROLL AREA */}
                <div className="max-h-[calc(100vh-20px)] overflow-y-auto pr-[px]">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base/7 font-semibold text-[var(--foreground)]">{title}</h2>
                            <XMarkIcon 
                                className="h-5 w-5 text-[var(--foreground)] hover:text-[var(--foreground-hover)] cursor-pointer"
                                onClick={() => setModalEnable(false)}
                            />
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}