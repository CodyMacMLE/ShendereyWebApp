import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Gallery',
};

const images = [
    {
        src: "/images/sgi_001.jpg",
        alt: "Gallery Image 1",
        title: "Gallery Image 1",
    },
    {
        src: "/images/sgi_003.png",
        alt: "Gallery Image 2",
        title: "Gallery Image 2",
    }, 
    {
        src: "/images/sgi_006.webp",
        alt: "Gallery Image 3",
        title: "Gallery Image 3",
    },
    {
        src: "/images/sgi_095.jpg",
        alt: "Gallery Image 4",
        title: "Gallery Image 4",
    },
    {
        src: "/images/sgi_143.jpg",
        alt: "Gallery Image 5",
        title: "Gallery Image 5",
    },
    {
        src: "/images/Shenderey_2024-2025.jpg",
        alt: "Gallery Image 6",
        title: "Gallery Image 6",
    },
]


export default async function Gallery() {

    return (
        <div className="bg-white">
        {/* Gallery Title */}
        <div className="overflow-hidden bg-white py-20 sm:py-20">
            <div className="mx-auto w-full px-6 lg:px-8">
                <div className="text-5xl font-extrabold text-right">Discover Our World</div>
            </div>
        </div>

        {/* Gallery Images */}
        <div className="mx-auto w-full px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-x-0 gap-y-0 sm:grid-cols-2 lg:grid-cols-4">
                {images.map((image) => (
                    <div className="group relative">
                        <a href={image.src} target="_blank" rel="noopener noreferrer">
                            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden group-hover:opacity-75 cursor-pointer">
                                <img src={image.src} alt={image.alt} className="object-cover object-center" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    </div>
    )
}