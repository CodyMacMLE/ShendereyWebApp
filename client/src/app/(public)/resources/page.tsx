import { getResources } from "@/lib/actions";
import { Resource } from "@/lib/types";
import { Metadata } from "next";
import StackedList from "./StackedList";

export const metadata: Metadata = {
    title: 'Resources',
};

export default async function Resources() {

    const resourcesData = await getResources();
    const resources: Resource[] = resourcesData.map((data: any) => ({
        id: data.id,
        name: data.name,
        size: data.size,
        views: data.views,
        createdAt: data.createdAt,
        resourceUrl: data.resourceUrl,
    }));

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