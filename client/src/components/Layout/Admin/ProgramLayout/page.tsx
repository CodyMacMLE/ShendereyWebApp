"use client"

import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import { redirect } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import Dropdown from '@/components/UI/Dropdown/page';
import ErrorModal from "@/components/UI/ErrorModal/page";
import Modal from "@/components/UI/Modal/page";

type Program = {
    id: number,
    name: string,
    category: string,
    description: string,
    length: number,
    ages: string,
    programImgUrl: string,
}

interface ProgramLayoutProps {
    programs: Program[];
    setPrograms?: Dispatch<SetStateAction<Program[]>>
    isLoading?: boolean;
}

const categories = [
  {id: 0, name: "Recreational"},
  {id: 1, name: "Competitive"},
]

export default function ProgramLayout({ programs, setPrograms, isLoading }: ProgramLayoutProps) {


  const [modalEnabled, setModalEnabled] = useState(false);

  useEffect(() => {
    if (!modalEnabled) {
      setProgramImgFile(null);
    }
  }, [modalEnabled]);

  // Handle Submit
  const handleSubmit = async () => {
    if (isSubmitting) return;

    const errors: { msg: string }[] = [];

    if (!name.trim()) errors.push({ msg: 'Name is required.' });
    const parsedCategory = category.id === 0 ? 'recreational' : 'competitive';
    if (!ages.trim()) errors.push({ msg: 'Ages are required.' });
    if (!length) errors.push({ msg: 'Length is required.' });
    description.trim();

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear previous errors
    setFormErrors([]);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', parsedCategory);
      formData.append('ages', ages);
      formData.append('length', length);
      formData.append('description', description);
      if (programImgFile) {
          formData.append('programImgFile', programImgFile);
      }

      const res = await fetch(`/api/programs`, {
          method: 'POST',
          body: formData,
      });

      if (res.ok) {
          const data = await res.json();
          setModalEnabled(false);
          if (data.body && setPrograms) setPrograms(prevPrograms => [...prevPrograms, data.body]);
      } else {
          let errorMessage = 'Failed to upload program. Please try again.';
          try {
              const errorData = await res.json();
              errorMessage = errorData.error || errorMessage;
          } catch (_parseError) {
              // If JSON parsing fails, use the status text
              errorMessage = res.statusText || errorMessage;
          }
          setFormErrors([{ msg: errorMessage }]);
          console.error('Upload failed:', errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setFormErrors([{ msg: errorMessage }]);
      console.error('Error submitting form', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [ages, setAges] = useState("");
  const [length, setLength] = useState("");
  const [description, setDescription] = useState("");
  const [programImgFile, setProgramImgFile] = useState<File | null>(null);

  const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
      <>
        {modalEnabled && (
            <Modal title="Add Program" setModalEnable={setModalEnabled}>
              <div>
                {formErrors.length > 0 && (
                    <div className="px-4 pt-6 sm:px-8">
                    <ErrorModal errors={formErrors} />
                    </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
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
                                    <Dropdown items={categories} selected={category} setSelected={setCategory}/>
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
                                                value={ages}
                                                onChange={(e) => setAges(e.target.value)}
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
                                                value={length}
                                                onChange={(e) => setLength(e.target.value)}
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
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
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
                                    <Image
                                      src={programImgFile ? URL.createObjectURL(programImgFile) : "/logos/sg_logo.png"}
                                      alt="Preview"
                                      className="h-full w-full object-cover rounded-full"
                                      width={1000}
                                      height={1000}
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
                            onClick={() => {setModalEnabled(false);}}
                            disabled={isSubmitting}
                            className="rounded-md py-2 text-sm font-semibold text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                  </form>
              </div>
            </Modal>
        )}
        <div className="px-4 sm:px-6 lg:px-8 py-0">
            {/* Title */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-[var(--foreground)]">Programs</h1>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                    onClick={() => setModalEnabled(true)}
                    type="button"
                    className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                >
                    Add Program
                </button>
                </div>
            </div>
            
            {/* Content */}
            {isLoading ? (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">Loading...</div>
            ) : programs.length > 0 ? (
                <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-5">
                    {programs.map((program) => (
                         <li
                         key={program.id}
                         className="col-span-1 flex flex-col divide-y divide-[var(--border)] rounded-lg bg-[var(--card-bg)] text-center shadow"
                       >
                         <div className="flex flex-1 flex-col p-8">
                           <Image
                             alt=""
                             src={program.programImgUrl?.trim() ? program.programImgUrl : "/logos/sg_logo.png"}
                             className="mx-auto size-32 shrink-0 rounded-full shadow-md"
                             width={1000}
                             height={1000}
                           />
                           <h3 className="mt-6 text-sm font-medium text-[var(--foreground)]">{program.name}</h3>
                           <dl className="mt-1 flex grow flex-col justify-between">
                             <dt className="sr-only">Title</dt>
                             <dd className="text-sm text-gray-500">{program.ages} years</dd>
                             <dt className="sr-only">Role</dt>
                             <dd className="mt-3">
                               <span className="inline-flex items-center rounded-full bg-[var(--primary)]/50 px-2 py-1 text-xs font-medium text-[var(--primary)] ring-1 ring-inset ring-[var(--primary)]">
                                 {program.category}
                               </span>
                             </dd>
                           </dl>
                         </div>
                         <div>
                           <div
                                onClick={() => redirect(`/admin/programs/${program.id}`)}
                                className="-mt-px flex divide-x divide-[var(--border)] items-center justify-center gap-x-3 rounded-b-lg border border-transparent py-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] cursor-pointer"
                            >
                                View More
                           </div>
                         </div>
                       </li>
                    ))}
                </ul>
            ) : (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No programs available.</div>
            )}
          
        </div>
      </>
    )
}