import Gallery from "@/components/UI/Gallery/page";
import { contactDetails } from "@/public/files/contactDetails";
import { facilityFeatures } from "@/public/files/features";
import { BuildingOffice2Icon, ClockIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
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

        {/* Contact */}
      <div className="overflow-hidden bg-white mt-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">

            {/* Text Section */}
            <div className="lg:mr-auto lg:pr-4 lg:pt-4">
              <div className="lg:max-w-lg">
                <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  Get in touch
                </p>
                <p className="mt-6 text-lg/8 text-gray-600">
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Address</span>
                      <BuildingOffice2Icon aria-hidden="true" className="h-7 w-6 text-[var(--primary)]" />
                    </dt>
                    <dd>
                      {contactDetails.street} <br />
                      {contactDetails.city}, {contactDetails.region} {contactDetails.postal}
                    </dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Telephone</span>
                      <PhoneIcon aria-hidden="true" className="h-7 w-6 text-[var(--primary)]" />
                    </dt>
                    <dd>
                      <a href="tel:+1 (555) 234-5678" className="hover:text-gray-900">
                        {contactDetails.telephone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Email</span>
                      <EnvelopeIcon aria-hidden="true" className="h-7 w-6 text-[var(--primary)]" />
                    </dt>
                    <dd>
                      <a href="mailto:shendereygymnastics@gmail.com" className="hover:text-gray-900">
                      {contactDetails.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Email</span>
                      <ClockIcon aria-hidden="true" className="h-7 w-6 text-[var(--primary)]" />
                    </dt>
                    <dd>
                      {contactDetails.officeHours.map((hours) => (
                        <div key={hours.day}>
                          {hours.day}: {hours.time} <br />
                        </div>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Map Section */}
            <div className="lg:pl-8 lg:inset-0 lg:left-1/2"> 
              <iframe
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0 
              h-64 sm:h-80 md:h-96 lg:h-[500px] min-h-[16rem] sm:min-h-[20rem] md:min-h-[25rem]"
              width="100%"
              height="100%"
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2867.333038384778!2d-79.4301737232174!3d44.05583117108584
                  !2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f80!3m3!1m2!1s0x882ad27e9e07fc4f%3A0x242cef020575425b!2sShenderey%20Gymnastics%20Centre
                  !5e0!3m2!1sen!2sca!4v1735844155049!5m2!1sen!2sca"
              loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
)}