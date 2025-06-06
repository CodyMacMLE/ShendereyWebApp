"use client"

import { useState } from 'react';

import { Employment } from "@/lib/types"

import Modal from "@/components/UI/Modal/page";


interface Props {
    jobs: Employment[];
}

export default function EmploymentTable({ jobs }: Props) {

    const [selectedJob, setSelectedJob] = useState<Employment | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleModalOpen = (e: React.MouseEvent<HTMLButtonElement>, job: Employment) => {
        e.stopPropagation();
        setSelectedJob(job);
        setModalOpen(true);
    }

    return (
      <>
        <div className="mt-20">
            {modalOpen && (
                <Modal
                    setModalEnable={setModalOpen}
                    title={'Employment Details'}
                >
                    <div className="pt-5 pr-52">
                        <h2 className="text-xl text-[var(--foreground)] font-bold">
                            {selectedJob?.position}
                        </h2>
                        <div className="text-sm text-[var(--foreground)] mt-10">
                            <p className="text-[var(--primary)] font-bold mb-2">
                                Description
                            </p>
                            {selectedJob?.description}
                        </div>
                        <div className="text-sm text-[var(--foreground)] mt-8">
                            <p className="text-[var(--primary)] font-bold mb-2">
                                Requirements
                            </p>
                            {selectedJob?.requirements}
                        </div>
                        <div className="text-sm text-[var(--foreground)] mt-8">
                            <p className="text-[var(--primary)] font-bold mb-2">
                                Compensation
                            </p>
                            {selectedJob?.contract}
                        </div>
                        <div className="text-sm text-[var(--foreground)] mt-8">
                            <p className="text-[var(--primary)] font-bold mb-2">
                                Hours
                            </p>
                            {selectedJob?.hours} hours/week
                        </div>
                        <div className="text-sm text-[var(--foreground)] my-8">
                            <p className="text-[var(--primary)] font-bold mb-2">
                                Contact Information
                            </p>
                            Contact Us at <a href="mailto:info@shendereygymnastics.ca" className="text-[var(--primary)]">info@shendereygymnastics.ca</a>
                        </div>
                    </div>
                </Modal>
            )}
            {jobs.length > 0 ? (
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-[var(--border)]">
                                    <thead className="bg-[var(--card-bg)]">
                                        <tr>
                                            <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/2 sm:w-1/3 md:w-1/4">
                                                Position
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)] w-1/4 sm:w-1/3 md:w-1/4">
                                                Hours
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)] w-1/4 sm:w-1/3 md:w-1/4">
                                                Date Created
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Details</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                                    {jobs.map((job: Employment) => (
                                        <tr
                                            key={job.id.toString()}
                                            className="transition-colors duration-150"
                                        >
                                            <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1/3 md:w-1/4 max-w-[220px]">
                                                <span>{job.position}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                                {job.hours} hours/week
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                                {new Date(job.dateCreated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button
                                                onClick={(e) => handleModalOpen(e, job)}
                                                className="text-[var(--primary)] bg-[var(--card-bg)] hover:text-[var(--background)] hover:bg-[var(--primary)] cursor-pointer rounded-full ring-1 ring-[var(--border)] py-1 px-3">
                                                    Details
                                            </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No employment opportunities available at this time.</div>
            )}
        </div>
      </>
    )
  }