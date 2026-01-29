"use client"

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import Modal from "@/components/UI/Modal/page";
import TryoutsTableSkeleton from "@/components/UI/Tables/TryoutsTable/TryoutsTableSkeleton";

import TryoutDisplay from '@/components/Layout/Admin/TryoutDisplay/page';
import { formatFullDate } from '@/lib/utils';
import { EnvelopeIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';

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
    const [deletingStates, setDeletingStates] = useState<{ [key: number]: boolean }>({});
    const [selectedTryout, setSelectedTryout] = useState<Tryout | null>(null);
    const [tryoutModalEnabled, setTryoutModalEnabled] = useState(false);
    
    // Search, filter, and sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'name' | 'tryoutLevel' | 'experience' | 'dateOfBirth' | 'created'>('created');
    const [selectedTryoutIds, setSelectedTryoutIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Get unique tryout levels for filter
    const uniqueLevels = useMemo(() => {
        const levels = new Set<string>();
        tryouts.forEach(tryout => {
            if (tryout.tryoutLevel && tryout.tryoutLevel.trim() !== '') {
                levels.add(tryout.tryoutLevel);
            }
        });
        return Array.from(levels).sort();
    }, [tryouts]);

    // Filter and sort tryouts
    const filteredAndSortedTryouts = useMemo(() => {
        let filtered = tryouts;
        
        // Filter by search query (name)
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(tryout => 
                tryout.athleteName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Filter by level
        if (filterLevel !== 'All') {
            filtered = filtered.filter(tryout => tryout.tryoutLevel === filterLevel);
        }
        
        // Sort tryouts
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'name') {
                return a.athleteName.localeCompare(b.athleteName);
            } else if (sortBy === 'tryoutLevel') {
                const levelA = a.tryoutLevel || '';
                const levelB = b.tryoutLevel || '';
                return levelA.localeCompare(levelB);
            } else if (sortBy === 'experience') {
                return (a.experienceYears || 0) - (b.experienceYears || 0);
            } else if (sortBy === 'dateOfBirth') {
                return new Date(a.athleteDOB).getTime() - new Date(b.athleteDOB).getTime();
            } else {
                // Default: sort by created (newest first)
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
        
        return sorted;
    }, [tryouts, searchQuery, filterLevel, sortBy]);

    // Clear selections for items that are no longer in the filtered results
    useEffect(() => {
        const visibleIds = new Set(filteredAndSortedTryouts.map(tryout => tryout.id));
        setSelectedTryoutIds(prev => {
            const newSet = new Set<number>();
            prev.forEach(id => {
                if (visibleIds.has(id)) {
                    newSet.add(id);
                }
            });
            return newSet;
        });
    }, [filteredAndSortedTryouts]);

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
        setDeletingStates(prev => ({ ...prev, [tryoutId]: true }));
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
        } finally {
            setDeletingStates(prev => {
                const newState = { ...prev };
                delete newState[tryoutId];
                return newState;
            });
            setEnabledStates(prev => {
                const newState = { ...prev };
                delete newState[tryoutId];
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

    // Handle checkbox selection
    const handleSelectTryout = (tryoutId: number) => {
        setSelectedTryoutIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tryoutId)) {
                newSet.delete(tryoutId);
            } else {
                newSet.add(tryoutId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedTryoutIds.size === filteredAndSortedTryouts.length) {
            setSelectedTryoutIds(new Set());
        } else {
            setSelectedTryoutIds(new Set(filteredAndSortedTryouts.map(tryout => tryout.id)));
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedTryoutIds.size === 0 || isBulkDeleting) return;
        
        if (!confirm(`Are you sure you want to delete ${selectedTryoutIds.size} tryout(s)?`)) {
            return;
        }

        setIsBulkDeleting(true);
        const idsToDelete = Array.from(selectedTryoutIds);
        
        try {
            // Delete all selected items in parallel
            const deletePromises = idsToDelete.map(id => 
                fetch(`/api/tryouts/${id}`, {
                    method: "DELETE",
                })
            );

            const results = await Promise.all(deletePromises);
            const successful = results.filter(res => res.ok);
            
            if (successful.length === idsToDelete.length) {
                // Remove deleted items from state
                setTryouts(prev => prev.filter(tryout => !selectedTryoutIds.has(tryout.id)));
                setSelectedTryoutIds(new Set());
            } else {
                console.error('Some deletions failed');
                // Still remove successfully deleted items
                const failedIds = new Set(
                    idsToDelete.filter((_, index) => !results[index].ok)
                );
                setTryouts(prev => prev.filter(tryout => !selectedTryoutIds.has(tryout.id) || failedIds.has(tryout.id)));
                setSelectedTryoutIds(failedIds);
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
        } finally {
            setIsBulkDeleting(false);
        }
    };

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
          </div>

          {/* Search, Filter and Sort Controls */}
          {tryouts.length > 0 && (
              <div className="mt-6 flex flex-col gap-4">
                  {/* Search by Name */}
                  <div className="sm:w-full max-w-md">
                      <label htmlFor="search" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                          Search by Name
                      </label>
                      <input
                          type="text"
                          id="search"
                          name="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search tryouts..."
                          className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                      />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                      {/* Filter by Level */}
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
                              {uniqueLevels.map(level => (
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
                              onChange={(e) => setSortBy(e.target.value as 'name' | 'tryoutLevel' | 'experience' | 'dateOfBirth' | 'created')}
                              className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                          >
                              <option value="created">By Created (Default)</option>
                              <option value="name">By Name</option>
                              <option value="tryoutLevel">By Tryout Level</option>
                              <option value="experience">By Experience</option>
                              <option value="dateOfBirth">By Date of Birth</option>
                          </select>
                      </div>
                  </div>
              </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedTryoutIds.size > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-md bg-[var(--card-bg)] p-4 border border-[var(--border)]">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                      {selectedTryoutIds.size} tryout{selectedTryoutIds.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isBulkDeleting ? 'Deleting...' : `Delete ${selectedTryoutIds.size} tryout${selectedTryoutIds.size !== 1 ? 's' : ''}`}
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
          ) : filteredAndSortedTryouts.length > 0 ? (
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
                              checked={filteredAndSortedTryouts.length > 0 && selectedTryoutIds.size === filteredAndSortedTryouts.length}
                              onChange={handleSelectAll}
                              aria-label="Select all tryouts"
                          />
                        </th>
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
                      {filteredAndSortedTryouts.length > 0 ? (
                        filteredAndSortedTryouts.map((tryout: Tryout, idx: number) => {
                        const enabled = enabledStates[tryout.id] || false;
                        const isDeleting = deletingStates[tryout.id] || false;

                        const handleDeleteClick = async () => {
                          if (isDeleting) return;
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
                            <td className="relative w-12 px-6 sm:w-16 sm:px-8" onClick={(e) => e.stopPropagation()}>
                              <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                  checked={selectedTryoutIds.has(tryout.id)}
                                  onChange={() => handleSelectTryout(tryout.id)}
                                  aria-label={`Select ${tryout.athleteName}`}
                              />
                            </td>
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
                                {formatFullDate(tryout.athleteDOB)}
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                              <div className="flex items-center gap-3">
                                {formatFullDate(tryout.createdAt)}
                              </div>
                            </td>

                            <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
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
                            </td>
                          </tr>
                        );
                      })
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-6 py-8 text-center text-sm text-[var(--muted)]">
                            No tryouts found matching your filters.
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
            <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No tryouts available.</div>
          )}
        </div>
      </>
    )
  }