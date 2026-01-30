import { getCurrentAthletes } from "@/lib/actions";
import { Metadata } from "next";
import Image from "next/image";

const NATIONAL_LEVELS = ['Senior', 'Junior', 'Novice', '10', '9'];
const PROVINCIAL_LEVELS = ['8', '7', '6', '5', '4', '3'];
const INVITATIONAL_LEVELS = ['Xcel Gold', 'Xcel Silver', 'Xcel Bronze', 'Xcel Platinum', '1', '2'];

type AthleteCategory = 'national' | 'provincial' | 'invitational';

function getCategory(level: string | null | undefined): AthleteCategory | null {
    if (!level) return null;
    const trimmed = level.trim();
    if (NATIONAL_LEVELS.includes(trimmed)) return 'national';
    if (PROVINCIAL_LEVELS.includes(trimmed)) return 'provincial';
    if (INVITATIONAL_LEVELS.includes(trimmed)) return 'invitational';
    return null;
}

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

    const nationalAthletes = currentTeam.filter((a) => getCategory(a.athlete?.level) === 'national');
    const provincialAthletes = currentTeam.filter((a) => getCategory(a.athlete?.level) === 'provincial');
    const invitationalAthletes = currentTeam.filter((a) => getCategory(a.athlete?.level) === 'invitational');

    const athleteGridClasses = "mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6 m-t-10";

    function renderLevel(level: string | null | undefined) {
        if (!level) return null;
        const trimmed = level.trim();
        return /^[1-9]$|^10$/.test(trimmed) ? `Level ${trimmed}` : trimmed;
    }

    return (
        <>
            <div className="relative bg-gray-900 shadow-hero">
                {/* Decorative image and overlay */}
                <div aria-hidden="true" className="absolute inset-y-0 left-1/2 -translate-x-1/2 overflow-hidden max-w-[1920px] w-full">
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
                        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900">
                            Our Current Team
                        </h2>
                    </div>

                    {nationalAthletes.length > 0 && (
                        <div>
                            <div className="mx-auto max-w-2xl sm:text-center">
                                <h2 className="text-xl text-balance font-semibold tracking-tight text-gray-900 sm:text-2xl pt-20">
                                    National
                                </h2>
                            </div>
                            <ul role="list" className={athleteGridClasses}>
                                {nationalAthletes.map((athlete) => (
                                <li key={athlete.user.name}>
                                    <Image alt="" src={athlete.athleteUrl || '/logos/sg_logo.png'} className="mx-auto size-24 rounded-full" width={100} height={100} style={{ objectFit: 'cover', objectPosition: 'top'}}/>
                                    <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-gray-900">{formatName(athlete.user.name)}</h3>
                                    <p className="text-sm/6 text-gray-600">{renderLevel(athlete.athlete?.level)}</p>
                                </li>
                            ))}
                            </ul>
                        </div>
                    )}

                    {provincialAthletes.length > 0 && (
                        <div>
                            <div className="mx-auto max-w-2xl sm:text-center">
                                <h2 className="text-xl text-balance font-semibold tracking-tight text-gray-900 sm:text-2xl pt-20">
                                    Provincial
                                </h2>
                            </div>
                            <ul role="list" className={athleteGridClasses}>
                                {provincialAthletes.map((athlete) => (
                                <li key={athlete.user.name}>
                                    <Image alt="" src={athlete.athleteUrl || '/logos/sg_logo.png'} className="mx-auto size-24 rounded-full" width={100} height={100} style={{ objectFit: 'cover', objectPosition: 'top'}}/>
                                    <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-gray-900">{formatName(athlete.user.name)}</h3>
                                    <p className="text-sm/6 text-gray-600">{renderLevel(athlete.athlete?.level)}</p>
                                </li>
                            ))}
                            </ul>
                        </div>
                    )}

                    {invitationalAthletes.length > 0 && (
                        <div>
                            <div className="mx-auto max-w-2xl sm:text-center">
                                <h2 className="text-xl text-balance font-semibold tracking-tight text-gray-900 sm:text-2xl pt-20">
                                    Invitational
                                </h2>
                            </div>
                            <ul role="list" className={athleteGridClasses}>
                                {invitationalAthletes.map((athlete) => (
                                <li key={athlete.user.name}>
                                    <Image alt="" src={athlete.athleteUrl || '/logos/sg_logo.png'} className="mx-auto size-24 rounded-full" width={100} height={100} style={{ objectFit: 'cover', objectPosition: 'top'}}/>
                                    <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-gray-900">{formatName(athlete.user.name)}</h3>
                                    <p className="text-sm/6 text-gray-600">{renderLevel(athlete.athlete?.level)}</p>
                                </li>
                            ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
  