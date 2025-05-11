"use client"

import { useRouter } from "next/navigation";
import { useState } from 'react';

import Link from "next/link";

import UserTableSkeleton from './UserTableSkeleton';
import { Role, RoleTag } from "@/components/UI/RoleTag/page";
import Image from "next/image";
import StatusTag from "@/components/UI/StatusTag/page";
import Modal from "@/components/UI/Modal/page";
import EditUser from "@/components/Form/EditUser/page";

type User = {
  id: number;
  name: string;
  isActive: boolean;
  isCoach: boolean;
  isAthlete: boolean;
  isProspect: boolean;
  isScouted: boolean;
  isAlumni: boolean;
  createdAt: Date;
  updatedAt: Date;
  images?: {
    staffUrl: string | null;
    athleteUrl: string | null;
    prospectUrl: string | null;
    alumniUrl: string | null;
  };
};

interface Props {
    users: User[];
    isLoading?: boolean
}

export default function UserTable({ users, isLoading }: Props) {

    const router = useRouter();
    const [editModal, setEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(0);

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

          {isLoading ? (
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-[var(--border)]">
                      <thead className="bg-[var(--card-bg)]">
                        <tr>
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
                      {users.map((person: User) => (
                          <tr
                            key={person.id}
                            className="transition-colors duration-150 cursor-pointer"
                            onClick={() => router.push(`/admin/users/${person.id}`)}
                          >
                            <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1/3 md:w-1/4 max-w-[220px]">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                                  <Image
                                    src={
                                      person.images?.staffUrl
                                        ? person.images.staffUrl
                                        : person.images?.athleteUrl
                                        ? person.images.athleteUrl
                                        : person.images?.prospectUrl
                                        ? person.images.prospectUrl
                                        : person.images?.alumniUrl
                                        ? person.images.alumniUrl
                                        : "/default-user-icon.png"
                                    }
                                    alt="User Photo"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                                </div>
                                <span>{person.name}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1/3 md:w-1/4 min-w-[160px]">
                              <div className="flex items-center gap-3">
                                {person.isCoach && (
                                  <RoleTag role={Role.Coach} />
                                )}
                                {person.isAthlete && (
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
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                <StatusTag active={person.isActive} />
                              </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
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
                      ))}
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