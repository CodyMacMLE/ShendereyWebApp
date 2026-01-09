import Image from "next/image"
import { Metadata } from 'next'
import { CheckIcon } from '@heroicons/react/24/outline'
import { RecreationalFeatures } from "@/public/files/features";
import ProgramLayout from "@/components/Layout/Public/ProgramLayout/page";
import { getRecreationalPrograms } from "@/lib/actions";
import { Program } from "@/lib/types";


export const metadata: Metadata = {
    title: 'Recreational',
};

export default async function Recreational() {

    const programs = await getRecreationalPrograms();

    return (
        <div className="bg-white">

            {/* Header */}
            <div className="overflow-hidden bg-white py-20 sm:py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:ml-auto lg:pl-4 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <h2 className="text-base/7 font-semibold text-[var(--primary)]">Recreational</h2>
                                <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                    Fun Meets Progress
                                </p>
                                <p className="mt-6 text-lg/8 text-gray-600">
                                    Recreational gymnastics is a form of gymnastics focused on fun, fitness, and personal development rather than competition. It is designed for children, teens, and adults who are interested in learning gymnastics in a non-competitive environment.
                                </p>
                                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                                    {RecreationalFeatures.map((feature) => (
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
                                src="/images/sgi_003.png"
                                width={2000}
                                height={900}
                                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                                priority
                                quality={85}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-2xl py-20 text-center">
                <h2 className="text-34l text-balance font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    Recreational Programs
                </h2>
            
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Programs */}
                <ProgramLayout programs={programs as unknown as Program[]} category="recreational" />
            </div>

        </div>
    )
}