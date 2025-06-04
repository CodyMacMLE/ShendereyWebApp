'use client'

import React, { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-auto-scroll'
import './carousel.css'

export default function EmblaCarousel({ images }: { images: { url: string, alt: string, href: string }[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ stopOnMouseEnter: true , stopOnInteraction: false})])

  useEffect(() => {
    if (emblaApi) {
      console.log(emblaApi.slideNodes()) // Access API
    }
  }, [emblaApi])

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {images.map((image, index) => (
          <div className="embla__slide" key={index}>
            <a href={image.href} target="_blank" rel="noopener noreferrer">
              <img className="embla__slide__img" src={image.url} alt={image.alt} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
