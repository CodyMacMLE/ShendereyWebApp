import { getJuniorStaff, getSeniorStaff } from "@/lib/actions";
import { Metadata } from "next";
import Image from "next/image";

import { StaffQuote } from "@/public/files/quotes";
import { StaffStats } from "@/public/files/stats";

// Define the type for staff data structure
type StaffData = {
    coach: {
        id: number;
        user: number | null;
        title: string | null;
        description: string | null;
        isSeniorStaff: boolean | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };
    user: {
        id: number;
        name: string;
        isActive: boolean | null;
        isAthlete: boolean | null;
        isAlumni: boolean | null;
        isProspect: boolean | null;
        isCoach: boolean | null;
        isScouted: boolean | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };
    staffUrl: string | null;
};

function formatName(fullName: string) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1][0]}.`;
}
  
export const metadata: Metadata = {
    title: 'Staff',
};

export default async function Staff() {
    const seniorStaff = await getSeniorStaff();
    const juniorStaff = await getJuniorStaff();

    return (
        <>
            {/* Certification and Quote From Leadership */}
            <div className="px-4 pb-5 sm:px-6 lg:px-8 pt-20 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:pr-4">
                            <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 pb-9 pt-64 shadow-2xl sm:px-12 lg:max-w-lg lg:px-8 lg:pb-8 xl:px-10 xl:pb-10">
                                {/* Image bg for quote */}
                                <Image
                                    alt=""
                                    src="/images/sgi_001.jpg"
                                    className="absolute inset-0 size-full object-cover brightness-125 saturate-0"
                                    width={300}
                                    height={400}
                                />
                                <div className="absolute inset-0 bg-gray-900 mix-blend-multiply" />
                                <div
                                    aria-hidden="true"
                                    className="absolute left-1/2 top-1/2 -ml-16 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
                                >
                                    <div
                                        style={{
                                        clipPath:
                                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                        }}
                                        className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-40"
                                    />
                                </div>
                                <figure className="relative isolate">
                                    <svg
                                        fill="none"
                                        viewBox="0 0 162 128"
                                        aria-hidden="true"
                                        className="absolute -left-2 -top-4 -z-10 h-32 stroke-white/20"
                                    >
                                        <path
                                        d="M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z"
                                        id="0ef284b8-28c2-426e-9442-8655d393522e"
                                        />
                                        <use x={86} href="#0ef284b8-28c2-426e-9442-8655d393522e" />
                                    </svg>
                                    <Image
                                        alt=""
                                        src="/logos/sg_logo_white.png"
                                        className="h-20 w-auto"
                                        width={163}
                                        height={80}
                                    />
                                    <blockquote className="mt-6 text-xl/8 font-semibold text-white">
                                        <p>
                                        “{StaffQuote.quote}”
                                        </p>
                                    </blockquote>
                                    <figcaption className="mt-6 text-sm/6 text-gray-300">
                                        <strong className="font-semibold text-white">{StaffQuote.name},</strong> {StaffQuote.position} at Shenderey
                                    </figcaption>
                                </figure>
                            </div>
                        </div>
                        <div>
                            <div className="text-base/7 text-gray-700 lg:max-w-lg">
                                <p className="text-base/7 font-semibold text-magenta-600">Our Team</p>
                                <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Empowering Excellence</h1>
                                <div className="max-w-xl">
                                    <p className="mt-6">
                                        All coaches at Shenderey gymnastics are nationally certified. They are here to assist each gymnast to reach her maximum potential, 
                                        and they recognize that each child is ultimately responsible for her own success, involvement, and progress. 
                                    </p>
                                    <p className="mt-6">
                                        Our coaches are dedicated and passionate about providing top quality training in a technically sound and safe manner 
                                        for all of our athletes. Our coaches take responsibility to ensure that every child develops good physical skills and 
                                        is taken to her fullest potential. We strive to create a family-oriented atmosphere where our athletes will develop a 
                                        lifetime of memories. 
                                    </p>
                                </div>
                            </div>
                            <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-gray-900/10 pt-10 sm:grid-cols-4">
                                {StaffStats.map((stat, statIdx) => (
                                    <div key={statIdx}>
                                        <dt className="text-sm/6 font-semibold text-gray-600">{stat.label}</dt>
                                        <dd className="mt-2 text-3xl/10 font-bold tracking-tight text-gray-900">{stat.value}</dd>
                                    </div>
                                ))}
                                <div key='employees'>
                                    <dt className="text-sm/6 font-semibold text-gray-600">Employees</dt>
                                    <dd className="mt-2 text-3xl/10 font-bold tracking-tight text-gray-900">{seniorStaff.length + juniorStaff.length}</dd>
                                </div>
                                <div key='coach_ca'>
                                    <a href="https://www.coach.ca" target="_blank">
                                        <Image alt= "Coach.ca Logo" src="/logos/coachCa_Affiliate.jpg" className="h-[70px] w-auto" width={90} height={70}/>
                                    </a>
                                </div>
                                <div key='nccp'>
                                    <a href="https://coach.ca/new-coaching/about-nccp?utm_source=google&utm_medium=cpc&utm_campaign=coach-certification&gad_source=1&gclid=CjwKCAiA1eO7BhATEiwAm0Ee-E6MLc6JUTk3srkL_hps1WOG9h7Mf6JPsBLKKormRjYeB8dJgyY4KxoCEpMQAvD_BwE" target='_blank'>
                                        <Image alt= "NCCP Logo" src="/logos/NCCP-logo.png" className="h-[70px] w-auto" width={124} height={70}/>
                                    </a>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff and Coaches */}
            <div className="bg-white py-10 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl sm:text-center mt-20">
                        <h2 className="text-3xl sm:text-5xl text-balance font-semibold tracking-tight text-gray-900">
                            Meet our leadership
                        </h2>
                    </div>

                    {/* Senior Staff */}
                    <ul
                        role="list"
                        className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:max-w-4xl lg:gap-x-8 xl:max-w-none"
                    >
                        {seniorStaff.map((person: StaffData) => (
                            <li key={person.user.id} className="flex flex-col gap-6 xl:flex-row">
                                <Image alt="" src={person.staffUrl || '/default-profile.png'} className="aspect-[4/5] w-52 flex-none rounded-2xl object-cover max-h-[300px]" width={600} height={300} style={{ objectFit: 'cover' }}/>
                                <div className="flex-auto">
                                    <h3 className="text-lg/8 font-semibold tracking-tight text-gray-900">{formatName(person.user.name)}</h3>
                                    <p className="text-base/7 text-gray-600">{person.coach.title}</p>
                                    <p className="mt-6 text-base/7 text-gray-600">{person.coach.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Coaches */}
                    <div className="mx-auto max-w-2xl sm:text-center mt-20">
                        <h2 className="text-3xl sm:text-5xl text-balance font-semibold tracking-tight text-gray-900">
                            Meet our coaches
                        </h2>
                    </div>

                    <ul
                        role="list"
                        className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
                    >
                        {juniorStaff.map((coach: StaffData) => (
                            <li key={coach.user.id}>
                                <Image alt="" src={coach.staffUrl || '/default-profile.png'} className="mx-auto size-24 rounded-full" width={100} height={100} style={{ objectFit: 'cover', objectPosition: 'top'}}/>
                                <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-gray-900">{formatName(coach.user.name)}</h3>
                                <p className="text-sm/6 text-gray-600">{coach.coach.title}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}
  