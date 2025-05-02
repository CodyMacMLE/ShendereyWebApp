'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Modal from "@/components/UI/Modal/page";

import { RoleTag, Role } from "@/components/UI/RoleTag/page";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { FaInstagram } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import EditUser from "@/components/Form/EditUser/page";


type UserData = {
    id: number,
    name: string,
    isActive: boolean,
    isAthlete: boolean,
    isAlumni: boolean,
    isProspect: boolean,
    isCoach: boolean,
    isScouted: boolean,
    createdAt: Date,
    updatedAt: Date,
    images: {
        staffUrl: string,
        athleteUrl: string,
        prospectUrl: string,
        alumniUrl: string,
    },
    coach?: {
        id: number,
        title: string,
        description: string,
        isSeniorStaff: boolean,
    },
    athlete?: {
        id: number,
        level: string,
        alumni?: {
            school: string,
            year: Date,
            description: string,
        },
        prospect?: {
            graduationYear: Date,
            gpa: number,
            institution: string,
            major: string,
            instagramLink: string,
            youtubeLink: string,
            description: string,
        },
    }
}

export default function DisplayUser({ user } : { user : UserData }) {

    const router = useRouter();
    const [deleteModal, setDeleteModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    const deleteUser = async () => {
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                const data = await res.json();
                router.push(data.redirect);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    }

    return (
        <div className="px-7">

            {editModal && (
                <Modal title="Edit User" setModalEnable={setEditModal}>
                    <EditUser userId={user.id} setModalEnable={setEditModal}/>
                </Modal>
            )}

            {deleteModal && (
                <Modal title="Delete User" setModalEnable={setDeleteModal}>
                    <div className="flex gap-5 py-8 max-w-[500px]">
                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                            <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                        </div>
                        <p>Are you sure you want to delete this user? All of the data will be permanently removed from our servers forever. This action cannot be undone.</p>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={() => {setDeleteModal(false); deleteUser();}}
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            data-autofocus
                            onClick={() => setDeleteModal(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* User Info */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">

                {/* Left */}
                <div className="flex flex-col justify-between items-center p-5 sm:px-0 ring-1 ring-[var(--border)] rounded-xl bg-[var(--card-bg)]">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex flex-col items-center text-center">
                            {user.images.staffUrl ? (
                                <div className="relative mt-3">
                                    <div className="h-[150px] w-[150px] rounded-full overflow-hidden ring-1 ring-[var(--border)]">
                                        <Image
                                            src={user.images.staffUrl}
                                            alt="Staff Image"
                                            width={150}
                                            height={150}
                                            className="object-cover"
                                        />
                                    </div>
                                
                                    {/* Status Icon */}
                                    <div className="absolute bottom-5 right-5 translate-x-1/2 translate-y-1/2 w-8 h-8 bg-[var(--card-bg)] ring-1 ring-[var(--border)] flex justify-center items-center rounded-full">
                                        {user.isActive ? (
                                            <EyeIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <EyeSlashIcon className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </div>
                            ) : user.images.athleteUrl ? (
                                <div className="relative mt-3">
                                    <div className="h-[150px] w-[150px] rounded-full overflow-hidden ring ring-[var(--border)]">
                                        <Image
                                            src={user.images.athleteUrl}
                                            alt="Athlete Image"
                                            width={150}
                                            height={150}
                                            className="object-cover"
                                        />
                                    </div>
                                
                                    {/* Status Icon */}
                                    <div className="absolute bottom-5 right-5 translate-x-1/2 translate-y-1/2 w-8 h-8 bg-[var(--card-bg)] ring ring-[var(--border)] flex justify-center items-center rounded-full">
                                        {user.isActive ? (
                                            <EyeIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <EyeSlashIcon className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative mt-3">
                                    <div className='flex items-center justify-center bg-[var(--card-bg)] ring ring-[var(--border)] mt-8 h-50 w-50 rounded-full'>
                                        <UserCircleIcon aria-hidden="true" className="size-20 text-[var(--muted)]" />
                                    </div> 

                                    {/* Status Icon */}
                                    <div className="absolute bottom-5 right-5 translate-x-1/2 translate-y-1/2 w-8 h-8 bg-[var(--card-bg)] ring ring-[var(--border)] flex justify-center items-center rounded-full">
                                        {user.isActive ? (
                                            <EyeIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <EyeSlashIcon className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </div>
                            )}

                            
                        </div>

                        {/* Name, Active Edit */}
                        <div className="mt-5 px-5">
                                <h1 className="text-[var(--foreground)] font-bold text-3xl text-center">{user.name}</h1>
                        </div>

                        {/* Roles */}
                        <div className="flex gap-2 mt-2">
                            {user.isCoach && (
                                <RoleTag role={Role.Coach} />
                            )}
                            {user.isAthlete && (
                                <RoleTag role={Role.Athlete} />
                            )}
                            {user.isProspect && (
                                <RoleTag role={Role.Prospect} />
                            )}
                            {user.isAlumni && (
                                <RoleTag role={Role.Alumni} />
                            )}
                        </div>
                    </div>
                    
                    {/* Delete User */}  
                    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-base font-semibold text-[var(--foreground)]">Delete account</h2>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                            No longer want to use our service? You can delete your account here. This action is not reversible.
                            All information related to this account will be deleted permanently.
                        </p>
                        
                        <button
                            type="button"
                            onClick={() => setDeleteModal(true)}
                            className="mt-6 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 w-full sm:w-auto"
                        >
                            Delete User
                        </button>
                    </div>

                </div>
                
                {/* Right */}
                <div className="shadow-sm ring-1 ring-[var(--border)] rounded-xl md:col-span-2 bg-[var(--card-bg)]">
                    <div className="px-4 py-6 sm:p-8">
                        
                        <div className="flex justify-between">
                            <h3 className="block text-2xl font-bold text-[var(--foreground)]">
                                User Information
                            </h3>
                            <span className="text-[var(--primary)] hover:text-[var(--primary-hover)] cursor-pointer" onClick={() => setEditModal(true)}>
                                Edit
                            </span>
                        </div>
                        

                        {/* Staff Information */}
                        {user.isCoach && (
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">   

                            {/* Title */}
                            <h3 className="col-span-full flex justify-between mt-5 py-5 border-t border-[var(--border)] text-xl font-bold text-[var(--foreground)]">
                                    Staff Information
                            </h3>

                            {/* Info */}
                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Title
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.coach?.title ? user.coach?.title : "None"}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Senior Staff
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.coach?.isSeniorStaff ? "True" : "False"}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Description
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.coach?.description ? user.coach?.description : "None"}
                            </p>

                        </div>
                        )}

                        {/* Athlete Information */}
                        {user.isAthlete && (
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">   

                            {/* Title */}
                            <h3 className="col-span-full flex justify-between mt-5 py-5 border-t border-[var(--border)] text-xl font-bold text-[var(--foreground)]">
                                    Athlete Information
                            </h3>



                            {/* Info */}
                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Level
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.athlete?.level}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Photo
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.images.athleteUrl ? (
                                    <Image 
                                        src={user.images.athleteUrl} 
                                        alt="Athlete Image" 
                                        height={200} 
                                        width={200} 
                                        className="h-70 w-50 rounded-lg"
                                    />
                                ) : (
                                    <div className='flex items-center justify-center bg-[var(--card-bg)] ring ring-[var(--border)] mt-8 h-70 w-50 rounded-full'>
                                        <UserCircleIcon aria-hidden="true" className="size-20 text-[var(--muted)]" />
                                    </div>
                                )}
                            </p>

                        </div>
                        )}

                        {/* Prospect Information */}
                        {user.isProspect && (
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">   

                            {/* Title */}
                            <h3 className="col-span-full flex justify-between mt-5 py-5 border-t border-[var(--border)] text-xl font-bold text-[var(--foreground)]">
                                    Prospect Information
                            </h3>

                            {/* Info */}
                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Graduation Year
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.athlete?.prospect?.graduationYear ? new Date(user.athlete.prospect.graduationYear).getUTCFullYear() : 'None'}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                GPA
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.athlete?.prospect?.gpa ? `${user.athlete?.prospect?.gpa}` : "None"}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Preferred Major
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.athlete?.prospect?.major ? user.athlete?.prospect?.major : "None"}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Links
                            </h4>
                            <div className="col-span-2 mb-5 lg:mb-0 space-y-2">
                                {/* Instagram */}
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {user.athlete?.prospect?.instagramLink ? (
                                    <>
                                        <FaInstagram className="h-4 w-4 shrink-0 text-[var(--foreground)]" />
                                        <span className="text-[var(--foreground)] truncate">
                                        /{user.athlete.prospect.instagramLink}
                                        </span>
                                    </>
                                    ) : (
                                    <span className="text-[var(--foreground)]">None</span>
                                    )}
                                </div>

                                {/* YouTube */}
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {user.athlete?.prospect?.youtubeLink ? (
                                    <>
                                        <AiOutlineYoutube className="h-4 w-4 shrink-0 text-[var(--foreground)]" />
                                        <span className="text-[var(--foreground)] truncate">
                                        /{user.athlete.prospect.youtubeLink}
                                        </span>
                                    </>
                                    ) : (
                                    <span className="text-[var(--foreground)]">None</span>
                                    )}
                                </div>
                            </div>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Photo
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.images.prospectUrl ? (
                                    <Image 
                                        src={user.images.prospectUrl} 
                                        alt="Athlete Image" 
                                        height={200} 
                                        width={200} 
                                        className="h-70 w-50 rounded-lg"
                                    />
                                ) : (
                                    <div className='flex items-center justify-center bg-[var(--card-bg)] ring ring-[var(--border)] mt-8 h-70 w-50 rounded-full'>
                                        <UserCircleIcon aria-hidden="true" className="size-20 text-[var(--muted)]" />
                                    </div>
                                )}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Description
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.athlete?.prospect?.description ? user.athlete?.prospect?.description : "None"}
                            </p>

                        </div>
                        )}

                        {/* Alumni Information */}
                        {user.isAlumni && (
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">   

                            {/* Title */}
                            <h3 className="col-span-full flex justify-between mt-5 py-5 border-t border-[var(--border)] text-xl font-bold text-[var(--foreground)]">
                                    Alumni Information
                            </h3>

                            {/* Info */}
                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Year
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.athlete?.alumni?.year ? new Date(user.athlete.alumni.year).getUTCFullYear() : 'None'}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                School
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.athlete?.alumni?.school ? user.athlete?.alumni?.school : "None"}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Photo
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.images.alumniUrl ? (
                                    <Image 
                                        src={user.images.alumniUrl} 
                                        alt="Athlete Image" 
                                        height={200} 
                                        width={200} 
                                        className="h-70 w-50 rounded-lg"
                                    />
                                ) : (
                                    <div className='flex items-center justify-center bg-[var(--card-bg)] ring ring-[var(--border)] mt-8 h-70 w-50 rounded-full'>
                                        <UserCircleIcon aria-hidden="true" className="size-20 text-[var(--muted)]" />
                                    </div>
                                )}
                            </p>

                            <h4 className="col-span-2 block text-md font-bold text-[var(--foreground)]">
                                Description
                            </h4>
                            <p className="col-span-2 text-[var(--foreground)] mb-5 lg:mb-0">
                                {user.athlete?.alumni?.description ? user.athlete?.alumni?.description : "None"}
                            </p>

                        </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    )
}