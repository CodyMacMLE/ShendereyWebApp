"use client";

import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

interface GalleryMedia {
    id: string;
    name: string | null;
    mediaUrl: string | null;
    mediaType: string | null;
    videoThumbnail?: string | null;
}

interface PaginationInfo {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export default function PublicGallery({ 
    galleryMedia, 
    pagination 
}: { 
    galleryMedia: GalleryMedia[];
    pagination: PaginationInfo;
}) {
    const [media, setMedia] = useState<GalleryMedia[]>(galleryMedia ?? []);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<GalleryMedia | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        setMedia(galleryMedia ?? []);
    }, [galleryMedia]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newPage === 1) {
            params.delete('page');
        } else {
            params.set('page', newPage.toString());
        }
        router.push(`/gallery?${params.toString()}`);
        // Scroll to top of gallery
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const totalPages = pagination.totalPages;
        const currentPage = pagination.page;

        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage <= 3) {
                // Near the start
                pages.push(2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // In the middle
                pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    const openModal = (item: GalleryMedia) => {
        setSelectedMedia(item);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedMedia(null);
    };

    return (
        <div className="mx-auto w-full px-6 lg:px-8">
                {media.length > 0 ? (
                    <>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {media.map((item: GalleryMedia) => (
                            <div
                                key={item.id}
                                onClick={() => openModal(item)}
                                className="flex flex-col h-full group overflow-hidden bg-[var(--card-bg)] shadow hover:shadow-lg cursor-pointer hover:ring-1 hover:ring-[var(--border)]"
                            >
                                {/* Media Section */}
                                <div className="relative flex-grow">
                                    {item.mediaType?.startsWith("video/") ? (
                                        <Image
                                            key={`thumb-${item.id}`}
                                            src={item.videoThumbnail || ''}
                                            alt={item.name || 'Video thumbnail'}
                                            className="h-60 w-full object-cover transition duration-300 group-hover:brightness-75"
                                            width={1000}
                                            height={1000}
                                        />
                                    ) : (
                                        <Image
                                            key={`img-${item.id}`}
                                            src={item.mediaUrl || ''}
                                            alt={item.name || 'Gallery image'}
                                            className="h-60 w-full object-cover transition duration-300 group-hover:brightness-75"
                                            width={1000}
                                            height={1000}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-12 mb-8 flex items-center justify-center">
                            <nav className="flex items-center gap-2" aria-label="Pagination">
                                {/* Previous Button */}
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={!pagination.hasPreviousPage}
                                    className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                        pagination.hasPreviousPage
                                            ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                    }`}
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                    <span className="sr-only">Previous</span>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((pageNum, index) => {
                                        if (pageNum === '...') {
                                            return (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="px-3 py-2 text-sm text-gray-500"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }

                                        const pageNumber = pageNum as number;
                                        const isCurrentPage = pageNumber === pagination.page;

                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                                                    isCurrentPage
                                                        ? 'z-10 bg-[var(--primary)] text-white'
                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                                aria-current={isCurrentPage ? 'page' : undefined}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                        pagination.hasNextPage
                                            ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                    }`}
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    )}

                    {/* Results Count */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} items
                    </div>
        
                    <Transition show={modalOpen} as={Fragment}>
                        <Dialog as="div" className="relative z-50" onClose={closeModal}>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-black bg-opacity-50" />
                            </Transition.Child>
        
                            <div className="fixed inset-0 z-50 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4 text-center">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-[var(--background)] p-6 text-left align-middle shadow-xl transition-all flex gap-6">
                                            {/* Media */}
                                            {selectedMedia && (
                                                <>
                                                    <div className="w-full">
                                                        {selectedMedia.mediaType?.startsWith("video/") ? (
                                                            <video controls className="w-full h-auto rounded">
                                                                <source src={selectedMedia.mediaUrl || ''} type={selectedMedia.mediaType || ''} />
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        ) : (
                                                            <Image
                                                                src={selectedMedia.mediaUrl || ''}
                                                                alt={selectedMedia.name || 'Gallery image'}
                                                                className="w-full h-auto rounded"
                                                                width={1000}
                                                                height={1000}
                                                            />
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </>
                ) : (
                    <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No media items available.</div>
                )}
            </div>
    )
}
