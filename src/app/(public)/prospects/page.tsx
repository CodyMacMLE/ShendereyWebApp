import { getProspects } from '@/lib/actions';
import ProspectCards from './ProspectCards';

export type Athlete = {
    id: number;
    name: string;
    level: string | null;
    graduationYear: number | null;
    imageSrc: string | null;
  }

export default async function Prospects() {

    const fetchedProspects = await getProspects();
    const prospectsData: Athlete[] = fetchedProspects.map((prospect) => ({
        id: prospect.prospects.id,
        name: prospect.users.name || '',
        level: prospect.athletes.level || null,
        graduationYear: prospect.prospects.graduationYear ? new Date(prospect.prospects.graduationYear).getFullYear() : null,
        imageSrc: prospect.user_images.prospectUrl || null,
    }));

    return (
        <div className="bg-white">
            <main>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="py-24 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            NCAA Shenderey Prospects
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">
                            Putting the spotlight on our athletes.
                        </p>
                    </div>

                <ProspectCards athletes={prospectsData} />
                </div>
            </main>
        </div>
    )
}
