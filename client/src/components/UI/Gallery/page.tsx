type Media = {
    id: string,
    name: string,
    description: string,
    date: Date,
    mediaUrl: string
}

export default function Gallery({ media }: { media: Media[] | [] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-10 gap-5">

            {/* Gallery Item */}
            <div className="bg-[var(--card-bg)] rounded-md">
                Test
            </div>

        </div>
    )
}