'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface CarouselImage {
    id: number;
    imageUrl: string;
    title: string | null;
    slot: string | null;
}

interface SessionCarouselProps {
    images: CarouselImage[];
    title: string;
}

const INTERVAL_MS = 10000;
const TICK_MS = 50;

export default function SessionCarousel({ images, title }: SessionCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const canAutoPlay = !paused && images.length > 1;

    useEffect(() => {
        if (!canAutoPlay) {
            setProgress(0);
            return;
        }

        let elapsed = 0;
        let advanced = false;
        setProgress(0);

        const tick = setInterval(() => {
            elapsed += TICK_MS;
            setProgress(Math.min((elapsed / INTERVAL_MS) * 100, 100));

            if (elapsed >= INTERVAL_MS && !advanced) {
                advanced = true;
                setCurrentIndex(prev => (prev + 1) % images.length);
            }
        }, TICK_MS);

        return () => clearInterval(tick);
    }, [currentIndex, canAutoPlay, images.length]);

    const goTo = useCallback((index: number) => {
        setPaused(true);
        setProgress(0);
        setCurrentIndex(index);
    }, []);

    const goNext = useCallback(() => {
        goTo((currentIndex + 1) % images.length);
    }, [currentIndex, images.length, goTo]);

    const goPrev = useCallback(() => {
        goTo((currentIndex - 1 + images.length) % images.length);
    }, [currentIndex, images.length, goTo]);

    if (images.length === 0) return null;

    const current = images[currentIndex];
    const isPdf = current.imageUrl.split('?')[0].toLowerCase().endsWith('.pdf');

    // Circular SVG progress ring
    const radius = 13;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="mt-10">
            {/* Section title */}
            <div className="mx-auto max-w-2xl lg:mx-0">
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
            </div>

            <div className="mt-6 relative max-w-4xl mx-auto">
                {/* Progress ring – top right, only when auto-playing */}
                {canAutoPlay && (
                    <div className="absolute top-3 right-3 z-20 pointer-events-none">
                        <svg width="34" height="34" viewBox="0 0 34 34">
                            {/* Background circle */}
                            <circle
                                cx="17" cy="17" r={radius}
                                fill="rgba(0,0,0,0.35)"
                                stroke="rgba(255,255,255,0.25)"
                                strokeWidth="2"
                            />
                            {/* Progress arc */}
                            <circle
                                cx="17" cy="17" r={radius}
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform="rotate(-90 17 17)"
                                style={{ transition: `stroke-dashoffset ${TICK_MS}ms linear` }}
                            />
                        </svg>
                    </div>
                )}

                {/* Slide content */}
                <div className="relative overflow-hidden rounded-lg border border-[var(--border)] h-[500px]">
                    {isPdf ? (
                        <iframe
                            src={current.imageUrl}
                            title={current.title || 'Schedule'}
                            className="w-full h-full"
                            loading="lazy"
                        />
                    ) : (
                        <Image
                            src={current.imageUrl}
                            alt={current.title || 'Schedule'}
                            fill
                            className="object-contain"
                            loading="lazy"
                            quality={85}
                        />
                    )}

                    {/* Prev / Next buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goPrev}
                                aria-label="Previous slide"
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white text-2xl leading-none transition-colors select-none"
                            >
                                ‹
                            </button>
                            <button
                                onClick={goNext}
                                aria-label="Next slide"
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white text-2xl leading-none transition-colors select-none"
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>

                {/* Slide title */}
                {current.title && (
                    <p className="mt-2 text-sm text-gray-500 text-center">{current.title}</p>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    i === currentIndex
                                        ? 'bg-[var(--primary)]'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
