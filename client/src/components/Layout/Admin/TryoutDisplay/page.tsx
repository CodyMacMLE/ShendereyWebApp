type Tryout = {
  id: number;
  athleteName: string;
  athleteDOB: string;
  athleteAbout: string;
  experienceProgram: string;
  experienceLevel: string;
  experienceYears: number;
  currentClub: string;
  currentCoach: string;
  currentHours: number;
  tryoutPreferences: string;
  tryoutLevel: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRelationship: string;
  readStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TryoutDisplay({ tryout }: { tryout: Tryout }) {
    return (
        <div>
            <div className="mt-8 border-t border-[var(--border)]">
                <div className="divide-y divide-[var(--border)]">
                    <div className="py-5">
                        <div className="px-4 pb-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <p className="mt-1 max-w-2xl text-md text-[var(--foreground)] font-semibold">Athlete Information</p>
                        </div>
                        <div className="px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Name</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.athleteName}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Date of Birth</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{(() => {
                              // Handle the timestamp from database
                              const date = new Date(tryout.athleteDOB);
                              const today = new Date();
                              const age = today.getFullYear() - date.getFullYear();
                              const monthDiff = today.getMonth() - date.getMonth();
                              const dayDiff = today.getDate() - date.getDate();
                              
                              // Adjust age if birthday hasn't occurred yet this year
                              const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
                              
                              return `${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (${adjustedAge}y)`;
                            })()}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">About</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">
                                {tryout.athleteAbout}
                            </dd>
                        </div>
                    </div>
                    <div className="py-5">
                        <div className="px-4 pb-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <p className="mt-1 max-w-2xl text-md text-[var(--foreground)] font-semibold">Athlete Experience</p>
                        </div>
                        <div className="px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Program</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.experienceProgram}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Level</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.experienceLevel}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Years</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{`${tryout.experienceYears} years`}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Current Club</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.currentClub}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Current Coach</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.currentCoach}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Current Hours</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{`${tryout.currentHours} hours`}</dd>
                        </div>
                    </div>
                    <div className="py-5">
                        <div className="px-4 pb-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <p className="mt-1 max-w-2xl text-md text-[var(--foreground)] font-semibold">Tryout Preferences</p>
                        </div>
                        <div className="px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Program</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.tryoutPreferences}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Level</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.tryoutLevel}</dd>
                        </div>
                    </div>
                    <div className="py-5">
                        <div className="px-4 pb-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <p className="mt-1 max-w-2xl text-md text-[var(--foreground)] font-semibold">Contact Information</p>
                        </div>
                        <div className="px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Name</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.contactName}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Relationship</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.contactRelationship}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Email</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.contactEmail}</dd>
                            <dt className="text-sm/6 font-medium text-[var(--foreground)]">Phone</dt>
                            <dd className="mt-1 text-sm/6 text-[var(--foreground)] sm:col-span-2 sm:mt-0">{tryout.contactPhone}</dd>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
