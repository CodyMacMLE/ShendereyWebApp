"use client";

import ErrorModal from "@/components/UI/ErrorModal/page";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type EventType = 'camp' | 'birthday';

const inputClass = "block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6";
const wrapperClass = "flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]";

export default function EventForm() {
    const router = useRouter();
    const [eventType, setEventType] = useState<EventType>('camp');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        childName: "",
        childAge: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        notes: "",
        // Birthday-specific
        preferredDate: "",
        numGuests: "",
        // Honeypot
        honeypot: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.honeypot) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, eventType }),
            });

            if (!res.ok) throw new Error("Failed to submit form");

            const data = await res.json();
            if (data.success) {
                router.push("/camps-and-events/success");
            } else {
                setErrorMessage(data.error || "An error occurred. Please try again.");
                setErrorModalOpen(true);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setErrorMessage("An error occurred while submitting the form. Please try again.");
            setErrorModalOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                {/* Form title */}
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <p className="text-base/7 font-semibold text-[var(--primary)]">Get in Touch</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Register for an Event</h2>
                    <p className="mt-4 text-lg/8 text-gray-600">Fill out the form below and we&apos;ll get back to you to confirm your booking.</p>
                </div>

                {/* Event type toggle */}
                <div className="mt-8 flex gap-3">
                    <button
                        type="button"
                        onClick={() => setEventType('camp')}
                        className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                            eventType === 'camp'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Camp
                    </button>
                    <button
                        type="button"
                        onClick={() => setEventType('birthday')}
                        className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                            eventType === 'birthday'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Birthday Party
                    </button>
                </div>

                {errorModalOpen && (
                    <div className="mt-6">
                        <ErrorModal errors={[{ msg: errorMessage }]} />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8">
                    <div className="space-y-12">

                        {/* Child Info */}
                        <div className="border-b border-gray-900/10 pb-12">
                            <h3 className="text-base/7 font-semibold text-gray-900">Child&apos;s Information</h3>
                            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                                <div className="sm:col-span-3">
                                    <label htmlFor="childName" className="block text-sm/6 font-medium text-gray-900">Child&apos;s Name</label>
                                    <div className="mt-2">
                                        <div className={wrapperClass}>
                                            <input id="childName" name="childName" type="text" value={formData.childName} onChange={handleInputChange} placeholder="Jane Smith" className={inputClass} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:col-span-1">
                                    <label htmlFor="childAge" className="block text-sm/6 font-medium text-gray-900">Child&apos;s Age</label>
                                    <div className="mt-2">
                                        <div className={wrapperClass}>
                                            <input id="childAge" name="childAge" type="number" min="1" max="18" value={formData.childAge} onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                    </div>
                                </div>

                                {/* Birthday-specific fields */}
                                {eventType === 'birthday' && (
                                    <>
                                        <div className="sm:col-span-2">
                                            <label htmlFor="preferredDate" className="block text-sm/6 font-medium text-gray-900">Preferred Date</label>
                                            <div className="mt-2">
                                                <div className={wrapperClass}>
                                                    <input id="preferredDate" name="preferredDate" type="date" value={formData.preferredDate} onChange={handleInputChange} className={inputClass} required />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label htmlFor="numGuests" className="block text-sm/6 font-medium text-gray-900">Approximate Number of Guests</label>
                                            <div className="mt-2">
                                                <div className={wrapperClass}>
                                                    <input id="numGuests" name="numGuests" type="number" min="1" value={formData.numGuests} onChange={handleInputChange} placeholder="10" className={inputClass} required />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="col-span-full sm:col-span-4">
                                    <label htmlFor="notes" className="block text-sm/6 font-medium text-gray-900">Additional Notes</label>
                                    <div className="mt-2">
                                        <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3} placeholder="Any special requirements, questions, or additional information..." className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="border-b border-gray-900/10 pb-12">
                            <h3 className="text-base/7 font-semibold text-gray-900">Contact Information</h3>
                            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                                <div className="sm:col-span-3">
                                    <label htmlFor="contactName" className="block text-sm/6 font-medium text-gray-900">Your Name</label>
                                    <div className="mt-2">
                                        <div className={wrapperClass}>
                                            <input id="contactName" name="contactName" type="text" value={formData.contactName} onChange={handleInputChange} placeholder="Parent / Guardian" className={inputClass} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="contactEmail" className="block text-sm/6 font-medium text-gray-900">Email</label>
                                    <div className="mt-2">
                                        <div className={wrapperClass}>
                                            <input id="contactEmail" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleInputChange} placeholder="example@email.com" autoComplete="email" className={inputClass} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="contactPhone" className="block text-sm/6 font-medium text-gray-900">Phone</label>
                                    <div className="mt-2">
                                        <div className={wrapperClass}>
                                            <input id="contactPhone" name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleInputChange} placeholder="(905) 555-1234" autoComplete="tel" className={inputClass} required />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Honeypot */}
                        <div className="hidden" aria-hidden="true">
                            <label htmlFor="honeypot"></label>
                            <input id="honeypot" name="honeypot" type="text" value={formData.honeypot} onChange={handleInputChange} tabIndex={-1} autoComplete="off" />
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-x-6 pb-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Registration"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
