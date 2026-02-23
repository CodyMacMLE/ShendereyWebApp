import { getAllGalleryMedia } from "@/lib/actions";
import { getInstagramMedia } from "@/lib/instagram";
import { Metadata } from "next";
import PublicGallery from "./PublicGallery";


export const metadata: Metadata = {
    title: 'Gallery',
};

interface GalleryPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function Gallery({ searchParams }: GalleryPageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);
    const limit = 20;

    const [dbItems, igItems] = await Promise.all([
        getAllGalleryMedia(),
        getInstagramMedia(),
    ]);

    const normalizedIg = igItems.map(item => ({
        id: `ig_${item.id}`,
        name: item.caption ? item.caption.slice(0, 150) : null,
        mediaUrl: item.media_url,
        mediaType: item.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
        videoThumbnail: item.thumbnail_url ?? null,
        date: new Date(item.timestamp),
        source: 'instagram' as const,
        permalink: item.permalink,
    }));

    const merged = [...dbItems, ...normalizedIg].sort((a, b) => {
        const aDate = a.date ? new Date(a.date).getTime() : 0;
        const bDate = b.date ? new Date(b.date).getTime() : 0;
        return bDate - aDate;
    });

    const totalCount = merged.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const pageItems = merged.slice(offset, offset + limit);

    const pagination = {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };

    return (
        <div className="bg-white">
            {/* Gallery Title */}
            <div className="overflow-hidden bg-white py-20 sm:py-20">
                <div className="mx-auto w-full px-6 lg:px-8">
                    <div className="text-5xl font-extrabold text-right">Discover Our World</div>
                </div>
            </div>

            {/* Gallery Images */}
            <PublicGallery
                galleryMedia={pageItems}
                pagination={pagination}
            />
        </div>
    )
}
