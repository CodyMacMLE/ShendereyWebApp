import { EnvelopeOpenIcon, GlobeAltIcon, GlobeAmericasIcon, SparklesIcon, StarIcon } from '@heroicons/react/20/solid'
import { BuildingOffice2Icon, ClockIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

import { getJuniorStaff, getSeniorStaff, getSponsors } from '@/lib/actions'
import { contactDetails } from '@/public/files/contactDetails'
import { facilityFeatures } from '@/public/files/features'
import { HomeStats } from '@/public/files/stats'
import { featuredTestimonial, testimonials } from '@/public/files/testemonials'

import RollingGallery from '@/components/UI/RollingGallery/page'
import { formatName } from '@/lib/utils'

/* For changing programs */
const programs = [
  {
    name: 'Recreational',
    description: 'Our recreational classes not only teach the fun, fitness and fundamentals of gymnastics but also nurtures independence. Children are expected to participate in these classes without parental assistance. Each class will begin with a group warm up which may consist of several different classes of varying age and ability. The large group will then break into smaller groups directed by a coach.',
    icon: SparklesIcon,
    link: {
      text: 'Learn More',
      href: '/recreational'
    }
  },
  {
    name: 'Pre-Competitive',
    description: "These young female athletes aged 5 to 8 years of age that have shown a desire to learn the sport of gymnastics. The program features a fun, safe, and caring environment and focuses on developing flexibility, strength, balance, endurance, and technical form. Gymnasts in Shenderey’s Pre-Competitive Program may progress into the Invitational, Provincial, or National Program.",
    icon: StarIcon,
    link: {
      text: 'Learn More',
      href: '/competitive'
    }
  },
  {
    name: 'Invitational',
    description: 'The invitational program is an alternate to the provincial program. In many other sports, athletes can start competing in games and tournaments very quickly after they begin. However, with gymnastics, this is not the reality. Athletes in gymnastics will train for several years before meeting the necessary requirements to be able to compete. The invitational program bridges the gap and allows gymnasts to start competing sooner, by modifying the skill requirements at the entry level.',
    icon: EnvelopeOpenIcon,
    link: {
      text: 'Learn More',
      href: '/competitive'
    }
  },
  {
    name: 'Provincial',
    description: 'The provincial program is for dedicated athletes where skill acquisition and routine building are the main focus. Entry into this program is not for everyone. Specific coordination, strength, and dedication are required. The program focus is on the development of flexibility, strength, speed, endurance, basic skills, and form, as well as advanced skills and routine development for each of the four apparatus.',
    icon: GlobeAmericasIcon,
    link: {
      text: 'Learn More',
      href: '/competitive'
    }
  },
  {
    name: 'National',
    description: 'The national program is for female athletes demonstrating the potential to become a top gymnast in Canada. It is within this stream that International and Olympic level athletes develop and go off on full scholarships to the U.S.A. The rules, skill requirements, and commitments required of the athlete, parents, and coaches are very demanding.  ',
    icon: GlobeAltIcon,
    link: {
      text: 'Learn More',
      href: '/competitive'
    }
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default async function Home() {

  const [seniorStaff, juniorStaff, fetchedSponsors] = await Promise.all([
    getSeniorStaff(),
    getJuniorStaff(),
    getSponsors()
  ]);
  const sponsors = [...fetchedSponsors.diamondSponsors, ...fetchedSponsors.goldSponsors, ...fetchedSponsors.silverSponsors, ...fetchedSponsors.affiliates]

  return (
    <div className="bg-white">

      {/* Hero section */}
      <div className="relative bg-gray-900 shadow-hero mt-[50px]">
        {/* Decorative image and overlay */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <Image
            alt=""
            src="/images/sgi_095.jpg"
            className="size-full object-cover"
            width={1920}
            height={1080}
            priority
            quality={85}
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-70" />
        {/* Content of Hero Section */}
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-52 text-center sm:py-56 lg:px-0">
          <p className="mt-4 text-xl text-[var(--primary)]">Join the Legacy</p>
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">Become a Part of The Shenderey Family!</h1>
          <p className="mt-4 text-xl text-white">
            Spots fill fast! Register today to secure your place in a club where dreams take flight.
            Be part of the tradition. Join us and make your mark!
          </p>
          <div className="flex gap-5 mb-4">
            <a
              href="/register"
              className="mt-8 inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
            >
              Recreational
            </a>
            <a
              href="/competitive"
              className="mt-8 inline-block rounded-md border border-transparent bg-[var(--primary)] px-8 py-3 text-base font-medium text-white hover:bg-[var(--primary-hover)]"
            >
              Competitive
            </a>
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="relative isolate overflow-hidden bg-white py-24 sm:py-30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Programs</h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
            {programs.map((card) => (
              <div key={card.name} className="flex flex-col gap-y-4 rounded-xl bg-white p-6 ring-1 ring-inset ring-black/10 shadow-lg h-full">
                <card.icon aria-hidden="true" className="h-7 w-5 flex-none text-[var(--primary)]" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-[var(--primary)]">{card.name}</h3>
                  <p className="mt-2 text-black">{card.description}</p>
                </div>
                <a
                  href={card.link.href}
                  className="mt-4 inline-block self-start rounded-md border border-transparent bg-[var(--primary)] px-8 py-3 text-base font-medium text-white hover:bg-[var(--primary-hover)]"
                >
                  {card.link.text}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="relative isolate bg-white pb-32 pt-24 sm:pt-20">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] xl:ml-0 xl:mr-[calc(50%-12rem)]"
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base/7 font-semibold text-magenta-600">Testimonials</h2>
            <p className="mt-2 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              What our customers are saying
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm/6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
            <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1">
              <blockquote className="p-6 text-lg font-semibold tracking-tight text-gray-900 sm:p-12 sm:text-xl/8">
                <p>{`“${featuredTestimonial.body}”`}</p>
              </blockquote>
              <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap">
                <Image
                  alt=""
                  src={featuredTestimonial.author.imageUrl}
                  className="size-10 flex-none rounded-full bg-gray-50"
                  width={50}
                  height={50}
                  loading="lazy"
                />
                <div className="flex-auto">
                  <div className="font-semibold">{featuredTestimonial.author.name}</div>
                </div>
              </figcaption>
            </figure>
            {testimonials.map((columnGroup, columnGroupIdx) => (
              <div key={columnGroupIdx} className="space-y-8 xl:contents xl:space-y-0">
                {columnGroup.map((column, columnIdx) => (
                  <div key={columnIdx}
                    className={classNames(
                      (columnGroupIdx === 0 && columnIdx === 0) ||
                        (columnGroupIdx === testimonials.length - 1 && columnIdx === columnGroup.length - 1)
                        ? 'xl:row-span-2'
                        : 'xl:row-start-1',
                      'space-y-8',
                    )}
                  >
                    {column.map((testimonial) => (
                      <figure
                        key={testimonial.author.name}
                        className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
                      >
                        <blockquote className="text-gray-900">
                          <p>{`“${testimonial.body}”`}</p>
                        </blockquote>
                        <figcaption className="mt-6 flex items-center gap-x-4">
                          <Image alt="" src={testimonial.author.imageUrl} className="size-10 rounded-full bg-gray-50" width={50} height={50} loading="lazy"/>
                          <div>
                            <div className="font-semibold">{testimonial.author.name}</div>
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements / Stats */}
      <div className="bg-white py-20 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-balance text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                Our Achievements
              </h2>
              <p className="mt-4 text-lg/8 text-black">Looking back on what our athletes hard work has accomplished</p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {HomeStats.map((stat) => (
                <div key={stat.id} className="flex flex-col bg-gray-600/5 p-8">
                  <dt className="text-sm/6 font-semibold text-gray-600">{stat.name}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Staff Members */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-auto text-center">
            <h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Our Team
            </h2>
            <p className="mt-6 text-lg/8 text-gray-600 text-left">
              All Shenderey Gymnastics coaches are nationally certified. They are here to assist each gymnast to reach her maximum potential, and they recognize that each child is ultimately responsible for her own success,
              involvement, and progress. Our coaches are dedicated and passionate about providing top quality training in a technically sound and safe manner for all of our athletes.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
          >
            {seniorStaff.map((person) => (
              <li key={person.user.id}>
                <Image
                  alt=""
                  src={person.staffUrl || '/logos/sg_logo.png'}
                  className={`flex justify-center mx-auto size-24 rounded-full shadow-md ${!person.staffUrl ? '' : ''}`}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', objectPosition: 'top'}}
                  loading="lazy"
                />
                <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-gray-900">{formatName(person.user.name)}</h3>
                <p className="text-sm/6 text-gray-600">{person.coach.title || 'Coach'}</p>
              </li>
            ))}
            {juniorStaff.map((person) => (
              <li key={person.user.id}>
                <Image
                  alt=""
                  src={person.staffUrl || '/logos/sg_logo.png'}
                  className={`flex justify-center mx-auto size-24 rounded-full shadow-md ${!person.staffUrl ? '' : ''}`}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', objectPosition: 'top'}}
                  loading="lazy"
                />
                <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-gray-900">{formatName(person.user.name)}</h3>
                <p className="text-sm/6 text-gray-600">Coach</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Facility */}
      <div className="overflow-hidden bg-white py-20 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:ml-auto lg:pl-4 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base/7 font-semibold text-[var(--primary)]">Train Safer</h2>
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
                        <feature.icon aria-hidden="true" className="absolute left-1 top-1 size-5 text-[var(--primary)]" />
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
                alt="Product screenshot"
                src="/facility/sgi_136.jpg"
                width={2432}
                height={1442}
                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                loading="lazy"
                quality={85}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Affiliations */}
      <div className="bg-white py-10 sm:py-32">
        <div className="mx-auto px-6 lg:px-8">
          <h2 className="text-center text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Our Affiliates and Sponsors
          </h2>
          <div className="mt-32 w-full h-[150px]">
            <RollingGallery images={sponsors.map(sponsor => ({
              url: sponsor.sponsorImgUrl || '',
              alt: sponsor.organization || '',
              href: sponsor.website || ''
            }))} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="overflow-hidden bg-white py-20 sm:py-20">
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

      {/* Call to Action */}
      <div className="relative">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-25 text-center sm:py-10 lg:px-0">
          <p className="mt-4 text-xl text-magenta-500">Join the Legacy</p>
          <h1 className="text-4xl font-bold tracking-tight text-black lg:text-6xl">Become a Part of The Shenderey Family!</h1>
          <p className="mt-4 text-xl text-black">
            Spots fill fast! Register today to secure your place in a club where dreams take flight.
            Be part of the tradition. Join us and make your mark!
          </p>
          <div className="flex gap-5 mb-4">
            <a
              href="/register"
              className="mt-8 inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 shadow-lg ring-1 ring-gray-400/10"
            >
              Recreational
            </a>
            <a
              href="/competitive"
              className="mt-8 inline-block rounded-md border border-transparent bg-[var(--primary)] px-8 py-3 text-base font-medium text-white hover:bg-[var(--primary-hover)] shadow-lg"
            >
              Competitive
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
