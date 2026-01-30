"use client"

import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import Link from "next/link";

import EditUser from "@/components/Form/EditUser/page";
import Modal from "@/components/UI/Modal/page";
import { Role, RoleTag } from "@/components/UI/RoleTag/page";
import StatusTag from "@/components/UI/StatusTag/page";
import { User } from '@/lib/types';
import Image from "next/image";
import UserTableSkeleton from './UserTableSkeleton';

interface Props {
    users: (User & {
        images?: {
            staffUrl: string | null;
            athleteUrl: string | null;
            prospectUrl: string | null;
            alumniUrl: string | null;
        };
    })[];
    setUsers: Dispatch<SetStateAction<(User & {
        images?: {
            staffUrl: string | null;
            athleteUrl: string | null;
            prospectUrl: string | null;
            alumniUrl: string | null;
        };
    })[]>>;
    isLoading?: boolean
}

export default function UserTable({ users, setUsers, isLoading }: Props) {

    const router = useRouter();
    const [editModal, setEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(0);
    
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('All');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'name' | 'role'>('name');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Helper function to get user roles as array
    const getUserRoles = (user: User): Role[] => {
        const roles: Role[] = [];
        if (user.isCoach) roles.push(Role.Coach);
        if (user.isAthlete) roles.push(Role.Athlete);
        if (user.isProspect) roles.push(Role.Prospect);
        if (user.isAlumni) roles.push(Role.Alumni);
        return roles;
    };

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users;
        
        // Filter by search query (name)
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Filter by role (Athlete filter excludes alumni even if they have athlete tag)
        if (filterRole !== 'All') {
            filtered = filtered.filter(user => {
                const roles = getUserRoles(user);
                const hasRole = roles.some(role => role === filterRole);
                if (filterRole === Role.Athlete && user.isAlumni) {
                    return false;
                }
                return hasRole;
            });
        }
        
        // Filter by status
        if (filterStatus !== 'All') {
            filtered = filtered.filter(user => {
                if (filterStatus === 'Active') return user.isActive;
                if (filterStatus === 'Inactive') return !user.isActive;
                return true;
            });
        }
        
        // Sort users
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                // Sort by role - prioritize Coach, then Athlete, then Prospect, then Alumni
                const roleOrder: { [key in Role]: number } = {
                    [Role.Coach]: 1,
                    [Role.Athlete]: 2,
                    [Role.Prospect]: 3,
                    [Role.Alumni]: 4,
                };
                
                const rolesA = getUserRoles(a);
                const rolesB = getUserRoles(b);
                
                // Get the highest priority role for each user
                const priorityA = rolesA.length > 0 
                    ? Math.min(...rolesA.map(r => roleOrder[r] || 999))
                    : 999;
                const priorityB = rolesB.length > 0 
                    ? Math.min(...rolesB.map(r => roleOrder[r] || 999))
                    : 999;
                
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                // If same role priority, sort by name
                return a.name.localeCompare(b.name);
            }
        });
        
        return sorted;
    }, [users, searchQuery, filterRole, filterStatus, sortBy]);

    // Clear selections for items that are no longer in the filtered results
    useEffect(() => {
        const visibleIds = new Set(filteredAndSortedUsers.map(user => user.id));
        setSelectedUserIds(prev => {
            const newSet = new Set<number>();
            prev.forEach(id => {
                if (visibleIds.has(id)) {
                    newSet.add(id);
                }
            });
            return newSet;
        });
    }, [filteredAndSortedUsers]);

    // Handle checkbox selection
    const handleSelectUser = (userId: number) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedUserIds.size === filteredAndSortedUsers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(filteredAndSortedUsers.map(user => user.id)));
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedUserIds.size === 0 || isBulkDeleting) return;
        
        if (!confirm(`Are you sure you want to delete ${selectedUserIds.size} user(s)?`)) {
            return;
        }

        setIsBulkDeleting(true);
        const idsToDelete = Array.from(selectedUserIds);
        
        try {
            // Delete all selected items in parallel
            const deletePromises = idsToDelete.map(id => 
                fetch(`/api/users/${id}`, {
                    method: "DELETE",
                })
            );

            const results = await Promise.all(deletePromises);
            const successful = results.filter(res => res.ok);
            
            if (successful.length === idsToDelete.length) {
                // Remove deleted items from state
                setUsers(prev => prev.filter(user => !selectedUserIds.has(user.id)));
                setSelectedUserIds(new Set());
            } else {
                console.error('Some deletions failed');
                // Still remove successfully deleted items
                const failedIds = new Set(
                    idsToDelete.filter((_, index) => !results[index].ok)
                );
                setUsers(prev => prev.filter(user => !selectedUserIds.has(user.id) || failedIds.has(user.id)));
                setSelectedUserIds(failedIds);
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    // Toggle user status
    const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: newStatus }),
            });

            if (res.ok) {
                // Update the user in state
                setUsers(prev => prev.map(user => 
                    user.id === userId 
                        ? { ...user, isActive: newStatus }
                        : user
                ));
            } else {
                console.error('Failed to update user status');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    return (
      <>
        {editModal && selectedUser !== 0 && (
          <Modal title="Edit User" setModalEnable={setEditModal}>
            <EditUser userId={selectedUser} setModalEnable={setEditModal} />
          </Modal>
        )}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold text-[var(--foreground)]">Users</h1>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Link
                href="/admin/users/create-user"
                type="button"
                className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
              >
                Add user
              </Link>
            </div>
          </div>

          {/* Search, Filter and Sort Controls */}
          {users.length > 0 && (
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
                          placeholder="Search users..."
                          className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                      />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                      {/* Filter by Role */}
                      <div className="sm:w-48">
                          <label htmlFor="filter-role" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                              Filter by Role
                          </label>
                          <select
                              id="filter-role"
                              name="filter-role"
                              value={filterRole}
                              onChange={(e) => setFilterRole(e.target.value)}
                              className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                          >
                              <option value="All">All Roles</option>
                              <option value={Role.Coach}>Coach</option>
                              <option value={Role.Athlete}>Athlete</option>
                              <option value={Role.Prospect}>Prospect</option>
                              <option value={Role.Alumni}>Alumni</option>
                          </select>
                      </div>
                      
                      {/* Filter by Status */}
                      <div className="sm:w-48">
                          <label htmlFor="filter-status" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                              Filter by Status
                          </label>
                          <select
                              id="filter-status"
                              name="filter-status"
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                          >
                              <option value="All">All Status</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
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
                              onChange={(e) => setSortBy(e.target.value as 'name' | 'role')}
                              className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                          >
                              <option value="name">By Name</option>
                              <option value="role">By Role</option>
                          </select>
                      </div>
                  </div>
              </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedUserIds.size > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-md bg-[var(--card-bg)] p-4 border border-[var(--border)]">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                      {selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isBulkDeleting ? 'Deleting...' : `Delete ${selectedUserIds.size} user${selectedUserIds.size !== 1 ? 's' : ''}`}
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
                          <th className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4 sm:w-1/3 md:w-1/4">User</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Role</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Status</th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                        </tr>
                      </thead>
                      <UserTableSkeleton />
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : users.length > 0 ? (
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
                              checked={filteredAndSortedUsers.length > 0 && selectedUserIds.size === filteredAndSortedUsers.length}
                              onChange={handleSelectAll}
                              aria-label="Select all users"
                          />
                        </th>
                        <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4 sm:w-1/3 md:w-1/4">
                          User
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Role
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                      {filteredAndSortedUsers.length > 0 ? (
                        filteredAndSortedUsers.map((person) => (
                          <tr
                            key={person.id}
                            className="transition-colors duration-150 cursor-pointer"
                            onClick={() => router.push(`/admin/users/${person.id}`)}
                          >
                            <td className="relative w-12 px-6 sm:w-16 sm:px-8" onClick={(e) => e.stopPropagation()}>
                              <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                  checked={selectedUserIds.has(person.id)}
                                  onChange={() => handleSelectUser(person.id)}
                                  aria-label={`Select ${person.name}`}
                              />
                            </td>
                            <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1/3 md:w-1/4 max-w-[220px]">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                                  {(() => {
                                    const photoUrl =
                                      person.images?.staffUrl ||
                                      person.images?.athleteUrl ||
                                      person.images?.prospectUrl ||
                                      person.images?.alumniUrl ||
                                      null;
                                    const isDefault = !photoUrl;
                                    return (
                                      <Image
                                        src={photoUrl || "/logos/default-profile.png"}
                                        alt="User Photo"
                                        fill
                                        className={`object-cover ${isDefault ? "grayscale" : ""}`}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                      />
                                    );
                                  })()}
                                </div>
                                <span>{person.name}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1/3 md:w-1/4 min-w-[160px]">
                              <div className="flex items-center gap-3">
                                {person.isCoach && (
                                  <RoleTag role={Role.Coach} />
                                )}
                                {person.isAthlete && (!person.isAlumni || person.isProspect) && (
                                  <RoleTag role={Role.Athlete} />
                                )}
                                {person.isProspect && (
                                  <RoleTag role={Role.Prospect} />
                                )}
                                {person.isAlumni && (
                                  <RoleTag role={Role.Alumni} />
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]" onClick={(e) => e.stopPropagation()}>
                                <StatusTag 
                                    active={person.isActive} 
                                    onClick={() => handleToggleStatus(person.id, person.isActive)}
                                />
                              </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(person.id);
                                  setEditModal(true);
                                }}
                                className="text-[var(--primary)] bg-[var(--card-bg)] hover:text-[var(--background)] hover:bg-[var(--primary)] cursor-pointer rounded-full ring-1 ring-[var(--border)] py-1 px-3">
                                Edit<span className="sr-only">, {person.name}</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--muted)]">
                            No users found matching your filters.
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
            <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No users available.</div>
          )}
        </div>
      </>
    )
  }