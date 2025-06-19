import { useState, Dispatch, SetStateAction } from 'react';

type Achievement =  {
    id: number,
    athlete: number,
    title: string,
    description: string,
    date: Date,
}

export default function AddAchievement({ athleteId, setAthleteAchievements, setModalEnable }: 
  { athleteId: number, setAthleteAchievements: Dispatch<SetStateAction<Achievement[]>>, setModalEnable?: Dispatch<SetStateAction<boolean>> }
) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleSubmit = async () => {
    const achievementData = { title, description, date };

    const res = await fetch(`/api/users/${athleteId}/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievementData),
    });

    if (res.ok) {
      const data = await res.json();
      if (setModalEnable) setModalEnable(false);
      if (data.body) {
        setAthleteAchievements(prev => [...prev, data.body]);
      }
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="space-y-12">
        <div className="border-b border-[var(--border)] pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-10 sm:min-w-4xl">

            <div className="sm:col-span-4">
              <label htmlFor="achievement-title" className="block text-sm/6 font-medium text-[var(--foreground)]">Title</label>
              <div className="mt-2">
                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                  <input
                    id="achievement-title"
                    name="achievement-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="First Place - Vault"
                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="achievement-date" className="block text-sm/6 font-medium text-[var(--foreground)]">Date</label>
              <div className="mt-2">
                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                  <input
                    id="achievement-date"
                    name="achievement-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-full">
              <label htmlFor="achievement-description" className="block text-sm/6 font-medium text-[var(--foreground)]">Description</label>
              <div className="mt-2">
                <div className="flex items-center rounded-md bg-white pl-3 overflow-hidden outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                  <textarea
                    id="achievement-description"
                    name="achievement-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Earned top score at provincial championship meet."
                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          Save
        </button>
      </div>
    </form>
  );
}