"use client"

import { Program } from "@/lib/types";
import { redirect } from "next/navigation";

export default function ProgramLayout({ programs }: { programs: Program[] }) {

    return (
        <div>
            {/* Content */}
            {programs.length > 0 && (
                <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-5">
                    {programs.map((program) => (
                         <li
                         key={program.id}
                         className="col-span-1 flex flex-col divide-y divide-[var(--border)] rounded-lg bg-[var(--card-bg)] text-center shadow"
                       >
                         <div className="flex flex-1 flex-col p-8">
                           <img
                             alt=""
                             src={program.programImgUrl?.trim() ? program.programImgUrl : "/logos/sg_logo.png"}
                             className="mx-auto size-32 shrink-0 rounded-full shadow-md"
                           />
                           <h3 className="mt-6 text-sm font-medium text-[var(--foreground)]">{program.name}</h3>
                           <dl className="mt-1 flex grow flex-col justify-between">
                             <dt className="sr-only">Title</dt>
                             <dd className="text-sm text-gray-500">{program.ages} years</dd>
                             <dt className="sr-only">Role</dt>
                             <dd className="mt-3">
                               <span className="inline-flex items-center rounded-full bg-[var(--primary)]/50 px-2 py-1 text-xs font-medium text-[var(--primary)] ring-1 ring-inset ring-[var(--primary)]">
                                 {program.category}
                               </span>
                             </dd>
                           </dl>
                         </div>
                         <div>
                           <div
                                onClick={() => redirect(`/recreational/${program.id}`)}
                                className="-mt-px flex divide-x divide-[var(--border)] items-center justify-center gap-x-3 rounded-b-lg border border-transparent py-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] cursor-pointer"
                            >
                                View More
                           </div>
                         </div>
                       </li>
                    ))}
                </ul>
            )}
        </div>
    )
}