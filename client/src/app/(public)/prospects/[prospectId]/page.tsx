import NotFound from '@/app/not-found';
import { getAthleteAchievements, getAthleteMedia, getAthleteScores, getProspect } from '@/lib/actions';
import Image from 'next/image';
import { PiInstagramLogoLight, PiYoutubeLogoLight } from "react-icons/pi";
import ProspectSubNav from './ProspectSubNav';

interface PageProps {
    params: Promise<{ prospectId: string }>;
}

export default async function ProspectPage({ params }: PageProps) {
    const { prospectId } = await params;
    const prospect = await getProspect(parseInt(prospectId));
    const athleteScores = await getAthleteScores(prospect.athletes.id);
    const athleteMedia = await getAthleteMedia(prospect.athletes.id);
    const athleteAchievements = await getAthleteAchievements(prospect.athletes.id);

    if (!prospect) {
        return <NotFound />;
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 py-10">
                {/* Header Card */}
                <div className="rounded-lg bg-[#eeeeee] border border-[#dadada] flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="h-full w-full md:w-[30%] flex-col items-center justify-center gap-2 p-4">
                        <div className="flex justify-center items-center">
                            <Image
                                src={prospect.user_images.prospectUrl || ''}
                                alt={prospect.users.name}
                                width={100}
                                height={100}
                                className="h-[150px] w-[150px] object-cover rounded-full shadow-lg border border-gray-200"
                            />
                        </div>
                        <div className="mt-4 flex flex-row gap-2 text-gray-500 justify-center items-center w-full">
                            <a href={`https://www.instagram.com/${prospect.prospects?.instagramLink}`} target="_blank">
                                <PiInstagramLogoLight className="w-6 h-6" />
                            </a>
                            <a href={`https://www.youtube.com/${prospect.prospects?.youtubeLink}`} target="_blank">
                                <PiYoutubeLogoLight className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                    <div className="h-full w-full md:w-[70%] p-4 md:p-8">
                        <div className="h-full w-full flex flex-col gap-2">
                            <div className="flex flex-col gap-2 items-center justify-between md:justify-start">
                                <h1 className="text-3xl font-bold">{prospect.users.name}</h1>
                                <p className="text-gray-500 font-bold">
                                    {prospect.prospects?.graduationYear ? new Date(prospect.prospects.graduationYear).getFullYear() : 'N/A'} &bull; {isNaN(parseInt(prospect.athletes.level || '')) ? prospect.athletes.level : `Level ${prospect.athletes.level}`}
                                </p>
                                <div className="flex gap-2 mt-8 gap-x-10">
                                    <div className="flex flex-col justify-center items-center">
                                        <p className="font-bold"><span className="text-3xl">{prospect.prospects?.gpa}</span> / 4.0</p>
                                        <p className="text-gray-500 font-bold text-sm">GPA</p>
                                    </div>
                                    <div className="flex flex-col justify-center items-center">
                                        <p className="font-bold"><span className="text-3xl">{prospect.prospects?.major}</span></p>
                                        <p className="text-gray-500 font-bold text-sm">Interest</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Prospect Sub Nav */}
                <div className="mt-10">
                    <ProspectSubNav prospect={prospect} athleteScores={athleteScores} athleteMedia={athleteMedia} athleteAchievements={athleteAchievements} />
                </div>
            </div>
        </div>
    );
}