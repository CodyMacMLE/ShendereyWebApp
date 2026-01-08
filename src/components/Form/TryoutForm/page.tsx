"use client";

import ErrorModal from "@/components/UI/ErrorModal/page";
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { CheckIcon } from '@heroicons/react/20/solid';
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const experienceLevel = [
  { id: 1, name: 'Recreational' },
  { id: 2, name: 'Pre-Competitive' },
  { id: 3, name: 'Invitational' },
  { id: 4, name: 'Provincial' },
  { id: 5, name: 'National' },
]
const tryoutPreference = [
  { id: 1, name: 'No Preference' },
  { id: 2, name: 'Pre-Competitive' },
  { id: 3, name: 'Invitational' },
  { id: 4, name: 'Provincial' },
  { id: 5, name: 'National' },
]

export default function TryoutForm() {

    const router = useRouter();
    
    const [selectedLevel, setSelectedLevel] = useState(experienceLevel[0])
    const [selectedTryout, setSelectedTryout] = useState(tryoutPreference[0])

    const [formData, setFormData] = useState({
        athleteName: "",
        DoB: "",
        about: "",
        experienceProgram: "Recreational",
        experienceLevel: "",
        experienceYears: 0,
        hoursPerWeek: 0,
        currentClub: "",
        currentCoach: "",
        tryoutPreference: "No Preference",
        tryoutLevel: "",
        contactName: "",
        contactRelationship: "",
        contactEmail: "",
        contactPhone: "",
        honeypot: "", // if this field is filled do not email (bot prevention)
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Check honeypot field
        if (formData.honeypot) {
            console.warn("Spam detected! Form submission blocked.");
            return;
        }
        // Proceed with sending the form data (e.g., send to email or API)
        formData.athleteName = formData.athleteName.trim();
        formData.DoB = formData.DoB.trim();
        formData.about = formData.about.trim();
        formData.experienceProgram = formData.experienceProgram.trim();
        formData.experienceLevel = formData.experienceLevel.trim();
        formData.currentClub = formData.currentClub.trim();
        formData.currentCoach = formData.currentCoach.trim();
        formData.tryoutPreference = formData.tryoutPreference.trim();
        formData.tryoutLevel = formData.tryoutLevel.trim();
        formData.contactName = formData.contactName.trim();
        formData.contactRelationship = formData.contactRelationship.trim();
        formData.contactEmail = formData.contactEmail.trim();
        formData.contactPhone = formData.contactPhone.trim();

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/tryouts", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                throw new Error("Failed to submit form");
            }
            const data = await res.json();
            console.log(data);

            if (data.message) { 
                setErrorModalOpen(true);
                setErrorMessage(data.message);
            }

            if (data.success) {
                router.push("/tryouts/success");
            } else {
                console.error("Failed to submit form");
            }

        } catch (error) {
            console.error("Error submitting form:", error);
            setErrorModalOpen(true);
            setErrorMessage("An error occurred while submitting the form. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update formData when the program experience changes
    const handleProgramChange = (value: { id: number; name: string }) => {
        setSelectedLevel(value); // Update selected program
        setFormData((prev) => ({ ...prev, experienceProgram: value.name })); // Update formData with the selected program name
    };

    // Update formData when the tryout preference changes
    const handleTryoutChange = (value: { id: number; name: string }) => {
        setSelectedTryout(value); // Update selected tryout
        setFormData((prev) => ({ ...prev, tryoutPreference: value.name })); // Update formData with the selected tryout level
    };

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="bg-white py-10 sm:py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

             {/* Title */}
            <div className="mx-auto max-w-2xl sm:text-center">
                <Image src="/logos/sg_logo.png" alt="Shenderey Logo" width={300} height={300} className="mx-auto" />
                <h2 className="text-2xl text-balance font-semibold tracking-tight text-[var(--primary)] sm:text-5xl">Competitive Tryout Form</h2>
                <p className="mt-4 text-lg/8 text-[var(--foreground)]">Fill out the form below to start your competitive career with Shenderey</p>
            </div>

            {/* Error Modal */}
            {errorModalOpen && (
                <div className="mt-10">
                <ErrorModal 
                    errors={[{ msg: errorMessage }]}
                />
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="space-y-12">

                    {/* Athlete Info */}
                    <div className="border-b border-gray-900/10 pb-12 pt-20">

                        <h2 className="text-base/7 font-semibold text-gray-900">Athlete Info</h2>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            {/* Name */}
                            <div className="col-span-4 sm:col-span-2">
                                <label htmlFor="athleteName" className="block text-sm/6 font-medium text-gray-900">
                                    Athlete Name
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="athleteName"
                                            name="athleteName"
                                            type="text"
                                            value={formData.athleteName}
                                            placeholder="Marilyn Hayes"
                                            onChange={handleInputChange}
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Date of Birth Input with Age Calculation */}
                            <div className="col-span-4 sm:col-span-2">
                                <label htmlFor="birthdate" className="block text-sm/6 font-medium text-gray-900">
                                    Date of Birth
                                </label>
                                <div className="mt-2 flex items-center space-x-4">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="birthdate"
                                        name="DoB"
                                        type="date"
                                        value={formData.DoB}
                                        onChange={handleInputChange}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                        required
                                    />
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            <div className="col-span-4">
                                <label htmlFor="about" className="block text-sm/6 font-medium text-gray-900">
                                    About
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="about"
                                        name="about"
                                        value={formData.about}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                    />
                                </div>
                                <p className="mt-3 text-sm/6 text-gray-600">Write a few sentences about the athlete.</p>
                            </div>  
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="border-b border-gray-900/10 pb-12">

                        <h2 className="text-base/7 font-semibold text-gray-900">Experience</h2>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            {/* Program Experience */}
                            <div className="sm:col-span-2">
                            <Listbox
                                value={selectedLevel}
                                onChange={handleProgramChange}
                            >
                                <Label className="block text-sm/6 font-medium text-gray-900">Program</Label>
                                <div className="relative mt-2">
                                <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6">
                                    <span className="col-start-1 row-start-1 truncate pr-6">{selectedLevel.name}</span>
                                    <ChevronUpDownIcon
                                    aria-hidden="true"
                                    className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                    />
                                </ListboxButton>
                                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
                                    {experienceLevel.map((level) => (
                                    <ListboxOption
                                        key={level.id}
                                        value={level}
                                        className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-[var(--primary)] data-[focus]:text-white data-[focus]:outline-none"
                                    >
                                        <span className="block truncate font-normal group-data-[selected]:font-semibold">{level.name}</span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--primary)] group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                                            <CheckIcon aria-hidden="true" className="size-5" />
                                        </span>
                                    </ListboxOption>
                                    ))}
                                </ListboxOptions>
                                </div>
                            </Listbox>
                            </div>


                            {/* Level */}
                            <div className="sm:col-span-2">
                                <label htmlFor="experienceLevel" className="block text-sm/6 font-medium text-gray-900">
                                    Level
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="experienceLevel"
                                            name="experienceLevel"
                                            value={formData.experienceLevel}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            placeholder="Level 7 / Advanced Girls"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Years of Experience */}
                            <div className="sm:col-span-1 min-w-[135px]">
                                <label htmlFor="contactEmail" className="block text-sm/6 font-medium text-gray-900">
                                    Years of Experience
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="experienceYears"
                                            name="experienceYears"
                                            value={formData.experienceYears}
                                            onChange={handleInputChange}
                                            type="number"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hours per week */}
                            <div className="sm:col-span-1 min-w-[135px]">
                                <label htmlFor="contactEmail" className="block text-sm/6 font-medium text-gray-900">
                                    Hours per Week
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="hoursPerWeek"
                                            name="hoursPerWeek"
                                            value={formData.hoursPerWeek}
                                            onChange={handleInputChange}
                                            type="number"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Club */}
                            <div className="sm:col-span-2">
                                <label htmlFor="currentClub" className="block text-sm/6 font-medium text-gray-900">
                                    Current Club
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="currentClub"
                                            name="currentClub"
                                            value={formData.currentClub}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Coach */}
                            <div className="sm:col-span-2">
                                <label htmlFor="currentCoach" className="block text-sm/6 font-medium text-gray-900">
                                    Current Coach
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[">
                                        <input
                                            id="currentCoach"
                                            name="currentCoach"
                                            value={formData.currentCoach}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tryout Preference */}
                            <div className="sm:col-span-3">
                                <Listbox 
                                    value={selectedTryout} 
                                    onChange={handleTryoutChange}
                                >
                                    <Label className="block text-sm/6 font-medium text-gray-900">Tryout Preference</Label>
                                    <div className="relative mt-2">
                                        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6">
                                            <span className="col-start-1 row-start-1 truncate pr-6">{selectedTryout.name}</span>
                                            <ChevronUpDownIcon
                                                aria-hidden="true"
                                                className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                            />
                                        </ListboxButton>
                                        <ListboxOptions
                                            transition
                                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
                                        >
                                            {tryoutPreference.map((level) => (
                                                <ListboxOption
                                                    key={level.id}
                                                    value={level}
                                                    className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-[var(--primary)] data-[focus]:text-white data-[focus]:outline-none"
                                                >
                                                    <span className="block truncate font-normal group-data-[selected]:font-semibold">{level.name}</span>
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--primary)] group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                                                        <CheckIcon aria-hidden="true" className="size-5" />
                                                    </span>
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                </Listbox>
                            </div>

                            {/* Tryout Level */}
                            <div className="sm:col-span-2">
                                <label htmlFor="tryoutLevel" className="block text-sm/6 font-medium text-gray-900">
                                    Tryout Level
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="tryoutLevel"
                                            name="tryoutLevel"
                                            value={formData.tryoutLevel}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="Only if you know the OCP/ODP/USAG level system."
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="border-b border-gray-900/10 pb-12">

                        <h2 className="text-base/7 font-semibold text-gray-900">Contact Info</h2>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label htmlFor="contactName" className="block text-sm/6 font-medium text-gray-900">
                                    Contact Name
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="contactName"
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label htmlFor="contactName" className="block text-sm/6 font-medium text-gray-900">
                                    Relationship to Athlete
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="contactRelationship"
                                            name="contactRelationship"
                                            value={formData.contactRelationship}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-2">
                                <label htmlFor="contactEmail" className="block text-sm/6 font-medium text-gray-900">
                                    Email
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="contactEmail"
                                            name="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={handleInputChange}
                                            type="email"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="sm:col-span-2">
                                <label htmlFor="contactPhone" className="block text-sm/6 font-medium text-gray-900">
                                    Phone
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                        <input
                                            id="contactPhone"
                                            name="contactPhone"
                                            value={formData.contactPhone}
                                            onChange={handleInputChange}
                                            type="tel"
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Honeypot Field */}
                    <div className="hidden">
                        <label htmlFor="honeypot"></label>
                        <input
                            id="honeypot"
                            name="honeypot"
                            type="text"
                            value={formData.honeypot}
                            onChange={handleInputChange}
                            className="block w-full"
                        />
                    </div>

                    {/* Submit */}
                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
  );
}
