import { getGalleryMedia } from "@/lib/actions";
import { Metadata } from "next";
import PublicGallery from "./PublicGallery";


export const metadata: Metadata = {
    title: 'Gallery',
};

export default async function Gallery() {
    const galleryMedia = await getGalleryMedia();

    return (
        <div className="bg-white">
            {/* Gallery Title */}
            <div className="overflow-hidden bg-white py-20 sm:py-20">
                <div className="mx-auto w-full px-6 lg:px-8">
                    <div className="text-5xl font-extrabold text-right">Discover Our World</div>
                </div>
            </div>

            {/* Gallery Images */}
            <PublicGallery galleryMedia={galleryMedia} />
        </div>
    )
}