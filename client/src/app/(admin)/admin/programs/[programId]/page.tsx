"use client"

import { redirect, useParams } from "next/navigation"
import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";

import Modal from "@/components/UI/Modal/page";
import ErrorModal from "@/components/UI/ErrorModal/page";
import Dropdown from "@/components/UI/Dropdown/page";

import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type Program = {
    id: number,
    name: string,
    category: string,
    description: string,
    length: number,
    ages: string,
    programImgUrl: string,
}

type Group = {
    id: number,
    program: number,
    day: string,
    startTime: string,
    endTime: string,
    startDate: Date,
    endDate: Date,
    active: boolean
    coaches: [
        {
            name: string,
        }
    ]
}

type Coach = {
    id: number;
    name: string;
}

const categories = [
    "Recreational",
    "Competitive",
]

const day = [
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
    "Sunday"
]

export default function Program() {

    // Parameters
    const { programId } = useParams();

    // Data
    const [program, setProgram] = useState<Program | null>(null)
    const [groups, setGroups] = useState<Group[] | null>(null)
    const [coaches, setCoaches] = useState<Coach[] | null>(null)

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [editModal, setEditModal] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [formErrors, setFormErrors] = useState<{msg: string}[]>([]);

    // Program Form
    const [programName, setProgramName] = useState(program ? program.name : ''); 
    const [programCategory, setProgramCategory] = useState(
        program
            ? program.category.charAt(0).toUpperCase() + program.category.slice(1).toLowerCase()
            : 'Recreational'
    );
    const [programDescription, setProgramDescription] = useState(program ? program.description : ''); 
    const [programLength, setProgramLength] = useState(program ? program.length : '');
    const [programAges, setProgramAges] = useState(program ? program.ages : ''); 
    const [programImgFile, setProgramImgFile] = useState<File | null>(null); 

    // Group Form
    const [groupDay, setGroupDay] = useState(day[0]);
    const [groupStartTime, setGroupStartTime] = useState<string>('15:00');
    const [groupEndTime, setGroupEndTime] = useState<string>('16:00');
    const [groupStartDate, setGroupStartDate] = useState<Date>(new Date());
    const [groupEndDate, setGroupEndDate] = useState<Date>(new Date());
    const [groupCoach, setGroupCoach] = useState('');
     

    // Fetching
    const fetchProgram = async () => {
        try {
            const res = await fetch(`/api/programs/${programId}`,{
                method: 'GET'
            });
    
            if (res.ok) {
                const data = await res.json();
                setProgram(data.body);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch(`/api/groups/${programId}`,{
                method: 'GET'
            });

            if (res.ok) {
                const data = await res.json();
                setGroups(data.body);
            }
            
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const fetchCoaches = async () => {
        try {
            const res = await fetch(`/api/coach`, {
                method: 'GET'
            });

            if (res.ok) {
                const data = await res.json();
                const coachNames = data.body.map((coach: { id: number; name: string }) => ({
                    id: coach.id,
                    name: coach.name
                }));
                setCoaches(coachNames);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const fetchData = async () => {
        try {
            await Promise.all([
                fetchProgram(),
                fetchGroups(),
                fetchCoaches()
            ]);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }

    // Reload state

    // On load
    useEffect(() => {
        fetchData(); 
    }, []);

    // Sync form state with program when it loads
    useEffect(() => {
        if (program) {
            setProgramName(program.name);
            setProgramCategory(program.category);
            setProgramDescription(program.description);
            setProgramLength(program.length);
            setProgramAges(program.ages);
        }
    }, [program]);

    // On data change
    useEffect(() => { 
        console.log(coaches)
    }, [program, groups, coaches]);

    // Handle Submit
    const handleEditProgram = async () => {
        let errors = [];

        if (!programName.trim()) errors.push({msg: "Program name is required"});
        let parsedCategory = programCategory === 'Competitive' ? 'competitive' : 'recreational'
        if (!programDescription.trim()) errors.push({msg: "Program description is required"});
        if (!programLength) errors.push({msg: "Program length is required"});
        if (!programAges.trim()) errors.push({msg: "Program ages are required"});

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }



        try {
            const formData = new FormData();
            formData.append('name', programName);
            formData.append('category', parsedCategory);
            formData.append('ages', programAges.toString());
            formData.append('length', programLength.toString());
            formData.append('description', programDescription);

            if (programImgFile) {
                formData.append('programImgFile', programImgFile);
            }

            const res = await fetch(`/api/programs/${programId}`,{
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setProgram(data.body);
            }
            
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setEditModal(false);
        }

    }

    const handleDeleteProgram = async () => {
        console.log("deleting...")
    }

    const handleAddGroup = async () => {

    }

    return (
        <>
            {addModal && (
                <Modal title="Add Group" setModalEnable={setAddModal}>
                    <div>
                    {formErrors.length > 0 && (
                        <div className="px-4 pt-6 sm:px-8">
                        <ErrorModal errors={formErrors} />
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); handleAddGroup(); }}>
                        <div className="space-y-12">
                            <div className="border-b border-[var(--border)] pb-12">
                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12 sm:min-w-4xl">

                                    {/* Day */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="group-day" className="block text-sm/6 font-medium text-[var(--foreground)]">Category</label>
                                        <Dropdown items={day} setItem={setGroupDay} currentItem={groupDay}/>
                                    </div>

                                    {/* Coach */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="group-coach" className="block text-sm/6 font-medium text-[var(--foreground)]">Coach</label>
                                        <Dropdown
                                            items={coaches ? coaches.map(coach => coach.name) : []}
                                            setItem={setGroupCoach}
                                            currentItem={groupCoach}
                                        />
                                    </div>

                                    {/* Start Time */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="group-start-time" className="block text-sm/6 font-medium text-[var(--foreground)]">Start Time</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                  id="group-start-time"
                                                  name="group-start-time"
                                                  type="time"
                                                  value={groupStartTime}
                                                  onChange={(e) => setGroupStartTime(e.target.value)}
                                                  className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                  required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* End Time */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="group-end-time" className="block text-sm/6 font-medium text-[var(--foreground)]">End Time</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                  id="group-end-time"
                                                  name="group-end-time"
                                                  type="time"
                                                  value={groupEndTime}
                                                  onChange={(e) => setGroupEndTime(e.target.value)}
                                                  className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                  required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Start Date */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="group-start-date" className="block text-sm/6 font-medium text-[var(--foreground)]">Start Date</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                    id="group-start-date"
                                                    name="group-start-date"
                                                    type="date"
                                                    value={groupStartDate.toISOString().split('T')[0]}
                                                    onChange={(e) => setGroupStartDate(new Date(e.target.value))}
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* End Date */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="group-stendart-date" className="block text-sm/6 font-medium text-[var(--foreground)]">End Date</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                    id="group-end-date"
                                                    name="group-end-date"
                                                    type="date"
                                                    value={groupEndDate.toISOString().split('T')[0]}
                                                    onChange={(e) => setGroupEndDate(new Date(e.target.value))}
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-x-6">
                            <button
                                type="button"
                                onClick={() => {setAddModal(false);}}
                                className="rounded-md py-2 text-sm font-semibold text-red-600 hover:text-red-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                            >
                                Save
                            </button>
                        </div>

                    </form>
                </div>
                </Modal>
            )}

            {editModal && (
                <Modal title="Add Program" setModalEnable={setEditModal}>
                <div>
                    {formErrors.length > 0 && (
                        <div className="px-4 pt-6 sm:px-8">
                        <ErrorModal errors={formErrors} />
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); handleEditProgram(); }}>
                        <div className="space-y-12">
                            <div className="border-b border-[var(--border)] pb-12">
                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12 sm:min-w-4xl">

                                    {/* Name */}
                                    <div className="sm:col-span-4">
                                        <label htmlFor="program-name" className="block text-sm/6 font-medium text-[var(--foreground)]">Name</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                    id="program-name"
                                                    name="program-name"
                                                    type="text"
                                                    value={programName}
                                                    onChange={(e) => setProgramName(e.target.value)}
                                                    placeholder="Crickets"
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="program-category" className="block text-sm/6 font-medium text-[var(--foreground)]">Category</label>
                                        <Dropdown items={categories} setItem={setProgramCategory} currentItem={programCategory}/>
                                    </div>


                                    {/* Ages */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="program-name" className="block text-sm/6 font-medium text-[var(--foreground)]">Ages</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                    id="program-ages"
                                                    name="program-ages"
                                                    type="text"
                                                    value={programAges}
                                                    onChange={(e) => setProgramAges(e.target.value)}
                                                    placeholder="4 - 5 years"
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Length */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="program-name" className="block text-sm/6 font-medium text-[var(--foreground)]">Length</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <input
                                                    id="program-length"
                                                    name="program-length"
                                                    type="number"
                                                    value={programLength}
                                                    onChange={(e) => setProgramLength(e.target.value)}
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    required
                                                />
                                                <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6 pr-5">minutes</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="sm:col-span-full">
                                        <label htmlFor="program-description" className="block text-sm/6 font-medium text-[var(--foreground)]">Description</label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                                <textarea
                                                    id="program-description"
                                                    name="program-description"
                                                    value={programDescription}
                                                    onChange={(e) => setProgramDescription(e.target.value)}
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                
                                </div>

                                {/* Media Input */}
                                <div className="col-span-full mt-6">
                                    <label htmlFor="media-item" className="block text-sm/6 font-medium text-[var(--foreground)]">Media</label>
                                    <div className="mt-2 flex items-center gap-x-3">
                                    <div className="h-28 w-28 rounded-full bg-white overflow-hidden shadow-md">
                                        <img
                                        src={programImgFile ? URL.createObjectURL(programImgFile) : program?.programImgUrl !== "" ? program!.programImgUrl  : "/sg_logo.png"}
                                        alt="Preview"
                                        className="h-full w-full object-cover rounded-full"
                                        />
                                    </div>
                                        <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        id="media-item"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                            if (file.size > 100 * 1024 * 1024) {
                                                console.warn("File too large (max 100MB):", file.name);
                                                return;
                                            }
                                            let processedFile = file;
                                            if (file.type.startsWith('image/')) {
                                            processedFile = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1024, useWebWorker: true });
                                            }
                                            setProgramImgFile(processedFile);
                                            }
                                        }}
                                        />
                                        <label 
                                            htmlFor="media-item" 
                                            className="cursor-pointer rounded-md bg-[var(--background)] px-2.5 py-1.5 text-sm font-bold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--muted)] hover:bg-[var(--primary)] hover:ring-[var(--primary-hover)]"
                                        >
                                            Change
                                        </label>
                                    </div>
                                    <p id="image-warning" className="text-[var(--muted)] text-sm mt-2">
                                        Image or Video. 100MB max.
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-x-6">
                            <button
                                type="button"
                                onClick={() => {setEditModal(false);}}
                                className="rounded-md py-2 text-sm font-semibold text-red-600 hover:text-red-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                            >
                                Save
                            </button>
                        </div>

                    </form>
                </div>
                </Modal>
            )}

            {deleteModal && (
                <Modal title="Delete Program" setModalEnable={setDeleteModal}>
                    <div className="flex gap-5 py-8 max-w-[500px]">
                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                            <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                        </div>
                        <p>Are you sure you want to delete this Program? All of the data including groups will be permanently removed from our servers forever. This action cannot be undone.</p>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={() => {setDeleteModal(false); handleDeleteProgram();}}
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

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <div>
                        <main>
                            {/* Back Button */}
                            <div className="px-6 mb-10">
                                <div className="flex">
                                    <div onClick={() => redirect("/admin/programs") } className="group flex items-center cursor-pointer">
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
                                                    {program!.category.charAt(0).toUpperCase() + program!.category.slice(1).toLowerCase()}
                                                </span>
                                                <span className="text-gray-600">
                                                    /
                                                </span>
                                                <span className="font-semibold text-[var(--foreground)]">
                                                    {program!.name}
                                                </span>
                                            </h1>
                                        </div>
                                    </div>
                                    {/* Edit / Delete (right) */}
                                    <div className="mt-2 sm:mt-0 sm:ml-6 flex gap-4 items-center">
                                        <span 
                                            onClick={() => setEditModal(true)}
                                            className="text-[var(--primary)] cursor-pointer hover:text-[var(--primary-hover)]"
                                        >
                                            Edit
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteModal(true)}
                                            className="rounded-md bg-red-500 px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 sm:w-auto"
                                        >
                                            Delete
                                        </button>
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
                                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                                    <button
                                        onClick={() => setAddModal(true)}
                                        type="button"
                                        className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                                    >
                                        Add Group
                                    </button>
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
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                    {groups &&
                                        groups.map((group) => (
                                        <tr key={group.id}>
                                            {/* Day */}
                                            <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8 sm:pl-6 lg:pl-8">
                                                <div className="font-mono text-sm/6 text-[var(--foreground)] text-left">{group.day}</div>
                                            </td>
                                            {/* Coaches */}
                                            <td className="py-4 pl-0 pr-8 sm:pl-0 lg:pl-0">
                                                <div className="font-mono truncate text-sm/6 font-medium text-[var(--foreground)] text-left">
                                                    {group.coaches.length > 0 ? group.coaches.map(coach => coach.name.split(' ')[0]).join(', ') : "Unassigned"}
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
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </main>
                    </div>
                </>
            )}
        </>
    );
}

