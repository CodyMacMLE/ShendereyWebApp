import Link from "next/link";
import { redirect } from "next/navigation";

type Program = {
    id: number,
    name: string,
    category: string,
    description: string,
    length: number,
    ages: string,
    programImgUrl: string,
}

interface ProgramLayoutProps {
    programs: Program[];
    isLoading?: boolean;
}

export default function ProgramLayout({ programs, isLoading }: ProgramLayoutProps) {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-10">
            {/* Title */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-[var(--foreground)]">Programs</h1>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                    href="/admin/users/create-user"
                    type="button"
                    className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                >
                    Add Program
                </Link>
                </div>
            </div>
            
            {/* Content */}
            {isLoading ? (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">Loading...</div>
            ) : programs.length > 0 ? (
                <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-5">
                    {programs.map((program) => (
                         <li
                         key={program.id}
                         className="col-span-1 flex flex-col divide-y divide-[var(--border)] rounded-lg bg-[var(--card-bg)] text-center shadow"
                       >
                         <div className="flex flex-1 flex-col p-8">
                           <img
                             alt=""
                             src={program.programImgUrl?.trim() ? program.programImgUrl : "/sg_logo.png"}
                             className="mx-auto size-32 shrink-0 rounded-full shadow-md"
                           />
                           <h3 className="mt-6 text-sm font-medium text-[var(--foreground)]">{program.name}</h3>
                           <dl className="mt-1 flex grow flex-col justify-between">
                             <dt className="sr-only">Title</dt>
                             <dd className="text-sm text-gray-500">{program.ages}</dd>
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
                                onClick={() => redirect(`/admin/programs/${program.id}`)}
                                className="-mt-px flex divide-x divide-[var(--border)] items-center justify-center gap-x-3 rounded-b-lg border border-transparent py-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] cursor-pointer"
                            >
                                View More
                           </div>
                         </div>
                       </li>
                    ))}
                </ul>
            ) : (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No programs available.</div>
            )}
          
        </div>
    )
}