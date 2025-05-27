'use client'

import React from 'react'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
  Switch,
} from '@headlessui/react'
import {
  Bars3Icon,
  DocumentDuplicateIcon,
  HomeIcon,
  XMarkIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  PlayCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline'
import { IoShirtOutline } from 'react-icons/io5';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import Image from 'next/image'

import { useTheme } from '@/components/Theme/page';


const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Programs', href: '/admin/programs', icon: CursorArrowRaysIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon},
  { name: 'Gallery', href: '/admin/gallery', icon: PlayCircleIcon },
  { name: 'Sponsors', href: '/admin/sponsors', icon: CurrencyDollarIcon },
  { name: 'Tryouts', href: '/admin/tryouts', icon: ClipboardDocumentIcon },
  { name: 'Store', href: '/admin/store', icon: IoShirtOutline },
  { name: 'Resources', href: '/admin/resources', icon: DocumentDuplicateIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface DashboardNavProps {
  content: React.ReactNode;
}

export default function AdminNavbar({ content }: DashboardNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  let pathname = usePathname();
  pathname = pathname.slice(7);

  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div>

        {/* Mobile Nav */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center justify-center">
                  <Image
                    alt="Shenderey Gymnastics"
                    src="/sg_logo.png"
                    className="h-8 w-auto"
                    width={70}
                    height={60}
                  />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname.includes(item.name.toLowerCase()) || (item.name === 'Dashboard' && pathname === '');
                          return (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  isActive ? 'bg-gray-50 text-magenta-600' : 'text-gray-700 hover:bg-gray-50 hover:text-magenta-600',
                                  'group flex gap-x-3 rounded-md p-2 text-sm font-semibold',
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    isActive ? 'text-magenta-600' : 'text-gray-400 group-hover:text-magenta-600',
                                    'size-6 shrink-0',
                                  )}
                                />
                                {item.name}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component */}
          <div className="flex grow flex-col justify-between overflow-y-auto border-r border-[var(--border)] bg-[var(--card-bg)] px-6 pb-4">
            {/* Logo */}
            <div className={`flex h-12 shrink-0 items-center justify-center ${ theme === 'dark' ? 'bg-[#eeeeee]' : ''} rounded-md m-3`}>
              <Image
                alt="Shenderey Gymnastics"
                src="/sg_logo.png"
                className="h-18 w-auto"
                width={70}
                height={60}
                priority
              />
            </div>
              
            {/* Nav Buttons */}
            <nav className="flex flex-1 flex-col mt-6">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="mx-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname.includes(item.name.toLowerCase()) || (item.name === 'Dashboard' && pathname === '');
                        return (
                          <li key={item.name} className='group'>
                            <a
                              href={item.href}
                              className={classNames(
                                isActive ? ' text-[var(--primary)]' : 'text-[var(--foreground)] group-hover:text-[var(--primary)]',
                                'flex gap-x-3 rounded-md p-2 text-sm font-semibold items-center',
                              )}
                            >
                              <item.icon
                                className={classNames(
                                  isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)] group-hover:text-[var(--primary)]',
                                  'size-6 shrink-0',
                                )}
                              />
                              {item.name}
                            </a>
                          </li>
                        )
                      })}
                  </ul>
                </li>
              </ul>
            </nav>
          

            {/* Website Link */}
            <div className="border-t border-[var(--border)] pt-4 w-full">
              <Link
                href="/"
                className="text-[var(--foreground)] hover:text-[var(--primary)] gap-x-3 rounded-md p-2 text-sm flex justify-center font-semibold"
              >
                Go to Website
              </Link>
            </div>

          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[var(--border)] bg-[var(--card-bg)] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            {/* Separator */}
            <div aria-hidden="true" className="h-6 w-px bg-[var(--border)] lg:hidden" />

            {/* Search Bar */}
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              
              <form action="#" method="GET" className="grid flex-1 grid-cols-1">
                <input
                  name="search"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  className="col-start-1 row-start-1 block size-full bg-[var(--card-bg)] pl-8 text-base text-[var(--foreground)] outline-none placeholder:[var(--foreground)] sm:text-sm/6"
                />
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-[var(--foreground)]"
                />
              </form>

              {/* Theme and Logout */}
              <div className="flex gap-4 items-center">
                {/* Theme Toggle */}
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out bg-gray-300 ring-1 ring-[var(--border)]`}
                >
                  <span className="sr-only">Toggle theme</span>
                  <span
                    className={`${
                      theme === 'dark' ? 'translate-x-6 bg-[var(--background)]' : 'translate-x-1 bg-[var(--background)]'
                    } inline-block h-4 w-4 transform rounded-full transition-transform z-10`}
                  />
                  <span
                    className={`absolute left-1 top-1 z-0`}
                  
                  >
                    <MoonIcon className="w-4 h-4 text-black"/>
                  </span>
                  <span
                    className={`absolute right-0.5 top-0.5 z-0`}
                  
                  >
                    <SunIcon className="w-5 h-5 text-white"/>
                  </span>
                </Switch>
                {/* Logout Button */}
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <ArrowLeftStartOnRectangleIcon className='size-6 text-gray-400 hover:text-[var(--primary)] cursor-pointer'/>
                </div>
              </div>

            </div>
          </div>

          <main className="py-10">
            <Suspense fallback={<></>}>
              <div className="px-4 sm:px-6 lg:px-8">{content}</div>
            </Suspense>
          </main>

        </div>
      </div>
    </>
  )
}
