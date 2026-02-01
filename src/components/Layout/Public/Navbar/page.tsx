'use client'

import { socialLinks } from '@/public/files/contactDetails'
import {
  CloseButton,
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import {
  Bars3Icon,
  BuildingOffice2Icon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  CursorArrowRaysIcon,
  MegaphoneIcon,
  PlayCircleIcon,
  TrophyIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { IoAmericanFootballOutline, IoMedalOutline, IoShirtOutline } from 'react-icons/io5'
import { LuGraduationCap, LuUserRoundSearch } from "react-icons/lu"

// Define a type for the call-to-action items
interface CallToAction {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const about = [
    { name: 'Contact Us', description: 'Get in contact with us', href: '/contact', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'Staff', description: 'Get a better understanding of our staff', href: '/staff', icon: UsersIcon },
    { name: 'Facility', description: 'Check out our facility', href: '/facility', icon: BuildingOffice2Icon },
    { name: 'Team', description: 'Our current competitive team members', href: '/team', icon: UserGroupIcon },
    { name: 'Achievements', description: "Recognizing our athlete's achievements", href: '/achievements', icon: TrophyIcon },
]

const programs = [
    { name: 'Recreational', description: 'Information on all the recretional programs', href: '/recreational', icon: IoAmericanFootballOutline },
    { name: 'Competitive', description: 'Check out our prestigious competitive programs', href: '/competitive', icon: IoMedalOutline },
    { name: 'Registration', description: 'Registration platform for our recreational program', href: '/register', icon: CursorArrowRaysIcon },
    { name: 'Tryouts', description: 'Tryouts for athletes who are looking for more', href: '/tryouts', icon: ClipboardDocumentCheckIcon },
]

const community = [
    { name: 'Store', description: 'Browse our gymnastics merchandise', href: '/store', icon: IoShirtOutline },
    { name: 'Resources', description: 'Documents and other info can be found here', href: '/resources', icon: ClipboardDocumentIcon },
    { name: 'Sponsors', description: 'Check out our wonderful sponsors helping our athletes', href: '/sponsors', icon: CurrencyDollarIcon },
    { name: 'Employment', description: 'Current job postings', href: '/employment', icon: MegaphoneIcon },
]

const media = [
    //{ name: 'Blog', description: 'Check out our blog for news and information on gymnastics', href: '/blog', icon: BookOpenIcon },
    { name: 'Gallery', description: 'Media and videos of our athletes and gym', href: '/gallery', icon: PlayCircleIcon },
]

const recruit = [
    { name: 'Prospects', description: 'Current athlete prospects from Shenderey Gymnastics', href: '/prospects', icon: LuUserRoundSearch },
    { name: 'Alumni', description: 'Notable Shenderey alumni', href: '/alumni', icon: LuGraduationCap },
]

const callsToAction: CallToAction[] = [
  // Add your call-to-action items here
  // Example:
  // { name: 'Contact Us', href: '/contact', icon: SomeIcon },
];

const social = [
  {
    name: 'Facebook',
    href: socialLinks.facebook,
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: socialLinks.instagram,
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white fixed top-0 w-full z-50 shadow-md">

    {/* Tablet/Desktop Nav */}
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 h-[75px]">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Shenderey Gymnastics</span>
            <Image
              alt=""
              src="/logos/sg_logo.png"
              className="h-20 w-auto"
              width={70}
              height={60}
              priority
            />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:text-[var(--primary)]"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>

        {/* About */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Popover className="relative">
            <PopoverButton className="group flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 hover:text-[var(--primary)] focus-within:outline focus-within:outline-0">
              <span className="group-hover:text-[var(--primary)]">About</span>
              <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 group-hover:text-[var(--primary)]" />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {about.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="size-6 text-gray-600 group-hover:text-[var(--primary)]" />
                    </div>
                    <div className="flex-auto">
                      <Link href={item.href} className="block font-semibold text-gray-900">
                        <CloseButton>
                          {item.name}
                          <span className="absolute inset-0" />
                        </CloseButton>
                      </Link>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                {callsToAction.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    <CloseButton>
                      <item.icon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                      {item.name}
                    </CloseButton>
                  </Link>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

        {/* Programs */}    
        <Popover className="relative">
            <PopoverButton className="group flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 hover:text-[var(--primary)] focus-within:outline focus-within:outline-0">
              <span className="group-hover:text-[var(--primary)]">Programs</span>
              <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 group-hover:text-[var(--primary)]" />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {programs.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="size-6 text-gray-600 group-hover:text-[var(--primary)]" />
                    </div>
                    <div className="flex-auto">
                      <Link href={item.href} className="block font-semibold text-gray-900">
                        <CloseButton>
                          {item.name}
                          <span className="absolute inset-0" />
                        </CloseButton>
                      </Link>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                {callsToAction.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    <CloseButton>
                      <item.icon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                      {item.name}
                    </CloseButton>
                  </Link>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

        {/* Community */}
          <Popover className="relative">
            <PopoverButton className="group flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 hover:text-[var(--primary)] focus-within:outline focus-within:outline-0">
              <span className="group-hover:text-[var(--primary)]">Community</span>
              <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 group-hover:text-[var(--primary)]" />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {community.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="size-6 text-gray-600 group-hover:text-[var(--primary)]" />
                    </div>
                    <div className="flex-auto">
                      <Link href={item.href} className="block font-semibold text-gray-900">
                        <CloseButton>
                          {item.name}
                          <span className="absolute inset-0" />
                        </CloseButton>
                      </Link>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                {callsToAction.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    <CloseButton>
                      <item.icon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                      {item.name}
                    </CloseButton>
                  </Link>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

        {/* Media */}
        <Popover className="relative">
            <PopoverButton className="group flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 hover:text-[var(--primary)] focus-within:outline focus-within:outline-0">
              <span className="group-hover:text-[var(--primary)]">Media</span>
              <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 group-hover:text-[var(--primary)]" />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {media.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="size-6 text-gray-600 group-hover:text-[var(--primary)]" />
                    </div>
                    <div className="flex-auto">
                      <Link href={item.href} className="block font-semibold text-gray-900">
                        <CloseButton>
                          {item.name}
                          <span className="absolute inset-0" />
                        </CloseButton>
                      </Link>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                {callsToAction.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    <CloseButton>
                      <item.icon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                      {item.name}
                    </CloseButton>
                  </Link>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

        {/* Recruitment */}
          <Popover className="relative">
            <PopoverButton className="group flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 hover:text-[var(--primary)] focus-within:outline focus-within:outline-0">
              <span className="group-hover:text-[var(--primary)]">Recruitment</span>
              <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 group-hover:text-[var(--primary)]" />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {recruit.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="size-6 text-gray-600 group-hover:text-[var(--primary)]" />
                    </div>
                    <div className="flex-auto">
                      <Link href={item.href} className="block font-semibold text-gray-900">
                        <CloseButton>
                          {item.name}
                          <span className="absolute inset-0" />
                        </CloseButton>
                      </Link>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                {callsToAction.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    <CloseButton>
                      <item.icon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                      {item.name}
                    </CloseButton>
                  </Link>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

        {/* Register */}
        </PopoverGroup>

        {/* Register */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-3">
            {social.map((item) => (
              <a key={item.name} href={item.href} target="_blank" className="text-gray-600 hover:text-[var(--primary)]">
                <span className="sr-only">{item.name}</span>
                <item.icon aria-hidden="true" className="size-6" />
              </a>
            ))}
          <Link href="/register" className="text-sm/6 font-semibold text-gray-900 hover:text-[var(--primary)]">
            Register <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Nav */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Shenderey Gymnastics</span>
              <Image
                alt=""
                src="/logos/sg_logo.png"
                className="h-15 w-20"
                width={100}
                height={50}
                priority
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:text-[var(--primary)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {/* Mobile About */}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]">
                    About
                    <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...about, ...callsToAction].map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>

                {/* Mobile Programs */}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]">
                    Programs
                    <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...programs, ...callsToAction].map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                
                {/* Mobile Community */}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]">
                    Community
                    <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...community, ...callsToAction].map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                
                {/* Mobile Media */}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]">
                    Media
                    <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...media, ...callsToAction].map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>

                {/* Mobile Recruitment */}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]">
                    Recruitment
                    <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...recruit, ...callsToAction].map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
              </div>

              {/* Mobile Login */}
              <div className="py-6">
                <Link
                  href="/register"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[var(--primary)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}