type Media = {
    id: string,
    name: string,
    description: string,
    date: Date,
    mediaUrl: string
    mediaType: string
    thumbnailUrl: string
}

export default function Gallery({ media }: { media: Media[] | [] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((colIndex) => (
                <div key={colIndex} className="grid gap-4">
                {media
                    .filter((_, i) => i % 4 === colIndex)
                    .map((item) => (
                    <div key={item.id}>
                        {item.mediaType.startsWith("video/") ? (
                        <img
                            src="/video-thumbnail.png"
                            alt={`${item.name} (video)`}
                            className="h-auto max-w-full rounded-lg"
                        />
                        ) : (
                        <img
                            src={item.mediaUrl}
                            alt={item.name}
                            className="h-auto max-w-full rounded-lg"
                        />
                        )}
                    </div>
                    ))}
                </div>
            ))}
        </div>
    )
}