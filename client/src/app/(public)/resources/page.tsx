import { Metadata } from "next";
import StackedList from "./StackedList";

export const metadata: Metadata = {
    title: 'Resources',
};

export default function Resources() {

    const resources = [
        {
            id: 1,
            name: "AGM 2025",
            posted: "2025-06-06",
            size: "100KB",
            downloads: 100,
            link: "www.google.com"
        },
        {
            id: 2,
            name: "2025-2026 Parent Handbook",
            posted: "2025-04-28",
            size: "100KB",
            downloads: 100,
            link: "www.google.com"
        },
        {
            id: 3,
            name: "May 2025 Newsletter",
            posted: "2025-05-01",
            size: "100KB",
            downloads: 100,
            link: "www.google.com"
        },
    ]
    return (
        <div className="bg-white py-24 sm:py-32">
            {/* Header Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <p className="text-base/7 font-semibold text-[var(--primary)]">Get the help you need</p>
                    <h2 className="mt-2 text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">Resources</h2>
                    <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
                        Here you can find all the resources you need to know about Shenderey Gymnastics.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <StackedList resources={resources} />
        </div>
    );
}