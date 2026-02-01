import Link from 'next/link'

type AnnouncementData = {
    id: number;
    message: string;
    linkUrl: string | null;
    isActive: boolean | null;
}

export default function AnnouncementBanner({ announcement }: { announcement: AnnouncementData }) {
    const content = (
        <div className="flex items-center justify-center gap-2 px-4">
            <p className="text-sm font-medium text-white truncate">{announcement.message}</p>
            {announcement.linkUrl && (
                <span className="text-sm font-medium text-white/80 whitespace-nowrap">Learn more &rarr;</span>
            )}
        </div>
    )

    return (
        <div className="fixed top-0 w-full z-[60] bg-[var(--primary)] py-2.5">
            {announcement.linkUrl ? (
                <Link href={announcement.linkUrl} className="block hover:opacity-90 transition-opacity">
                    {content}
                </Link>
            ) : (
                content
            )}
        </div>
    )
}
