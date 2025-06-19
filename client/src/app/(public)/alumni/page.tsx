import { getAlumni } from '@/lib/actions';
import AlumniCards from './AlumniCards';

export type Athlete = {
    id: number;
    name: string;
    school: string | null;
    graduationYear: number | null;
    imageSrc: string | null;
}

export default async function Alumni() {

  const fetchedAlumni = await getAlumni();
  const alumniData: Athlete[] = fetchedAlumni.map((alumni) => ({
    id: alumni.alumni.id,
    name: alumni.users.name || '',
    school: alumni.alumni.school,
    graduationYear: alumni.alumni.year ? new Date(alumni.alumni.year).getFullYear() : null,
    imageSrc: alumni.user_images.alumniUrl || null,
  }));
  
  return (
    <div className="bg-white">
        <main>
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="py-24 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        NCAA Shenderey Alumni
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">
                        Putting the spotlight on our alumni.
                    </p>
                </div>

            <AlumniCards athletes={alumniData} />
            </div>
        </main>
    </div>
  )
}
