import EventForm from "@/components/Form/EventForm/page";
import BirthdayPackages from "@/components/UI/BirthdayPackages/page";
import SessionCarousel from "@/components/UI/SessionCarousel/SessionCarousel";
import { getBirthdayPackages, getRegistrationImages } from "@/lib/actions";
import { Suspense } from "react";

export default async function CampsEventsLayout() {
    const [registrationImages, birthdayPkgs] = await Promise.all([
        getRegistrationImages(),
        getBirthdayPackages(),
    ]);

    const campImages = registrationImages
        .filter(img => img.imageUrl && img.slot === 'camp')
        .map(img => ({ id: img.id, imageUrl: img.imageUrl!, title: img.title ?? null, slot: img.slot ?? null }));

    return (
        <div className="bg-white">

            {/* Hero */}
            <div className="px-4 pt-28 pb-0 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <p className="text-base/7 font-semibold text-[var(--primary)]">Programs</p>
                        <h1 className="mt-2 text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">Camps &amp; Events</h1>
                        <p className="mt-6 text-lg/8 text-gray-600">
                            From summer camps packed with skill-building fun to unforgettable gymnastics birthday parties, Shenderey Gymnastics has something for every child. Explore our offerings below and register your spot today.
                        </p>
                    </div>
                </div>
            </div>

            {/* Camps Section */}
            <div className="py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6">
                        <div>
                            <p className="text-base/7 font-semibold text-[var(--primary)]">Camps</p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Summer &amp; Holiday Camps</h2>
                        </div>
                        <div className="lg:mt-0 mt-6">
                            <p className="text-lg/8 text-gray-600">
                                Our gymnastics camps are a fantastic way for children to build strength, flexibility, coordination, and confidence during school breaks. Led by our experienced, nationally certified coaches, each camp blends structured skill development with games and activities that keep kids engaged and coming back for more.
                            </p>
                            <p className="mt-4 text-lg/8 text-gray-600">
                                We offer summer camps, March Break camps, PD day camps, and specialty themed camps throughout the year. Camps are open to all skill levels — whether your child is brand new to gymnastics or has been training for years, there&apos;s a spot for them at Shenderey.
                            </p>
                        </div>
                    </div>

                    {/* Camp images carousel */}
                    {campImages.length > 0 && (
                        <SessionCarousel images={campImages} title="Upcoming Camps" />
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="border-t border-gray-200" />
            </div>

            {/* Birthday Parties Section */}
            <div className="py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6">
                        <div>
                            <p className="text-base/7 font-semibold text-[var(--primary)]">Birthday Parties</p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Make It a Gymnastics Party</h2>
                        </div>
                        <div className="lg:mt-0 mt-6">
                            <p className="text-lg/8 text-gray-600">
                                Celebrate your child&apos;s special day at Shenderey Gymnastics! Our birthday party packages offer an exciting and active experience in our fully equipped facility. Kids get to bounce, flip, and tumble under the supervision of our trained staff — guaranteeing smiles all around.
                            </p>
                            <p className="mt-4 text-lg/8 text-gray-600">
                                Parties are available for children of all ages and skill levels. To check availability and learn more about our party packages, fill out the registration form below and a member of our team will be in touch to help plan the perfect party.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Birthday Party Packages */}
            {birthdayPkgs.length > 0 && (
                <>
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="border-t border-gray-200" />
                    </div>
                    <BirthdayPackages packages={birthdayPkgs} />
                </>
            )}

            {/* Divider */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="border-t border-gray-200" />
            </div>

            {/* Event Registration Form */}
            <div id="event-form">
                <Suspense>
                    <EventForm />
                </Suspense>
            </div>

        </div>
    );
}
