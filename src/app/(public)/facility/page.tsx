import Gallery from "@/components/UI/Gallery/page"
import { facilityFeatures } from "@/public/files/features"
import { Metadata } from 'next';
import Image from 'next/image';

const photos = [
    {id: 1, href: '/facility/sgi_136.jpg', alt: 'Gymnastics Facility'},
    {id: 2, href: '/facility/sgi_112.jpg', alt: 'Gymnastics Facility'},
    {id: 3, href: '/facility/sgi_091.jpg', alt: 'Gymnastics Facility'},
    {id: 4, href: '/facility/sgi_145.jpg', alt: 'Gymnastics Facility'},
    {id: 5, href: '/facility/sgi_143.jpg', alt: 'Gymnastics Facility'},
]

export const metadata: Metadata = {
  title: 'Facility',
};

export default function Facility() {
return (
      <div className="bg-white">
        {/* Facility */}
        <div className="overflow-hidden bg-white py-20 sm:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                  <div className="lg:ml-auto lg:pl-4 lg:pt-4">
                    <div className="lg:max-w-lg">
                        <h2 className="text-base/7 font-semibold text-magenta-600">Train Safer</h2>
                        <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                          A State of the Art Facility
                        </p>
                        <p className="mt-6 text-lg/8 text-gray-600">
                        Our facility is a cutting-edge training center designed to inspire athletes of all levels, from beginners to elite competitors. The gym is well-lit, air-conditioned and equipped with the latest in gymnastics apparatus, including Olympic-standard equipment for vault, bars, beam, floor and trampoline.
                        </p>
                        <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                        {facilityFeatures.map((feature) => (
                            <div key={feature.name} className="relative pl-9">
                            <dt className="inline font-semibold text-gray-900">
                                <feature.icon aria-hidden="true" className="absolute left-1 top-1 size-5 text-magenta-600" />
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
                        alt="Gymnastics Facility"
                        src="/facility/sgi_136.jpg"
                        width={2432}
                        height={1442}
                        className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                    />
                  </div>
              </div>
            </div>
        </div>

        {/* Gallery */}
        <Gallery photos={photos}/>

    </div>
)}