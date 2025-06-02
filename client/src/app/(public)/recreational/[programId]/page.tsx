import { redirect } from "next/navigation"

import { ChevronLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getGroups, getProgram } from "@/lib/actions";
import { Program } from "@/lib/types";


export default async function ProgramPage({ params }: { params: { programId: number } }) {

    const { programId } = await params;
    // Data
    const program = await getProgram(programId) as unknown as Program;
    const groups = await getGroups(programId);

    console.log(groups);

    return (
        <div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <main>
                    {/* Back Button */}
                    <div className="px-6 mb-10">
                        <div className="flex">
                            <div onClick={() => redirect("/recreational") } className="group flex items-center cursor-pointer">
                                <ChevronLeftIcon className="h-4 w-4 mr-2 text-[var(--muted)] group-hover:text-[var(--primary)]" />
                                <span className="text-[var(--muted)] group-hover:text-[var(--primary)] font-semibold items-center">Back</span>
                            </div>
                        </div>
                    </div>

                    <header>
                        {/* Heading */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-x-8 gap-y-4 bg-[var(--background)] px-4 py-4 sm:px-6 lg:px-8">
                            {/* Program Name (left) */}
                            <div>
                                <div className="flex items-center gap-x-3">
                                    <h1 className="flex gap-x-3 text-base/7">
                                        <span className="font-semibold text-[var(--foreground)]">
                                            {program ? program.category : '...'}
                                        </span>
                                        <span className="text-gray-600">
                                            /
                                        </span>
                                        <span className="font-semibold text-[var(--foreground)]">
                                            {program ? program.name : '...'}
                                        </span>
                                    </h1>
                                </div>
                            </div>
                        </div>
                        {/* Program Image and Description Row */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center py-10 px-4 sm:px-6 lg:px-8">
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

                        {/* Stats */}
                        <div className="grid grid-cols-1 bg-[var(--card-bg)] lg:grid-cols-3 rounded-md shadow-md">
                            <div
                                className='px-4 py-6 sm:px-6 lg:px-8'
                            >
                                <p className="text-sm/6 font-medium text-[var(--muted)]">Groups</p>
                                <p className="mt-2 flex items-baseline gap-x-2">
                                    <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{groups ? groups.length : 0}</span>
                                </p>
                            </div>
                            <div
                                className='sm:border-b sm:border-t lg:border-t-0 lg:border-b-0 lg:border-l border-[var(--border)] px-4 py-6 sm:px-6 lg:px-8'
                            >
                                <p className="text-sm/6 font-medium text-[var(--muted)]">Ages</p>
                                <p className="mt-2 flex items-baseline gap-x-2">
                                    <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{program!.ages}</span>
                                    <span className="text-sm text-[var(--muted)]">years</span>
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

                        {/* Title */}
                        <div className="sm:flex sm:items-center">
                            <div className="sm:flex-auto">
                                <h1 className="text-base font-semibold text-[var(--foreground)]">Groups</h1>
                            </div>
                        </div>

                        {/* Group Table */}
                        <table className="mt-6 w-full whitespace-nowrap text-left">
                            <colgroup>
                                <col className="w-full sm:w-2/12" />
                                <col className="lg:w-4/12" />
                                <col className="lg:w-2/12" />
                                <col className="lg:w-2/12" />
                                <col className="lg:w-2/12" />
                                <col className="lg:w-2/12" />
                                <col className="lg:w-1/12" />
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
                                    <th scope="col" className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {groups.map((group) => (
                                    <tr key={group.id}>
                                        {/* Day */}
                                        <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8 sm:pl-6 lg:pl-8">
                                            <div className="font-mono text-sm/6 text-[var(--foreground)] text-left">{group.day}</div>
                                        </td>
                                        {/* Coaches */}
                                        <td className="py-4 pl-0 pr-8 sm:pl-0 lg:pl-0">
                                            <div className="font-mono truncate text-sm/6 font-medium text-[var(--foreground)] text-left">
                                                {group.coaches && group.coaches.length > 0 ? group.coaches.map(coach => coach.name.split(' ')[0]).join(', ') : "Unassigned"}
                                            </div>
                                        </td>
                                        {/* Start Time */}
                                        <td className="py-4 pl-0 pr-4 text-sm/6 sm:pr-8 lg:pr-20">
                                            <div className="font-mono flex items-center justify-end gap-x-2 sm:justify-start">
                                                {new Date(`1970-01-01T${group.startTime}`).toLocaleTimeString([], {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </div>
                                        </td>
                                        {/* End Time */}
                                        <td className="py-4 pl-0 pr-4 text-sm/6 sm:pr-8 lg:pr-20">
                                            <div className="font-mono flex items-center justify-end gap-x-2 sm:justify-start">
                                                {new Date(`1970-01-01T${group.endTime}`).toLocaleTimeString([], {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </div>
                                        </td>
                                        {/* Start Date */}
                                        <td className="font-mono hidden py-4 pl-0 pr-4 text-left text-sm/6 sm:table-cell sm:pr-6 lg:pr-8">
                                            {new Date(group.startDate).toLocaleDateString()}
                                        </td>
                                        {/* End Date */}
                                        <td className="font-mono hidden py-4 pl-0 pr-4 text-left text-sm/6 sm:table-cell sm:pr-6 lg:pr-8">
                                            {new Date(group.endDate).toLocaleDateString()}
                                        </td>
                                        {/* Active Status */}
                                        <td className="py-4 pl-0 pr-4 sm:table-cell sm:pr-6 lg:pr-8 flex justify-center items-center">
                                            <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                                                {group.active ? (
                                                    <>
                                                        <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400 w-4">
                                                            <div className="size-2 rounded-full bg-current" />
                                                        </div>
                                                        <div className="hidden text-[var(--foreground)] sm:block font-mono text-sm/6">Active</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex-none rounded-full bg-red-400/10 p-1 text-red-400 w-4">
                                                            <div className="size-2 rounded-full bg-current" />
                                                        </div>
                                                        <div className="hidden text-[var(--foreground)] sm:block font-mono text-sm/6">Inactive</div>
                                                    </>
                                                )}
                                                
                                            </div>
                                        </td>
                                        {/* Edit / Delete */}
                                        <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6 ml-5">
                                                <button
                                                    onClick={handleDeleteClick}
                                                    className={`confirm-delete-button cursor-pointer group relative inline-flex p-1 items-center justify-center rounded-full ${enabled ? 'bg-red-600 hover:bg-red-500' : 'hover:bg-red-600'}`}
                                                >
                                                    <span className="relative w-[60px] h-[20px] flex items-center justify-center">
                                                        <span className={`absolute transition-opacity duration-150 text-xs text-white font-semibold ${enabled ? 'opacity-100' : 'opacity-0'}`}>
                                                        Confirm
                                                        </span>
                                                        <span className={`absolute transition-opacity duration-150 text-xs text-[var(--foreground)] group-hover:text-white font-semibold ${enabled ? 'opacity-0' : 'opacity-100'}`}>
                                                        <TrashIcon className="w-4 h-4" />
                                                        </span>
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleEditGroupClick(group);
                                                    }}
                                                    className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}

