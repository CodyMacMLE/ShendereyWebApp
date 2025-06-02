import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Register',
};

import { Fragment } from 'react'

const currentSession = 'Winter 2025'

const classes = [
  {
    name: 'Parent & Tot',
    groups: [
      { coach: 'Lindsay', day: 'Saturday', time: '10:15am - 11:00am', cost: '325.00' },
    ],
  },
  {
    name: 'Crickets',
    groups: [
      { coach: 'Maya', day: 'Thursday', time: '4:15pm - 5:00pm', cost: '325.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '9:15am - 10:00am', cost: '325.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '10:15am - 11:00am', cost: '325.00' },
    ],
  },
  {
    name: 'Grasshoppers',
    groups: [
      { coach: 'Lindsay', day: 'Saturday', time: '9:00am - 10:00am', cost: '375.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '10:20am - 11:20am', cost: '375.00' },
    ],
  },
  {
    name: 'Butterflies',
    groups: [
      { coach: 'Lindsay', day: 'Tuesday', time: '5:00pm - 6:00pm', cost: '375.00' },
      { coach: 'Lindsay', day: 'Thursday', time: '5:00pm - 6:00pm', cost: '375.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '9:00am - 10:00am', cost: '375.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '10:20am - 11:20am', cost: '375.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '11:30am - 12:30pm', cost: '375.00' },
    ],
  },
  {
    name: 'Developmental Boys & Girls',
    groups: [
      { coach: 'Lindsay', day: 'Tuesday', time: '5:00pm - 6:00pm', cost: '375.00' },
      { coach: 'Lindsay', day: 'Tuesday', time: '6:10pm - 7:10pm', cost: '375.00' },
      { coach: 'Lindsay', day: 'Thursday', time: '5:00pm - 6:00pm', cost: '375.00' },
      { coach: 'Lindsay', day: 'Thursday', time: '6:20pm - 7:20pm', cost: '375.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '9:00am - 10:00am', cost: '375.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '10:20am - 11:20am', cost: '375.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '11:30am - 12:30pm', cost: '375.00' },
    ],
  },
  {
    name: 'Intermediate Boys & Girls',
    groups: [
      { coach: 'Lindsay', day: 'Tuesday', time: '6:40pm - 8:10pm', cost: '505.00' },
      { coach: 'Lindsay', day: 'Thursday', time: '5:00pm - 6:30pm', cost: '505.00' },
      { coach: 'Lindsay', day: 'Thursday', time: '6:20pm - 7:50pm', cost: '505.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '9:00am - 10:00am', cost: '505.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '9:00am - 10:30am', cost: '505.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '11:30am - 1:00pm', cost: '505.00' },
    ],
  },
  {
    name: 'Advanced Boys & Girls',
    groups: [
      { coach: 'Lindsay', day: 'Tuesday', time: '4:30pm - 6:30pm', cost: '595.00' },
      { coach: 'Lindsay', day: 'Thursday', time: '6:20pm - 8:20pm', cost: '595.00' },
      { coach: 'Lindsay', day: 'Saturday', time: '10:40am - 12:40am', cost: '595.00' },
    ],
  },
  {
    name: 'Invitational',
    groups: [
      { coach: 'Lindsay', day: 'Wednesday', time: '5:00pm - 8:00pm', cost: ' By Contact' },
    ],
  },
  {
    name: 'Adult Open Gym',
    groups: [
      { coach: 'Lindsay', day: 'Tuesday', time: '7:00pm - 8:30pm', cost: '30.00/day' },
    ],
  },
  // More classes...
]

const policies = [
  { idx: 0, string: 'Payment is due at time of registration.' },
  { idx: 1, string: 'All prices shown do not include taxes.' },
  { idx: 2, string: 'Prices do not include the $50.00 annual registration fee (Valid until from July 1-June 30) or taxes.' },
  { idx: 3, string: 'No refunds after session start date.  Refunds will not be issued for gym closures including, but not limited to , storms, power outages, heating failures, outbreaks, floods, or other unforeseen circumstances.'},
  { idx: 4, string: 'Credit or refunds for missed classes will not be issued.  Make up classes will be allowed up to 2 classes only if availability allows it.  Due to high demand make up classes are not guaranteed.'},
  { idx: 5, string: 'Make-up classes are not provided for planned closures as you have not been charged for these classes (e.g, Thanksgiving, Family day, Victoria Day, Events hosted by us).'},
  // More people...
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function checkClassInDay(day: string): boolean {
  return classes.some(classType =>
    classType.groups.some(group => group.day === day)
  );
}

function mapDaysToCalendar(name: string, day: string) {
  const times: string[] = [];
  classes.forEach(classType => {
    if (classType.name === name) {
      classType.groups.forEach(group => {
        if (group.day === day) {
          times.push(group.time);
        }
      });
    }
  });
  
  if (times.length === 0) return [<span key="none"></span>];

  return times.map((time, index) => (
    <div key={index}>{time}</div> // This creates new lines naturally in the UI.
  ));
}

export default function Register() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-20">

      {/* Decorative background image and gradient */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 mx-auto max-w-7xl overflow-hidden xl:px-8">
          <Image
            alt=""
            src="/sgi_004.png"
            className="size-full object-cover"
            width={1920}
            height={1080}
          />
        </div>
        <div className="absolute inset-0 bg-white/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white" />
      </div>

      {/* Callout */}
      <section
        aria-labelledby="sale-heading"
        className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pt-26 text-center sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-2xl lg:max-w-none">
        <h2 className="text-base/7 font-semibold text-magenta-600">Register</h2>
          <h2 id="sale-heading" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Sign up for the {currentSession} session today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xl text-gray-600">
            New members, click the link below to create a new account with us.
          </p>
          <a
            href="https://shenderey-gymnastics-centre-newmarket.gymdesk.com/signup"
            target='_blank'
            className="mt-6 inline-block w-full rounded-md border border-transparent bg-magenta-600 px-8 py-3 font-medium text-white hover:bg-magenta-500 sm:w-auto shadow-md"
          >
            New member sign up 
          </a>
        </div>
      </section>

      {/* Calender Style */}
      <div className="mt-20 flow-root relative z-10">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Group
                    </th>
                    {checkClassInDay('Monday') && (
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Monday
                      </th>
                    )}
                    {checkClassInDay('Tuesday') && (
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Tuesday
                      </th>
                    )}
                    {checkClassInDay('Wednesday') && (
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Wednesday
                      </th>
                    )}
                    {checkClassInDay('Thursday') && (
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Thursday
                      </th>
                    )}
                    {checkClassInDay('Friday') && (
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Friday
                      </th>
                    )}
                    {checkClassInDay('Saturday') && (
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Saturday
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {classes.map((classType) => (
                    <tr key={classType.name} className='divide-x divide-gray-200'>
                      <td className="whitespace-wrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 align-top">
                        {classType.name}
                      </td>
                      {checkClassInDay('Monday') && (<td className="whitespace-nowrap px-3 py-4 text-sm align-top text-gray-500">{mapDaysToCalendar(classType.name, 'Monday')}</td>)}
                      {checkClassInDay('Tuesday') && (<td className="whitespace-nowrap px-3 py-4 text-sm align-top text-gray-500">{mapDaysToCalendar(classType.name, 'Tuesday')}</td>)}
                      {checkClassInDay('Wednesday') && (<td className="whitespace-nowrap px-3 py-4 text-sm align-top text-gray-500">{mapDaysToCalendar(classType.name, 'Wednesday')}</td>)}
                      {checkClassInDay('Thursday') && (<td className="whitespace-nowrap px-3 py-4 text-sm align-top text-gray-500">{mapDaysToCalendar(classType.name, 'Thursday')}</td>)}
                      {checkClassInDay('Friday') && (<td className="whitespace-nowrap px-3 py-4 text-sm align-top text-gray-500">{mapDaysToCalendar(classType.name, 'Friday')}</td>)}
                      {checkClassInDay('Saturday') && (<td className="whitespace-nowrap px-3 py-4 text-sm align-top text-gray-500">{mapDaysToCalendar(classType.name, 'Saturday')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      {/* Register Title */}
      <div className="mt-16 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Register Here</h1>
        </div>
      </div>

      {/* Register by Class Type */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
              <tbody className="bg-white">
                {classes.map((classType) => (
                  <Fragment key={classType.name}>
                    <tr className="border-t border-gray-200">
                      <th
                        scope="colgroup"
                        colSpan={5}
                        className="bg-gray-50 py-4 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                      >
                        {classType.name}
                      </th>
                    </tr>
                    {classType.groups.map((person, personIdx) => (
                      <tr
                        key={`${classType.name}-${person.coach}-${personIdx}`}
                        className={classNames(personIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t')}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                          {person.coach}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.day}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.time}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${person.cost}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                          <a href="#" className="text-magenta-600 hover:text-magenta-500">
                            Register<span className="sr-only">, {person.coach}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Policies Title */}
      <div className="mt-16 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Policies</h1>
        </div>
      </div>

      <div className="my-8 overflow-hidden bg-white shadow ring-1 ring-black/5 sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
                <ol className='pl-3 list-disc'>
                  {policies.map(policy => (
                    <li 
                      key={policy.idx}
                      className='mt-2'
                    >
                        {policy.string}
                    </li>
                  ))}
                </ol>
        </div>
      </div>

    </div>
  )
}
