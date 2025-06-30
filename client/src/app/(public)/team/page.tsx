import { getCurrentAthletes } from "@/lib/actions";
import { Metadata } from "next";
import Image from "next/image";

function formatName(fullName: string) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1][0]}.`;
}
  
export const metadata: Metadata = {
    title: 'Team',
};

export default async function Team() {

    const currentTeam = await getCurrentAthletes();

return (
        <>
            <div className="relative bg-gray-900 shadow-hero">
                {/* Decorative image and overlay */}
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden max-w-[1920px]">
                    <Image
                        alt=""
                        src="/images/Shenderey_2024-2025.JPG"
                        className="size-full object-cover"
                        width={1920}
                        height={1080}
                    />
                </div>
                <div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-70" />
                    {/* Content of Hero Section */}
                    <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-25 text-center sm:py-56 lg:px-0">
                    <p className="mt-4 text-xl text-white pt-20">Join the Legacy</p>
                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-white lg:text-6xl pb-20">Meet Our Competitive Team</h1>
                </div>
            </div>

            <div className="bg-white py-10 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-4xl sm:text-4xl font-semibold tracking-tight text-gray-900">
                            Our Current Team
                        </h2>
                    </div>
                    {/* Current Athletes */}
                    <ul
                        role="list"
                        className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6 m-t-10"
                    >
                        {currentTeam.map((athlete) => (
                            <li key={athlete.user.name}>
                            <Image alt="" src={athlete.athleteUrl || '/default-profile.png'} className="mx-auto size-24 rounded-full" width={100} height={100} style={{ objectFit: 'cover', objectPosition: 'top'}}/>
                            <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-gray-900">{formatName(athlete.user.name)}</h3>
                            <p className="text-sm/6 text-gray-600">
                                    {athlete.athlete?.level && /^[1-9]$|^10$/.test(athlete.athlete.level.trim())
                                    ? `Level ${athlete.athlete.level.trim()}`
                                    : athlete.athlete?.level}
                            </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}
  