"use client"

import { SetStateAction, Dispatch, useState, useEffect } from 'react';

import Modal from "@/components/UI/Modal/page";
import TryoutsTableSkeleton from "@/components/UI/Tables/TryoutsTable/TryoutsTableSkeleton";

import { EnvelopeOpenIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import TryoutDisplay from '@/components/Layout/Admin/TryoutDisplay/page';

type Tryout = {
  id: number;
  athleteName: string;
  athleteDOB: string;
  athleteAbout: string;
  experienceProgram: string;
  experienceLevel: string;
  experienceYears: number;
  currentClub: string;
  currentCoach: string;
  currentHours: number;
  tryoutPreferences: string;
  tryoutLevel: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRelationship: string;
  readStatus: boolean;
  createdAt: string;
  updatedAt: string;
};

interface Props {
    tryouts: Tryout[];
    setTryouts: Dispatch<SetStateAction<Tryout[]>>;
    isLoading?: boolean
}

export default function TryoutsTable({ tryouts, setTryouts, isLoading }: Props) {

    const [enabledStates, setEnabledStates] = useState<{ [key: number]: boolean }>({});
    const [selectedTryout, setSelectedTryout] = useState<Tryout | null>(null);
    const [tryoutModalEnabled, setTryoutModalEnabled] = useState(false);

    // Global click detection for delete confirm button
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.confirm-delete-button')) {
                setEnabledStates({});
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Delete Sponsor
    const deleteTryout = async (tryoutId : number) => {
        try {
            const res = await fetch(`/api/tryouts/${tryoutId}`, {
                method: 'DELETE',
            })  

            if (res.ok) {
                const data = await res.json();
                if (data.body) {
                    const newArray = tryouts.filter(tryout => tryout.id !== tryoutId);
                    setTryouts(newArray);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Toggle Enabled States
    const toggleEnabled = (id: number) => {
        setEnabledStates(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const toggleReadStatus = async (id: number) => {
        try {
            const res = await fetch(`/api/tryouts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ readStatus: !tryouts.find(tryout => tryout.id === id)?.readStatus }),
            })

            if (res.ok) {
                const data = await res.json();
                if (data.body) {
                    const newArray = tryouts.map(tryout => tryout.id === id ? { ...tryout, readStatus: !tryout.readStatus } : tryout);
                    setTryouts(newArray);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
      <>
    
        {selectedTryout &&  tryoutModalEnabled && (
            <Modal title="Tryout Information" setModalEnable={setTryoutModalEnabled}>
                <TryoutDisplay tryout={selectedTryout} />
            </Modal>
        )}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold text-[var(--foreground)]">Tryouts</h1>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <div>
                    <label htmlFor="search" className="block text-sm/6 font-medium text-[var(--foreground)]">
                        Athlete Search
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex rounded-md bg-[var(--card-bg)] outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                            <input
                                id="search"
                                name="search"
                                type="text"
                                className="block min-w-0 grow px-3 py-1.5 bg-[var(--background)] text-base text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

          {isLoading ? (
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-[var(--border)]">
                      <thead className="bg-[var(--card-bg)]">
                        <tr>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">Read Status</th>
                            <th className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4 sm:w-1/3 md:w-1/4">Athlete Name</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Current Club</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Tryout Level</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Current Program</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Years of Experience</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Date of Birth</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Created At</th>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                        </tr>
                      </thead>
                      <TryoutsTableSkeleton />
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : tryouts.length > 0 && tryouts ? (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--card-bg)]">
                      <tr>
                        <th scope="col" className="relative py-3.5 pl-3">
                          <span className="sr-only">Read Status</span>
                        </th>
                        <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/16 sm:w-1/16">
                          Athlete Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Current Club
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Tryout Level
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Current Program
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Years of Experience
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Date of Birth
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Created At
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                      {tryouts.map((tryout: Tryout, idx: number) => {
                        const enabled = enabledStates[tryout.id] || false;

                        const handleDeleteClick = async () => {
                          if (!enabled) {
                            toggleEnabled(tryout.id);
                          } else {
                            await deleteTryout(tryout.id);
                          }
                        };

                        return (
                          <tr
                            key={tryout.id ?? idx}
                            className="transition-colors duration-150 cursor-pointer hover:bg-[var(--card-bg)]/50"
                            onClick={() => {
                              setSelectedTryout(tryout);
                              setTryoutModalEnabled(true);
                            }}
                          >
                            <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1 md:w-1">
                              <div className="flex items-center gap-3">
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReadStatus(tryout.id);
                                  }}
                                >
                                    {tryout.readStatus ? <EnvelopeOpenIcon className="w-4 h-4 text-[var(--muted)]" /> : <EnvelopeIcon className="w-4 h-4 text-[var(--primary)]" />}
                                </span>
                              </div>
                            </td>

                            <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1 md:w-1/6">
                              <div className="flex items-center gap-3">
                                <span>{tryout.athleteName}</span>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                              <div className="flex items-center gap-3">
                                {tryout.currentClub}
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/12">
                              {tryout.tryoutLevel}
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                              <div className="flex items-center gap-3">
                                {tryout.experienceProgram}
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/12">
                              <div className="flex items-center gap-3">
                                {tryout.experienceYears}
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                              <div className="flex items-center gap-3">
                                {new Date(tryout.athleteDOB).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                              <div className="flex items-center gap-3">
                                {new Date(tryout.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </td>

                            <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick();
                                }}
                                className={`confirm-delete-button cursor-pointer group relative inline-flex h-6 w-16 items-center justify-center rounded-full  ${enabled ? 'bg-red-600 hover:bg-red-500' : 'bg-[var(--background) hover:bg-[var(--muted)]/5'} ring-1 ring-[var(--border)]`}
                              >
                                <span className="text-xs text-white font-semibold">
                                  {enabled ? 'Confirm' : ''}
                                </span>
                                <span className="text-xs text-[var(--foreground)] group-hover:text-red-600 text-right-1 font-semibold">
                                  {!enabled ? 'Delete' : ''}
                                </span>
                              </button>
                            </td>
                          </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          ) : (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No tryouts available.</div>
          )}
        </div>
      </>
    )
  }