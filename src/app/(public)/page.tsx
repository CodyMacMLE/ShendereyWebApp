import { AcademicCapIcon, EnvelopeOpenIcon, GlobeAltIcon, GlobeAmericasIcon, SparklesIcon, StarIcon } from '@heroicons/react/20/solid'
import { BuildingOffice2Icon, ClockIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import type { Metadata } from 'next'

import { getJuniorStaff, getSeniorStaff, getSponsors } from '@/lib/actions'
import { contactDetails } from '@/public/files/contactDetails'
import { facilityFeatures } from '@/public/files/features'
import { HomeStats } from '@/public/files/stats'
import { featuredTestimonial, testimonials } from '@/public/files/testemonials'

import RollingGallery from '@/components/UI/RollingGallery/page'
import RevealGroup from '@/components/UI/RevealGroup/page'
import CountUp from '@/components/UI/CountUp/page'
import { formatName } from '@/lib/utils'
import { Archivo } from 'next/font/google'

// Display face for hero headlines — scoped here, not global.
const archivo = Archivo({ subsets: ['latin'], weight: ['700', '900'] })

// Consistent section heading: pink uppercase eyebrow + Archivo display title.
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{eyebrow}</p>
      )}
      <h2 className={`${archivo.className} mt-3 text-balance text-4xl font-black tracking-tight text-gray-900 sm:text-5xl`}>
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg/8 text-gray-600">{subtitle}</p>}
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Shenderey Gymnastics | Premier Gymnastics Club in Newmarket, Ontario',
  description: 'Shenderey Gymnastics Centre offers recreational and competitive gymnastics programs in Newmarket, Ontario. Nationally certified coaches. Est. 1984. Register today.',
  openGraph: {
    title: 'Shenderey Gymnastics | Premier Gymnastics Club in Newmarket, Ontario',
    description: 'Recreational and competitive gymnastics programs in Newmarket, Ontario for all ages. Nationally certified coaches. Established 1984.',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsClub',
  name: 'Shenderey Gymnastics Centre',
  description: 'Premier gymnastics club in Newmarket, Ontario offering recreational and competitive programs since 1984.',
  telephone: '+19058954194',
  email: 'sgcrecreational@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '17075 Leslie St., Units 3-5',
    addressLocality: 'Newmarket',
    addressRegion: 'ON',
    postalCode: 'L3Y 8E1',
    addressCountry: 'CA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 44.0558312,
    longitude: -79.4301737,
  },
  sameAs: [
    'https://www.facebook.com/shendereygymnastics',
    'https://www.instagram.com/shendereygymnastics/',
  ],
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday',    opens: '13:00', closes: '20:45' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday',   opens: '13:00', closes: '20:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '13:00', closes: '20:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday',  opens: '12:00', closes: '20:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday',    opens: '13:00', closes: '20:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday',  opens: '09:00', closes: '17:00' },
  ],
  foundingDate: '1984',
  sport: 'Gymnastics',
};

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
    name: 'Development',
    description: 'The development program is designed for gymnasts looking to bridge the gap between recreational and competitive gymnastics. Athletes in this program will focus on building foundational skills, strength, and confidence in a supportive environment. The program emphasizes skill progression, proper technique, and physical preparation to help gymnasts reach the next level of their gymnastics journey.',
    icon: AcademicCapIcon,
    link: {
      text: 'Learn More',
      href: '/competitive'
    }
  },
  {
    name: 'Pre-Competitive',
    description: "These young female athletes aged 5 to 8 years of age that have shown a desire to learn the sport of gymnastics. The program features a fun, safe, and caring environment and focuses on developing flexibility, strength, balance, endurance, and technical form. Gymnasts in Shenderey's Pre-Competitive Program may progress into the Xcel, Compulsory, Provincial, or National Program.",
    icon: StarIcon,
    link: {
      text: 'Learn More',
      href: '/competitive'
    }
  },
  {
    name: 'Xcel',
    description: 'The Xcel program is an alternate to the provincial program. In many other sports, athletes can start competing in games and tournaments very quickly after they begin. However, with gymnastics, this is not the reality. Athletes in gymnastics will train for several years before meeting the necessary requirements to be able to compete. The Xcel program bridges the gap and allows gymnasts to start competing sooner, by modifying the skill requirements at the entry level.',
    icon: EnvelopeOpenIcon,
    link: {
      text: 'Learn More',
      href: '/competitive'
    }
  },
  {
    name: 'Compulsory',
    description: 'The compulsory program focuses on mastering standardized routines set by Gymnastics Canada. Athletes learn and perfect specific required elements on each apparatus, building a strong technical foundation. This program develops discipline, consistency, and attention to detail as gymnasts work toward meeting the precise standards needed to advance through the competitive levels.',
    icon: GlobeAmericasIcon,
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
    <RevealGroup className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero section — full-bleed cinematic */}
      <div data-reveal="off" className="relative isolate mt-[50px] flex min-h-[88vh] items-end overflow-hidden bg-gray-900 shadow-hero">
        {/* Photo */}
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
        {/* Gradient scrim — lets the photo breathe up top, anchors text at the base */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/90" />

        {/* Content */}
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 sm:pb-20 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-pink-300">
            Newmarket, Ontario · Est. 1984
          </p>
          <h1 className={`${archivo.className} mt-4 max-w-[16ch] text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl`}>
            Where champions take flight.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-200 sm:text-xl">
            Forty years of coaching recreational and competitive gymnasts — taught right,
            from the very first cartwheel. Spots fill fast each season.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/register"
              className="inline-block rounded-md bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
            >
              Recreational Programs
            </a>
            <a
              href="/competitive"
              className="inline-block rounded-md bg-[var(--primary)] px-8 py-3 text-base font-medium text-white hover:bg-[var(--primary-hover)]"
            >
              Competitive Stream
            </a>
          </div>

          {/* Credibility strip */}
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/20 pt-6">
            {HomeStats.map((stat) => (
              <div key={stat.id}>
                <div className={`${archivo.className} text-3xl font-black leading-none text-white`}>{stat.value}</div>
                <div className="mt-1.5 text-xs uppercase tracking-wide text-gray-300">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="relative isolate overflow-hidden bg-white py-24 sm:py-30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="What we offer"
            title="Programs"
            subtitle="From first cartwheel to competitive podium — a path for every age and level."
          />
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
            {programs.map((card) => (
              <div key={card.name} className="flex h-full flex-col gap-y-4 rounded-xl bg-white p-6 shadow-lg ring-1 ring-inset ring-black/10 transition duration-200 hover:-translate-y-1 hover:shadow-xl">
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
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading center eyebrow="Testimonials" title="What families are saying" />
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
            <SectionHeading
              center
              eyebrow="Track record"
              title="Our achievements"
              subtitle="Four decades of dedication — measured on the podium and beyond."
            />
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {HomeStats.map((stat) => (
                <div key={stat.id} className="flex flex-col bg-gray-600/5 p-8">
                  <dt className="text-sm/6 font-semibold text-gray-600">{stat.name}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900"><CountUp value={stat.value} /></dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Staff Members */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            center
            eyebrow="Our coaches"
            title="Meet the team"
            subtitle="Every Shenderey coach is nationally certified and dedicated to helping each gymnast reach her full potential — with top-quality training delivered in a technically sound, safe environment."
          />
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
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Train safer</p>
                <h2 className={`${archivo.className} mt-3 text-pretty text-4xl font-black tracking-tight text-gray-900 sm:text-5xl`}>
                  A state-of-the-art facility
                </h2>
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
                alt="Shenderey Gymnastics Centre training facility"
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
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Proudly partnered</p>
            <h2 className={`${archivo.className} mt-3 text-pretty text-4xl font-black tracking-tight text-gray-900 sm:text-5xl`}>
              Our affiliates &amp; sponsors
            </h2>
          </div>
          <div className="mt-16 w-full h-[150px]">
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
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Visit us</p>
                <h2 className={`${archivo.className} mt-3 text-pretty text-4xl font-black tracking-tight text-gray-900 sm:text-5xl`}>
                  Get in touch
                </h2>
                <p className="mt-6 text-lg/8 text-gray-600">
                  Questions about programs, schedules, or registration? Come see the gym or reach out — we&apos;re happy to help.
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
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Ready when you are</p>
          <h2 className={`${archivo.className} mt-2 text-4xl font-black tracking-tight text-black lg:text-6xl`}>Your gymnast&apos;s next chapter starts here.</h2>
          <p className="mt-4 text-xl text-black">
            Classes fill quickly each season. Book a trial or register today — our coaches
            will help you find the right program for your athlete&apos;s age and level.
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

    </RevealGroup>
  )
}
