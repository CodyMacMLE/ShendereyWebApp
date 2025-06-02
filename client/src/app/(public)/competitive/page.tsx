import Image from "next/image"
import { Metadata } from 'next'
import { CheckIcon } from '@heroicons/react/24/outline'
import Program from "../../../components/Programs/Programs";


export const metadata: Metadata = {
    title: 'Competitive',
};

const features = [
    {
        name: 'Experienced Coaching.',
        description:
        'Led by coaches with extensive knowledge of elite-level gymnastics and NCAA recruiting processes.'
    },
    {
        name: 'Progressive Training Plans.',
        description: 
        'Tailored to individual athletes, with an emphasis on skill progression, routines, and competition preparation.'
    },
    {
        name: 'Holistic Development.',
        description:
        'Focus on injury prevention, nutrition, mental coaching, and balancing academics and athletics.'
    },
    {
        name: 'NCAA Preparation.',
        description:
        'Guidance on academic performance, recruitment, and compliance with NCAA eligibility standards.'
    }
]

interface Program {
    name: string;
    imageUrl: string | null;
    length: string;
    ages: string;
    description: string;
    href: string | undefined;
  }

const programs: Program[] = [
    {
        name: 'Pre-Competitive',
        imageUrl: '/sgi_007.jpeg',
        length: '3 - 4 Hours',
        ages: '5 - 8 years',
        description: 'These young female athletes aged 5 to 8 years of age that have shown a desire to learn the sport of gymnastics.  The program features a fun, safe, and caring environment and focuses on developing flexibility, strength, balance, endurance, and technical form. Gymnasts in SGI’s Pre-Competitive Program may progress into the Invitational, Provincial, or National Program.',
        href: '/competitive/precomp'
    },
    {
        name: 'Invitational',
        imageUrl: null,
        length: '3 - 4 Hours',
        ages: '8+ years',
        description: 'The invitational program is an alternate to the provincial program. In many other sports, athletes can start competing in games and tournaments very quickly after they begin. However, with gymnastics, this is not the reality. Athletes in gymnastics will train for several years before meeting the necessary requirements to be able to compete. The invitational program bridges the gap and allows gymnasts to start competing sooner, by modifying the skill requirements at the entry level.',
        href: '/competitive/invitational'
    },
    {
        name: 'Provincial',
        imageUrl: null,
        length: '3 - 5 Hours',
        ages: '8+ years',
        description: 'The provincial program is for dedicated athletes where skill acquisition and routine building are the main focus. Entry into this program is not for everyone. Specific coordination, strength, and dedication are required. The program focus is on the development of flexibility, strength, speed, endurance, basic skills, and form, as well as advanced skills and routine development for each of the four apparatus. Shenderey&apos;s goal is to develop each athlete to her fullest potential. This program will develop athletes for possible entry into the National Program.',
        href: '/competitive/provincial'
    },
    {
        name: 'National',
        imageUrl: null,
        length: '3 - 5 Hours',
        ages: '11+ years',
        description: 'The national program is for female athletes demonstrating the potential to become a top gymnast in Canada. It is within this stream that International and Olympic level athletes develop and go off on full scholarships to the U.S.A. The rules, skill requirements, and commitments required of the athlete, parents, and coaches are very demanding.',
        href: '/competitive/national'
    },
    // More programs here
]

export default function Competitive() {

    return (
        <div className="bg-white">

            {/* Header */}
            <div className="overflow-hidden bg-white py-20 sm:py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:ml-auto lg:pl-4 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <h2 className="text-base/7 font-semibold text-magenta-600">Competitive</h2>
                                <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                    Pathway to Excellence
                                </p>
                                <p className="mt-6 text-lg/8 text-gray-600">
                                    Shenderey Gymnastics is well known for it&apos;s high-performance training environment focused on developing gymnasts to excel at national and international levels. These programs emphasize technical skill mastery, strength, flexibility, and artistry while fostering mental resilience and discipline.
                                </p>
                                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                                    {features.map((feature) => (
                                        <div key={feature.name} className="relative pl-9">
                                            <dt className="inline font-semibold text-gray-900">
                                                <CheckIcon aria-hidden="true" className="absolute left-1 top-1 size-5 text-magenta-600" />
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
                                src="/sgi_006.webp"
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

            {/* Programs */}
             <Program programs={programs} CallToAction="Tryout" CallToActionHref="/tryouts" />

        </div>
    )
}