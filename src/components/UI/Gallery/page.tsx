"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useState } from "react";

interface Photo {
  id: number;
  href: string;
}

interface GalleryProps {
  photos: Photo[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // Open modal with selected photo
  const openPhoto = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsOpen(false);
    setCurrentIndex(null);
  };

  // Navigate to previous photo
  const previousPhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing modal
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex - 1 + photos.length) % photos.length);
    }
  };

  // Navigate to next photo
  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing modal
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex + 1) % photos.length);
    }
  };

  return (
    <>
      {/* Gallery */}
        <div className="grid grid-cols-2 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-7 max-w-[1400px] mx-auto">
        {photos.map((photo, index) => (
            <div
            key={photo.id}
            className="relative group cursor-pointer"
            onClick={() => openPhoto(index)}
            >
            {/* Photo */}
            <Image
                className="object-cover object-center w-full h-40 max-w-full rounded-lg"
                src={photo.href}
                alt={`gallery-photo-${photo.id}`}
                width={300}
                height={150}
            />
            {/* Black Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 rounded-lg group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
        ))}
        </div>

      {/* Fullscreen Modal */}
      {isOpen && currentIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={closeModal}
        >
          <div
            className="relative max-w-4xl max-h-[80vh] bg-white rounded-lg"
            onClick={(e) => e.stopPropagation()} // Prevent close on inner click
          >
            <XMarkIcon
              className="absolute top-3 right-3 text-white bg-black bg-opacity-50 rounded-full p-1 h-7 w-auto hover:bg-opacity-70 cursor-pointer"
              onClick={closeModal}
              aria-label="Close Fullscreen"
            />
            <Image
              src={photos[currentIndex].href}
              alt={`fullscreen-photo-${photos[currentIndex].id}`}
              className="object-contain w-full h-full rounded-lg"
              width={1920}
              height={1080}
            />
          </div>

          {/* Left Arrow */}
          <ChevronLeftIcon
            className="absolute lg:left-7 left-3 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-1 h-9 w-auto hover:bg-opacity-70 cursor-pointer"
            onClick={previousPhoto} // Arrow click won't close the modal
            aria-label="Previous Photo"
          />

          {/* Right Arrow */}
          <ChevronRightIcon
            className="absolute lg:right-7 right-3 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-1 h-9 w-auto hover:bg-opacity-70 cursor-pointer"
            onClick={nextPhoto} // Arrow click won't close the modal
            aria-label="Next Photo"
          />
        </div>
      )}
    </>
  );
}
