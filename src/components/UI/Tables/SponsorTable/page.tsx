"use client"

import { Dispatch, SetStateAction, useEffect, useState, useMemo } from 'react';

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

const sponsorLevels = [
    "Diamond",
    "Platinum",
    "Gold",
    "Silver",
    "Affiliate"
];

// Define level order for sorting
const levelOrder: { [key: string]: number } = {
    "Diamond": 1,
    "Platinum": 2,
    "Gold": 3,
    "Silver": 4,
    "Affiliate": 5
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
    const [filterLevel, setFilterLevel] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'name' | 'level'>('level');
    const [selectedSponsorIds, setSelectedSponsorIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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
                    // Remove from selected if it was selected
                    setSelectedSponsorIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(data.body);
                        return newSet;
                    });
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

    // Filter and sort sponsors
    const filteredAndSortedSponsors = useMemo(() => {
        let filtered = sponsors;
        
        // Filter by sponsor level
        if (filterLevel !== 'All') {
            filtered = sponsors.filter(sponsor => sponsor.sponsorLevel === filterLevel);
        }
        
        // Sort sponsors
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'name') {
                return a.organization.localeCompare(b.organization);
            } else {
                // Sort by level (Diamond -> Platinum -> Gold -> Silver -> Affiliate)
                const orderA = levelOrder[a.sponsorLevel] || 999;
                const orderB = levelOrder[b.sponsorLevel] || 999;
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                // If same level, sort by name
                return a.organization.localeCompare(b.organization);
            }
        });
        
        return sorted;
    }, [sponsors, filterLevel, sortBy]);

    // Clear selections for items that are no longer in the filtered results
    useEffect(() => {
        const visibleIds = new Set(filteredAndSortedSponsors.map(sponsor => sponsor.id));
        setSelectedSponsorIds(prev => {
            const newSet = new Set<number>();
            prev.forEach(id => {
                if (visibleIds.has(id)) {
                    newSet.add(id);
                }
            });
            return newSet;
        });
    }, [filteredAndSortedSponsors]);

    // Handle checkbox selection
    const handleSelectSponsor = (sponsorId: number) => {
        setSelectedSponsorIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sponsorId)) {
                newSet.delete(sponsorId);
            } else {
                newSet.add(sponsorId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedSponsorIds.size === filteredAndSortedSponsors.length) {
            setSelectedSponsorIds(new Set());
        } else {
            setSelectedSponsorIds(new Set(filteredAndSortedSponsors.map(sponsor => sponsor.id)));
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedSponsorIds.size === 0 || isBulkDeleting) return;
        
        if (!confirm(`Are you sure you want to delete ${selectedSponsorIds.size} sponsor(s)?`)) {
            return;
        }

        setIsBulkDeleting(true);
        const idsToDelete = Array.from(selectedSponsorIds);
        
        try {
            // Delete all selected items in parallel
            const deletePromises = idsToDelete.map(id => 
                fetch(`/api/sponsors/${id}`, {
                    method: "DELETE",
                })
            );

            const results = await Promise.all(deletePromises);
            const successful = results.filter(res => res.ok);
            
            if (successful.length === idsToDelete.length) {
                // Remove deleted items from state
                setSponsors(prev => prev.filter(sponsor => !selectedSponsorIds.has(sponsor.id)));
                setSelectedSponsorIds(new Set());
            } else {
                console.error('Some deletions failed');
                // Still remove successfully deleted items
                const failedIds = new Set(
                    idsToDelete.filter((_, index) => !results[index].ok)
                );
                setSponsors(prev => prev.filter(sponsor => !selectedSponsorIds.has(sponsor.id) || failedIds.has(sponsor.id)));
                setSelectedSponsorIds(failedIds);
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
        } finally {
            setIsBulkDeleting(false);
        }
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

          {/* Filter and Sort Controls */}
          {sponsors.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  {/* Filter by Sponsor Level */}
                  <div className="sm:w-48">
                      <label htmlFor="filter-level" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                          Filter by Level
                      </label>
                      <select
                          id="filter-level"
                          name="filter-level"
                          value={filterLevel}
                          onChange={(e) => setFilterLevel(e.target.value)}
                          className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                      >
                          <option value="All">All Levels</option>
                          {sponsorLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                          ))}
                      </select>
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div className="sm:w-48">
                      <label htmlFor="sort" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                          Sort By
                      </label>
                      <select
                          id="sort"
                          name="sort"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'name' | 'level')}
                          className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                      >
                          <option value="level">By Level (Default)</option>
                          <option value="name">By Name</option>
                      </select>
                  </div>
              </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedSponsorIds.size > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-md bg-[var(--card-bg)] p-4 border border-[var(--border)]">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                      {selectedSponsorIds.size} sponsor{selectedSponsorIds.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isBulkDeleting ? 'Deleting...' : `Delete ${selectedSponsorIds.size} sponsor${selectedSponsorIds.size !== 1 ? 's' : ''}`}
                  </button>
              </div>
          )}

          {isLoading ? (
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-[var(--border)]">
                      <thead className="bg-[var(--card-bg)]">
                        <tr>
                          <th className="relative w-12 px-6 sm:w-16 sm:px-8"></th>
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
                        <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                          <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                              checked={filteredAndSortedSponsors.length > 0 && selectedSponsorIds.size === filteredAndSortedSponsors.length}
                              onChange={handleSelectAll}
                              aria-label="Select all sponsors"
                          />
                        </th>
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
                      {filteredAndSortedSponsors.length > 0 ? (
                        filteredAndSortedSponsors.map((sponsor: Sponsor, idx: number) => {
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
                              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                    checked={selectedSponsorIds.has(sponsor.id)}
                                    onChange={() => handleSelectSponsor(sponsor.id)}
                                    aria-label={`Select ${sponsor.organization}`}
                                />
                              </td>
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
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--muted)]">
                            No sponsors found matching your filter.
                          </td>
                        </tr>
                      )}
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