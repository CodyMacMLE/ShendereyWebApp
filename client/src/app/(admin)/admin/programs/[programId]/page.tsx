"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";

import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'

type Program = {
    id: number,
    name: string,
    category: string,
    description: string,
    length: number,
    ages: string,
    programImgUrl: string,
}

type Group = {

}

const stats = [
  { name: 'Number of deploys', value: '405' },
  { name: 'Average deploy time', value: '3.65', unit: 'mins' },
  { name: 'Number of servers', value: '3' },
  { name: 'Success rate', value: '98.5%' },
]
const statuses = { Completed: 'text-green-400 bg-green-400/10', Error: 'text-rose-400 bg-rose-400/10' }
const activityItems = [
  {
    user: {
      name: 'Michael Foster',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: '2d89f0c8',
    branch: 'main',
    status: 'Completed',
    duration: '25s',
    date: '45 minutes ago',
    dateTime: '2023-01-23T11:00',
  },
  // More items...
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Program() {

    // Parameters
    const { programId } = useParams();

    // Data
    const [program, setProgram] = useState<Program | null>(null)
    const [groups, setGroups] = useState<Group | null>(null)

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Fetching
    const fetchProgram = async () => {
        try {
            const res = await fetch(`/api/programs/${programId}`,{
                method: 'GET'
            });
    
            if (res.ok) {
                const data = await res.json();
                setProgram(data.body);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch(`/api/groups/${programId}`,{
                method: 'GET'
            });

            if (res.ok) {
                const data = await res.json();
                setGroups(data.body);
            }
            
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    // Reload state

    // On load
    useEffect(() => {
        fetchProgram();
        // fetchGroups(); 
    }, []);

    // On data change
    useEffect(() => {  
        console.log(program);
    }, [program, groups]);

    return (
        <>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
                <div>
                    <main>
                        <header>
                            {/* Heading */}
                            <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-[var(--background)] px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
                                <div>
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-x-3">
                                            <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                                                <div className="size-2 rounded-full bg-current" />
                                            </div>
                                            <h1 className="flex gap-x-3 text-base/7">
                                                <span className="font-semibold text-[var(--foreground)]">
                                                    {program!.category.charAt(0).toUpperCase() + program!.category.slice(1).toLowerCase()}
                                                </span>
                                                <span className="text-gray-600">
                                                    /
                                                </span>
                                                <span className="font-semibold text-[var(--foreground)]">
                                                    {program!.name}
                                                </span>
                                            </h1>
                                        </div>
                                        {/* Set Up Edit */}
                                        <span className="text-[var(--primary)] cursor-pointer hover:text-[var(--primary-hover)]">Edit</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 items-center py-10">
                                        <img
                                            src={program?.programImgUrl?.trim() ? program.programImgUrl : "/sg_logo.png"}
                                            alt={program?.name}
                                            className="w-20 h-20 rounded-full bg-white shadow-md"
                                        />
                                        {/* Description */}
                                        <div className="flex-1 text-sm text-[var(--muted)]">
                                            {program?.description}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 bg-[var(--card-bg)] lg:grid-cols-3 rounded-md shadow-md">
                                <div
                                    className='px-4 py-6 sm:px-6 lg:px-8'
                                >
                                    <p className="text-sm/6 font-medium text-[var(--muted)]">Groups</p>
                                    <p className="mt-2 flex items-baseline gap-x-2">
                                        {/* Should be groups.length() */}
                                        <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{10}</span>
                                    </p>
                                </div>
                                <div
                                    className='sm:border-b sm:border-t lg:border-t-0 lg:border-b-0 lg:border-l border-[var(--border)] px-4 py-6 sm:px-6 lg:px-8'
                                >
                                    <p className="text-sm/6 font-medium text-[var(--muted)]">Ages</p>
                                    <p className="mt-2 flex items-baseline gap-x-2">
                                        <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{program!.ages}</span>
                                    </p>
                                </div>
                                <div
                                    className='lg:border-l border-[var(--border)] px-4 py-6 sm:px-6 lg:px-8'
                                >
                                    <p className="text-sm/6 font-medium text-[var(--muted)]">Length</p>
                                    <p className="mt-2 flex items-baseline gap-x-2">
                                        <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{program!.length}</span>
                                        <span className="text-sm text-[var(--muted)]">minutes</span>
                                    </p>
                                </div>
                            </div>
                        </header>

                        {/* Groups list */}
                        <div className="border-t border-[var(--border)] pt-11">
                        <h2 className="px-4 text-base/7 font-semibold text-[var(--foreground)] sm:px-6 lg:px-8">Groups</h2>
                        <table className="mt-6 w-full whitespace-nowrap text-left">
                            <colgroup>
                            <col className="w-full sm:w-2/12" />
                            <col className="lg:w-4/12" />
                            <col className="lg:w-2/12" />
                            <col className="lg:w-2/12" />
                            <col className="lg:w-2/12" />
                            <col className="lg:w-2/12" />
                            <col className="lg:w-1/12" />
                            </colgroup>
                            <thead className="border-b border-[var(--border)] text-sm/6 text-[var(--foreground)]">
                            <tr>
                                <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">
                                Day
                                </th>
                                <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">
                                Coach
                                </th>
                                <th scope="col" className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
                                Start Time
                                </th>
                                <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
                                End Time
                                </th>
                                <th scope="col" className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
                                Start Date
                                </th>
                                <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
                                End Date
                                </th>
                                <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
                                Status
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                            {activityItems.map((item) => (
                                <tr key={item.commit}>
                                <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                                    <div className="flex items-center gap-x-4">
                                    <img alt="" src={item.user.imageUrl} className="size-8 rounded-full bg-gray-800" />
                                    <div className="truncate text-sm/6 font-medium text-white">{item.user.name}</div>
                                    </div>
                                </td>
                                <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                                    <div className="flex gap-x-3">
                                    <div className="font-mono text-sm/6 text-gray-400">{item.commit}</div>
                                    <span className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20">
                                        {item.branch}
                                    </span>
                                    </div>
                                </td>
                                <td className="py-4 pl-0 pr-4 text-sm/6 sm:pr-8 lg:pr-20">
                                    <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                                    <time dateTime={item.dateTime} className="text-gray-400 sm:hidden">
                                        {item.date}
                                    </time>
                                    <div className={classNames(statuses[item.status as keyof typeof statuses], 'flex-none rounded-full p-1')}>
                                        <div className="size-1.5 rounded-full bg-current" />
                                    </div>
                                    <div className="hidden text-white sm:block">{item.status}</div>
                                    </div>
                                </td>
                                <td className="hidden py-4 pl-0 pr-8 text-sm/6 text-gray-400 md:table-cell lg:pr-20">
                                    {item.duration}
                                </td>
                                <td className="hidden py-4 pl-0 pr-4 text-right text-sm/6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                                    <time dateTime={item.dateTime}>{item.date}</time>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    </main>
                </div>
            </>
          )}
        </>
    );
}

