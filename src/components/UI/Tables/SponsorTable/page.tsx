"use client"

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import AddSponsor from '@/components/Form/AddSponsor/page';
import EditSponsor from '@/components/Form/EditSponsor/page';
import Modal from "@/components/UI/Modal/page";
import SponsorTableSkeleton from "./SponsorTableSkeleton";

type Sponsor = {
  id: number;
  organization: string;
  description: string;
  sponsorLevel: string;
  sponsorImgUrl: string;
  website: string;
};

interface Props {
    sponsors: Sponsor[];
    setSponsors: Dispatch<SetStateAction<Sponsor[]>>;
    isLoading?: boolean
}

export default function SponsorTable({ sponsors, setSponsors, isLoading }: Props) {

    const [editModal, setEditModal] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | -1>(-1);
    const [enabledStates, setEnabledStates] = useState<{ [key: number]: boolean }>({});
    const [deletingStates, setDeletingStates] = useState<{ [key: number]: boolean }>({});

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
    const deleteSponsor = async (sponsorId : number) => {
        setDeletingStates(prev => ({ ...prev, [sponsorId]: true }));
        try {
            const res = await fetch(`/api/sponsors/${sponsorId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.body) {
                    const newArray = sponsors.filter(sponsor => sponsor.id !== data.body);
                    setSponsors(newArray);
                } else {
                    console.error('Delete failed:', data);
                }
            } else {
                const errorData = await res.json();
                console.error('Delete failed:', errorData);
            }
        } catch (error) {
            console.error('Error deleting sponsor:', error);
        } finally {
            setDeletingStates(prev => {
                const newState = { ...prev };
                delete newState[sponsorId];
                return newState;
            });
            setEnabledStates(prev => {
                const newState = { ...prev };
                delete newState[sponsorId];
                return newState;
            });
        }
    }

    // Toggle Enabled States
    const toggleEnabled = (id: number) => {
        setEnabledStates(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
      <>
        {editModal && selectedSponsor !== -1 && selectedSponsor ? (
          <Modal title="Edit Sponsor" setModalEnable={setEditModal}>
            <EditSponsor sponsor={selectedSponsor} setSponsors={setSponsors} setModalEnable={setEditModal} />
          </Modal>
        ) : null}

        {addModal && (
          <Modal title="Add Sponsor" setModalEnable={setAddModal}>
            <AddSponsor setSponsors={setSponsors} setModalEnable={setAddModal} />
          </Modal>
        )}

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold text-[var(--foreground)]">Sponsors</h1>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
                type="button"
                className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                onClick={() => setAddModal(true)}
              >
                Add Sponsor
              </button>
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
                          <th className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4 sm:w-1/3 md:w-1/4">Organization</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Sponsor Level</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Description</th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                        </tr>
                      </thead>
                      <SponsorTableSkeleton />
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : sponsors.length > 0 && sponsors ? (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--card-bg)]">
                      <tr>
                        <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4 sm:w-1/3 md:w-1/4">
                          Organization
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Sponsor Level
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Description
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                      {sponsors.map((sponsor: Sponsor, idx: number) => {
                        const enabled = enabledStates[sponsor.id] || false;
                        const isDeleting = deletingStates[sponsor.id] || false;

                        const handleDeleteClick = async () => {
                          if (isDeleting) return;
                          if (!enabled) {
                            toggleEnabled(sponsor.id);
                          } else {
                            await deleteSponsor(sponsor.id);
                          }
                        };

                        return (
                          <tr
                            key={sponsor.id ?? idx}
                            className="transition-colors duration-150"
                          >
                            <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1/3 md:w-1/4 max-w-[220px]">
                              <div className="flex items-center gap-3">
                                <span>{sponsor.organization}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1/3 md:w-1/4 min-w-[160px]">
                              <div className="flex items-center gap-3">
                                {sponsor.sponsorLevel}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] max-w-xs truncate">
                                {sponsor.description}
                            </td>
                            <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6">
                                <button
                                    onClick={() => {
                                        handleDeleteClick();
                                    }}
                                    disabled={isDeleting}
                                    className={`confirm-delete-button relative inline-flex h-6 w-16 items-center justify-center rounded-full ${isDeleting ? 'bg-gray-400 cursor-not-allowed opacity-60' : enabled ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-[var(--background) hover:bg-[var(--muted)]/5 cursor-pointer'} ring-1 ring-[var(--border)]`}
                                >
                                    {isDeleting ? (
                                        <span className="text-xs text-white font-semibold">...</span>
                                    ) : (
                                        <>
                                            <span className="text-xs text-white font-semibold">
                                                {enabled ? 'Confirm' : ''}
                                            </span>
                                            <span className="text-xs text-[var(--foreground)] group-hover:text-red-600 text-right-1 font-semibold">
                                                {!enabled ? 'Delete' : ''}
                                            </span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                    setSelectedSponsor(sponsor);
                                    setEditModal(true);
                                    }}
                                    className="text-[var(--primary)] bg-[var(--card-bg)] hover:text-[var(--background)] hover:bg-[var(--primary)] cursor-pointer rounded-full ring-1 ring-[var(--border)] py-1 px-3">
                                    Edit<span className="sr-only">, {sponsor.organization}</span>
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
            <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No sponsors available.</div>
          )}
        </div>
      </>
    )
  }