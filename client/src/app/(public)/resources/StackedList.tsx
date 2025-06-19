'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

interface Resource {
    id: string | number
    name: string
    posted: string
    size: string
    downloads: number
    link: string
}

export default function StackedList({ resources }: { resources: Resource[] }) {

    const [search, setSearch] = useState('')
    return (
        <>
            <div className="mt-20 mx-auto max-w-7xl border border-gray-200 rounded-lg shadow-md grid grid-cols-2 p-5">
                <div className="col-span-2 sm:col-span-1 mx-auto max-w-2xl lg:mx-0">
                    <h3 className="text-2xl font-semibold text-gray-900">Files</h3>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <div className="flex rounded-md outline outline-1 -outline-offset-1 outline-gray-400 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                        <div className="flex items-center justify-center px-2 border-r border-gray-400">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            id="search"
                            name="search"
                            type="text"
                            placeholder="Search for a resource"
                            className="block min-w-0 grow px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div> 
            </div>

            <div className="mt-20 mx-auto max-w-7xl px-6 sm:px-8">
                <ul role="list" className="divide-y divide-gray-100">
                {resources.filter((resource) => resource.name.toLowerCase().includes(search.toLowerCase())).map((resource) => (
                    <li key={resource.id} className="flex items-center justify-between gap-x-6 py-5">
                        <div className="min-w-0">
                            <div className="flex items-start gap-x-3">
                                <p className="text-sm/6 font-semibold text-gray-900">{resource.name}</p>
                            </div>
                            <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
                                <p className="whitespace-nowrap">
                                    Posted on <time dateTime={resource.posted}>{resource.posted}</time>
                                </p>
                                <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                                    <circle r={1} cx={1} cy={1} />
                                </svg>
                                <p className="truncate">Size: {resource.size}</p>
                                <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                                    <circle r={1} cx={1} cy={1} />
                                </svg>
                                <p className="truncate">Downloads: {resource.downloads}</p>
                            </div>
                        </div>
                        <div className="flex flex-none items-center gap-x-4">
                            <a
                                href={resource.link}
                                className="hidden rounded-md bg-[var(--primary)] px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-[var(--primary-hover)] hover:text-white sm:block"
                            >
                            Download<span className="sr-only">, {resource.name}</span>
                            </a>
                        </div>
                    </li>
                ))}
                </ul>
            </div>
        </>
    )
}
