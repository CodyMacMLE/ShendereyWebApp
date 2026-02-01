import { competitiveContact, recreationalContact, contactDetails } from "@/public/files/contactDetails";
import { Metadata } from "next";
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
    title: 'Contact Us',
};

export default function Contact() {
    return (
        <div className="px-4 pb-5 sm:px-6 lg:px-8 pt-20 bg-white">
            {/* Header */}
            <div className="bg-white pt-5 sm:pt-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-base/7 font-semibold text-[var(--primary)]">Get in Touch</p>
                        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                            Contact Us
                        </h1>
                        <p className="mt-6 text-lg/8 text-gray-600">
                            Have questions? Reach out to the right department below and we&apos;ll be happy to help.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Cards */}
            <div className="bg-white py-10 sm:py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">

                        {/* Competitive */}
                        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8">
                            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                                {competitiveContact.name}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-[var(--primary)]">{competitiveContact.program} Program</p>

                            <dl className="mt-8 space-y-6">
                                <div className="flex gap-x-4">
                                    <dt>
                                        <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                                    </dt>
                                    <dd>
                                        <a href={`mailto:${competitiveContact.email}`} className="text-sm/6 font-semibold text-[var(--primary)] hover:underline">
                                            {competitiveContact.email}
                                        </a>
                                    </dd>
                                </div>
                                <div className="flex gap-x-4">
                                    <dt>
                                        <PhoneIcon className="h-6 w-6 text-gray-400" />
                                    </dt>
                                    <dd>
                                        <a href={`tel:${competitiveContact.telephone}`} className="text-sm/6 text-gray-700 hover:text-gray-900">
                                            {competitiveContact.telephone}
                                        </a>
                                    </dd>
                                </div>
                                <div className="flex gap-x-4">
                                    <dt>
                                        <MapPinIcon className="h-6 w-6 text-gray-400" />
                                    </dt>
                                    <dd className="text-sm/6 text-gray-700">
                                        {competitiveContact.street}<br />
                                        {competitiveContact.city}, {competitiveContact.region} {competitiveContact.postal}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Recreational */}
                        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8">
                            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                                {recreationalContact.name}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-[var(--primary)]">{recreationalContact.program} Program</p>

                            <dl className="mt-8 space-y-6">
                                <div className="flex gap-x-4">
                                    <dt>
                                        <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                                    </dt>
                                    <dd>
                                        <a href={`mailto:${recreationalContact.email}`} className="text-sm/6 font-semibold text-[var(--primary)] hover:underline">
                                            {recreationalContact.email}
                                        </a>
                                    </dd>
                                </div>
                                <div className="flex gap-x-4">
                                    <dt>
                                        <PhoneIcon className="h-6 w-6 text-gray-400" />
                                    </dt>
                                    <dd>
                                        <a href={`tel:${recreationalContact.telephone}`} className="text-sm/6 text-gray-700 hover:text-gray-900">
                                            {recreationalContact.telephone}
                                        </a>
                                    </dd>
                                </div>
                                <div className="flex gap-x-4">
                                    <dt>
                                        <MapPinIcon className="h-6 w-6 text-gray-400" />
                                    </dt>
                                    <dd className="text-sm/6 text-gray-700">
                                        {recreationalContact.street}<br />
                                        {recreationalContact.city}, {recreationalContact.region} {recreationalContact.postal}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                    </div>

                    {/* Office Hours */}
                    <div className="mx-auto max-w-2xl mt-16">
                        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <ClockIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Office Hours</h3>
                            <dl className="mt-4 space-y-2">
                                {contactDetails.officeHours.map((entry) => (
                                    <div key={entry.day} className="flex justify-center gap-x-4 text-sm/6 text-gray-700">
                                        <dt className="w-24 text-right font-medium">{entry.day}</dt>
                                        <dd className="w-32 text-left">{entry.time}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
