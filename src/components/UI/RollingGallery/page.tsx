'use client'

import Autoplay from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useEffect } from 'react'
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
              <Image className="embla__slide__img" src={image.url} alt={image.alt}
                width={1000}
                height={1000}
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
