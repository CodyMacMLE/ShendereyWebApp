import Image from "next/image"
import { Metadata } from 'next'
import { CheckIcon } from '@heroicons/react/24/outline'
import { CompetitiveFeatures } from "@/public/files/features";
import ProgramLayout from "@/components/Layout/Public/ProgramLayout/page";
import { getCompetitivePrograms } from "@/lib/actions";
import { Program } from "@/lib/types";


export const metadata: Metadata = {
    title: 'Competitive',
};

export default async function Competitive() {

    const programs = await getCompetitivePrograms();

    return (
        <div className="bg-white">

            {/* Header */}
            <div className="overflow-hidden bg-white py-20 sm:py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:ml-auto lg:pl-4 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <h2 className="text-base/7 font-semibold text-[var(--primary)]">Competitive</h2>
                                <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                    Pathway to Excellence
                                </p>
                                <p className="mt-6 text-lg/8 text-gray-600">
                                    Shenderey Gymnastics is well known for it's high-performance training environment focused on developing gymnasts to excel at national and international levels. These programs emphasize technical skill mastery, strength, flexibility, and artistry while fostering mental resilience and discipline.
                                </p>
                                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                                    {CompetitiveFeatures.map((feature) => (
                                        <div key={feature.name} className="relative pl-9">
                                            <dt className="inline font-semibold text-gray-900">
                                                <CheckIcon aria-hidden="true" className="absolute left-1 top-1 size-5 text-[var(--primary)]" />
                                                {feature.name}
                                            </dt>{' '}
                                            <dd className="inline">{feature.description}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </div>
                        <div className="flex items-start justify-end lg:order-first">
                            <Image
                                alt=""
                                src="/images/sgi_006.webp"
                                width={2000}
                                height={900}
                                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-2xl py-20 text-center">
                <h2 className="text-34l text-balance font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    Competitive Programs
                </h2>
            
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Programs */}
                <ProgramLayout programs={programs as unknown as Program[]} category="competitive" />
            </div>

        </div>
    )
}