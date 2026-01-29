import ProgramLayout from "@/components/Layout/Public/ProgramLayout/page";
import { getCompetitivePrograms } from "@/lib/actions";
import { Program } from "@/lib/types";
import { CompetitiveFeatures } from "@/public/files/features";
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";


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
                                    Shenderey Gymnastics is well known for it&apos;s high-performance training environment focused on developing gymnasts to excel at national and international levels. These programs emphasize technical skill mastery, strength, flexibility, and artistry while fostering mental resilience and discipline.
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

            {/* Tryout CTA */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-28">
                <div className="relative overflow-hidden rounded-2xl bg-[var(--primary)]/5 px-8 py-16 sm:px-16 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <SparklesIcon className="mx-auto h-12 w-12 text-[var(--primary)]" aria-hidden="true" />
                        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                            Ready to take the next step?
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Tryouts are your chance to join our competitive stream and train with coaches who have shaped national and international athletes. Whether you&apos;re new to competitive gymnastics or looking to level up, we&apos;ll help you discover your potential.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/tryouts"
                                className="rounded-md bg-[var(--primary)] px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                            >
                                Sign up for tryouts
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}