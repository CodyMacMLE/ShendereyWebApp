'use client'

import { SparklesIcon, StarIcon, EnvelopeOpenIcon, GlobeAmericasIcon, GlobeEuropeAfricaIcon, GlobeAltIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/20/solid'
import { BuildingOffice2Icon, EnvelopeIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

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
      href: '/competitive/precomp'
    }
  },
  {
    name: 'Invitational',
    description: 'The invitational program is an alternate to the provincial program. In many other sports, athletes can start competing in games and tournaments very quickly after they begin. However, with gymnastics, this is not the reality. Athletes in gymnastics will train for several years before meeting the necessary requirements to be able to compete. The invitational program bridges the gap and allows gymnasts to start competing sooner, by modifying the skill requirements at the entry level.',
    icon: EnvelopeOpenIcon,
    link: {
      text: 'Learn More',
      href: '/competitive/invitational'
    }
  },
  {
    name: 'Provincial',
    description: 'The provincial program is for dedicated athletes where skill acquisition and routine building are the main focus. Entry into this program is not for everyone. Specific coordination, strength, and dedication are required. The program focus is on the development of flexibility, strength, speed, endurance, basic skills, and form, as well as advanced skills and routine development for each of the four apparatus.',
    icon: GlobeAmericasIcon,
    link: {
      text: 'Learn More',
      href: '/competitive/provincial'
    }
  },
  {
    name: 'National',
    description: 'The national program is for female athletes demonstrating the potential to become a top gymnast in Canada. It is within this stream that International and Olympic level athletes develop and go off on full scholarships to the U.S.A. The rules, skill requirements, and commitments required of the athlete, parents, and coaches are very demanding.  ',
    icon: GlobeAltIcon,
    link: {
      text: 'Learn More',
      href: '/competitive/national'
    }
  },
]

/* For changing the main testemonial */
const featuredTestimonial = {
    body: "Can't say enough about Shenderey Gymnastics and all the coaches. Our first time taking our daughter here she was only 2 years old and she loved every minute of it! She took a little break for a couple years to do other activities but made the decision that gymnastics was her thing. We brought her back to do some rec classes when she was 6 and never turned back. She is now 14 years old, training 25 hours a week and comes home with a HUGE smile on her face every day - that's a win for me! Highly recommend!! Thank you to all the coaches at Shenderey, you guys are all amazing",
    author: {
      name: 'Courtney Callo',
      handle: 'CourtneyCallo',
      imageUrl:
        '/testemonials/testemonial_1.png',
    },
}

/* For changing the supplementary testemonials */
const testimonials = [
  [
    [ // Left Box
      {
        body: "When looking for a gymnastics club for my daughter Shenderey Gymnastics came highly recommended to me by multiple people. At the time I had visited a few local clubs and found by far that Shenderey Gymnastics was the best suited for us! Their coaching staff are amazing and their individual attention to each gymnast enrolled in their programs is above and beyond what I ever expected!! Very family oriented, great communication and the level of coaching is by far the best out there! We love it here and have recommended this club to others who are so happy we did!! Thank you Shenderey Gymnastics for having the impact in my daughter's life that you do, not only in the gym but also outside of the gym!! Keep up the great work!!",
        author: {
          name: 'Rhiannon Agostino',
          imageUrl:
            '/testemonials/testemonial_2.png',
        },
      },
      // More testimonials...
    ],
    [ // Middle Left Box
      {
        body: "We have always had an amazing experience at Shenderey Gymnastics! Such a great place for children to train competitively and also enjoy this sport recreationally!  Staff is amazing and it’s obvious how much they care about their work. If you’re interested in gymnastics this is the place you want to be.",
        author: {
          name: 'Ella Zelikman',
          imageUrl:
            '/testemonials/testemonial_3.png',
        },
      },
      // More testimonials...
    ],
  ],
  [
    [ // Middle Right Box
      {
        body: "Top notch! I have had nothing but good experiences with Shenderey Gymnastics. Very passionate around each of their athletes progress. My boys enjoyed the ninja program and loved the gymnastics program on Saturday mornings.  I highly recommend Shenderey Gymnastics for all ages and levels.",
        author: {
          name: 'Ryan Stuart',
          imageUrl:
            '/testemonials/testemonial_4.png',
        },
      },
      // More testimonials...
    ],
    [ // Right Box
      {
        body: "My daughter loves Shenderey!! She feels confident and strong every time she walks in. The staff is extremely professional and friendly and the environment is always welcoming and kept very well. I would definitely recommend Shenderey to everyone.",
        author: {
          name: 'Hollie Ricupero',
          imageUrl:
            '/testemonials/testemonial_5.png',
        },
      },
      // More testimonials...
    ],
  ],
]

/* For changing achievements */
const achievements = [
  { id: 1, name: 'Years Serving Community', value: '40+' },
  { id: 2, name: 'Provincial Champions', value: '127' },
  { id: 3, name: 'National Champions', value: '9' },
  { id: 4, name: 'NCAA Athletes', value: '14' },
]

/* For changing staff */
const staff = [
  {
    name: 'Alanna Kerler',
    role: 'Head Coach',
    imageUrl: '/profiles/Coach_Alanna.jpg',
    bio: "Alanna has over 30 years of coaching experience and is currently coaching the High performance, National and Provincial level athletes and also oversees all our competitive programs. She is well known for her innovative choreography and has won numerous awards. Alanna has produced many champions on the national and provincial floors. She has been named team coach for many teams representing Ontario and Canada. Alanna previously sat on the Gymnastics Ontario Women’s Technical committee.",
  },
  {
    name: 'Chris Hanley',
    role: 'Coach',
    imageUrl: '/profiles/Coach_Chris.jpg',
    bio: "With over 30 years of coaching experience, Chris Hanley has become an integral part of our coaching staff. He has been instrumental in raising the competitive level of our gym. Chris is responsible for the design and implementation of these programs as well as our competition programing. Chris is currently coaching our High Performance, National and Provincial level gymnasts. Chris has amassed numerous champions in both mens and womens gymnastics, as well as power tumbling and trampoline. He has also represented Canada at many national and international competitions. Chris previously sat on the Men’s Technical committee.",
  },
  {
    name: 'Liz Dicker-Mati',
    role: 'Coach',
    imageUrl: '/profiles/Coach_Liz.jpg',
    bio: "Liz has been an essential part of our competitive team. With over 18 years of competitive coaching experience at Shenderey Gymnastics and over 30 years of coaching, she has worked with a wide range of ages and abilities. Her expertise has been a huge part of the success of our team. She has had numerous Provincial Champions and event Champions. She is also known for her choreography and has won many awards for her creativity.",
  },
  {
    name: 'Viktoriya Khalyavka',
    role: 'Coach',
    imageUrl: '/profiles/Coach_Viktoriya.jpg',
    bio: "Insert Viktoriya's coaching description and experience here.",
  },
  {
    name: 'Breanna Badger',
    role: 'Coach',
    imageUrl: '/profiles/Coach_Breanna.jpg',
    bio: "Breanna is our dedicated Administrator with expertise in overseeing and coordinating gymnastics programs designed for fun, fitness, and skill development. Known for her strong organizational skills and leadership, Breanna excels at managing class schedules, supervising staff, and ensuring a safe and engaging environment for participants. Her passion for promoting recreational sports shines through her commitment to fostering a positive community, facilitating smooth communication with families, and organizing memorable events that celebrate the joy of gymnastics.",
  },
  {
    name: 'Cody MacDonald',
    role: 'Coach',
    imageUrl: '/profiles/Coach_Cody.jpg',
    bio: "Cody is a highly experienced Competitive Gymnastics Coach with over 15 years of coaching expertise across Men's, Women's, and Trampoline & Tumbling disciplines. A former National Silver Medalist in Tumbling, Cody brings a deep understanding of competitive excellence. He has successfully produced multiple provincial champions and medalists, demonstrating exceptional skill in athlete development and performance enhancement. With a commitment to fostering discipline, resilience, and sportsmanship, Cody is dedicated to helping athletes achieve their full potential both in and out of competition.",
  },
  {
    name: 'Naima',
    role: 'Coach',
    imageUrl: '/profiles/Naima_012.jpg',
  },
  {
    name: 'Emily',
    role: 'Coach',
    imageUrl: '/profiles/EmilyH_031.jpg',
  },
  {
    name: 'Sophia',
    role: 'Coach',
    imageUrl: '/profiles/SophiaE_023.jpg',
  },
  {
    name: 'Zoe',
    role: 'Coach',
    imageUrl: '/profiles/ZoeG_004.jpg',
  },
  // More people...
]

/* For changing facility */
const facility = [
  {
    name: 'Safety First.',
    description:
      'Our equipment is of the highest safety that can be provided in the sport. Our equipment is also checked daily by staff to ensure the highest level safety for your children.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'International Ready.',
    description: 'Our facility provides international renowned equipment for the athletes to train on. This means that the equipment your child trains on is the same equipment as the olympians allowing for smoother transitions to competitions.',
    icon: GlobeEuropeAfricaIcon,
  },
  {
    name: 'Modern Methods.',
    description: 'Our facility is equipped with modern systems to provide the best training to your children. This includes multiple bungee systems, foam pits and air conditioning',
    icon: BoltIcon,
  },
]

/* For changing contact details */
const contact = {
  street: '17075 Leslie St., Units 3-5',
  city: 'Newmarket',
  region: 'ON',
  postal: 'L3Y 8E1',
  telephone: '+1 (905) 895-6838',
  email: 'shendereygymnastics@gmail.com',
  officeHours: [
    {
      day: 'Monday',
      time: '1:00-6:00pm',
    },
    {
      day: 'Tuesday',
      time: '1:00-7:30pm',
    },
    {
      day: 'Thursday',
      time: '12:00-5:00pm',
    },
    {
      day: 'Friday',
      time: '1:00-7:30pm',
    },
  ]
}

/* For changing sponsors/affiliates */
const affiliates = [
  {
    alt: 'Bingo World Newmarket',
    src: '/logos/bingoWorld_Affiliate.jpg',
    href: 'https://bingoworld.ca/newmarket/',
  },
  {
    alt: 'Coach.ca',
    src: '/logos/coachCa_Affiliate.jpg',
    href: 'https://www.coach.ca',
  },
  {
    alt: 'NCAA Gymnastics',
    src: '/logos/ncaaGym_Affiliate.avif',
    href: 'https://www.ncaa.com/sports/gymnastics-women',
  },
  {
    alt: 'Gymnastics Canada',
    src: '/logos/GymCan_Affiliate.webp',
    href: 'https://gymcan.org/',
  },
  {
    alt: 'Gymnastics Ontario',
    src: '/logos/gymOntario_Affiliate.jpg',
    href: 'https://www.gymnasticsontario.ca/',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {

  return (
    <div className="bg-white">

      {/* Hero section */}
      <div className="relative bg-gray-900 shadow-hero mt-[50px]">
        {/* Decorative image and overlay */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <Image
            alt=""
            src="/sgi_095.jpg"
            className="size-full object-cover"
            width={1920}
            height={1080}
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-70" />
        {/* Content of Hero Section */}
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-52 text-center sm:py-56 lg:px-0">
          <p className="mt-4 text-xl text-magenta-600">Join the Legacy</p>
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
              href="/tryouts"
              className="mt-8 inline-block rounded-md border border-transparent bg-magenta-600 px-8 py-3 text-base font-medium text-white hover:bg-magenta-500"
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
                <card.icon aria-hidden="true" className="h-7 w-5 flex-none text-magenta-500" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-magenta-500">{card.name}</h3>
                  <p className="mt-2 text-black">{card.description}</p>
                </div>
                <a
                  href={card.link.href}
                  className="mt-4 inline-block self-start rounded-md border border-transparent bg-magenta-600 px-8 py-3 text-base font-medium text-white hover:bg-magenta-500"
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
                          <Image alt="" src={testimonial.author.imageUrl} className="size-10 rounded-full bg-gray-50" width={50} height={50}/>
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

      {/* Achievements */}
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
              {achievements.map((stat) => (
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
              All SGI coaches are nationally certified. They are here to assist each gymnast to reach her maximum potential, and they recognize that each child is ultimately responsible for her own success,
              involvement, and progress. Our coaches are dedicated and passionate about providing top quality training in a technically sound and safe manner for all of our athletes.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
          >
            {staff.map((person) => (
              <li key={person.name}>
                <Image
                  alt=""
                  src={person.imageUrl || '/default-profile.png'}
                  className="flex justify-center mx-auto size-24 rounded-full shadow-md"
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', objectPosition: 'top'}}
                />
                <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-gray-900">{person.name}</h3>
                <p className="text-sm/6 text-gray-600">{person.role}</p>
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
                <h2 className="text-base/7 font-semibold text-magenta-600">Train Safer</h2>
                <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  A State of the Art Facility
                </p>
                <p className="mt-6 text-lg/8 text-gray-600">
                  Our facility is a cutting-edge training center designed to inspire athletes of all levels, from beginners to elite competitors. The gym is well-lit, air-conditioned and equipped with the latest in gymnastics apparatus, including Olympic-standard equipment for vault, bars, beam, floor and trampoline.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                  {facility.map((feature) => (
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
                alt="Product screenshot"
                src="/sgi_136.jpg"
                width={2432}
                height={1442}
                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Affiliations */}
      <div className="bg-white py-10 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg/8 font-semibold text-gray-900">
            Our Affiliates and Sponsors
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            {affiliates.map(affiliate => (
              <a href={affiliate.href} target='_blank' key={affiliate.alt}>
                <Image
                  alt={affiliate.alt}
                  src={affiliate.src}
                  width={100}
                  height={58}
                  className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Add a blog section here */}

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
                      <BuildingOffice2Icon aria-hidden="true" className="h-7 w-6 text-magenta-600" />
                    </dt>
                    <dd>
                      {contact.street} <br />
                      {contact.city}, {contact.region} {contact.postal}
                    </dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Telephone</span>
                      <PhoneIcon aria-hidden="true" className="h-7 w-6 text-magenta-600" />
                    </dt>
                    <dd>
                      <a href="tel:+1 (555) 234-5678" className="hover:text-gray-900">
                        {contact.telephone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Email</span>
                      <EnvelopeIcon aria-hidden="true" className="h-7 w-6 text-magenta-600" />
                    </dt>
                    <dd>
                      <a href="mailto:shendereygymnastics@gmail.com" className="hover:text-gray-900">
                      {contact.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Email</span>
                      <ClockIcon aria-hidden="true" className="h-7 w-6 text-magenta-600" />
                    </dt>
                    <dd>
                      {contact.officeHours.map((hours) => (
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
              href="/tryouts"
              className="mt-8 inline-block rounded-md border border-transparent bg-magenta-600 px-8 py-3 text-base font-medium text-white hover:bg-magenta-500 shadow-lg"
            >
              Competitive
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
