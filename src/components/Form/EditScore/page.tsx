"use client"

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type Score =  {
    id: number,
    competition: string,
    date: Date,
    category: string,
    bars: number,
    beam: number,
    floor: number,
    vault: number,
    overall: number,
}

export default function EditScore({ athleteId, score, setModalEnable, refreshScores }: 
    {   athleteId: number,
        score: Score,
        setModalEnable?: Dispatch<SetStateAction<boolean>>;
        refreshScores?: ({ updatedScore }: { updatedScore: Score }) => void; 
    }
){
    
    // Form Inputs
    const [competitionName, setCompetitionName] = useState(score.competition);
    const [competitionDate, setCompetitionDate] = useState(() => {
        const today = new Date(score.date);
        return today.toISOString().split('T')[0];
    });
    const [competitionCategory, setCompetitionCategory] = useState(score.category);
    const [vaultScore, setVaultScore] = useState(score.vault.toString());
    const [barsScore, setBarsScore] = useState(score.bars.toString());
    const [beamScore, setBeamScore] = useState(score.beam.toString());
    const [floorScore, setFloorScore] = useState(score.floor.toString());
    const [overallScore, setOverallScore] = useState(score.overall.toString());

    useEffect(() => {
        const vault = parseFloat(vaultScore) || 0;
        const bars = parseFloat(barsScore) || 0;
        const beam = parseFloat(beamScore) || 0;
        const floor = parseFloat(floorScore) || 0;
        
        const total = vault + bars + beam + floor;
        setOverallScore(total.toFixed(3)); // Keep three decimal places
    }, [vaultScore, barsScore, beamScore, floorScore]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        const scoreData = {
            competitionName,
            competitionDate,
            competitionCategory,
            vaultScore: vaultScore ? vaultScore : 0,
            barsScore: barsScore ? barsScore : 0,
            beamScore: beamScore ? beamScore : 0,
            floorScore: floorScore ? floorScore : 0,
            overallScore: overallScore ? overallScore : 0,
          };
      
        setIsSubmitting(true);
        try {
        const res = await fetch(`/api/users/${athleteId}/score/${score.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scoreData),
        });
      
        if (res.ok) {
            const data = await res.json();
            if (setModalEnable) setModalEnable(false);
            if (refreshScores && data.body) refreshScores(data.body);
          }
        } catch (err) {
            console.error('Error submitting form', err);
        } finally {
            setIsSubmitting(false);
        }
      };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
            <div className="space-y-12">
                <div className="border-b border-[var(--border)] pb-12">
                    

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-10 sm:min-w-4xl">

                        <div className="sm:col-span-full">
                            <label htmlFor="competition-name" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Competition Name
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="competition-name"
                                        name="competition-name"
                                        type="text"
                                        value={competitionName}
                                        onChange={(e) => setCompetitionName(e.target.value)}
                                        placeholder={`Ontario Championships`}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="competition-category" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Category
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="competition-category"
                                        name="competition-category"
                                        type="text"
                                        value={competitionCategory}
                                        onChange={(e) => setCompetitionCategory(e.target.value)}
                                        placeholder={`Level 6: Ages 10-11`}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="competition-date" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Competition Date
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="competition-date"
                                        name="competition-date"
                                        type="date"
                                        value={competitionDate}
                                        onChange={(e) => setCompetitionDate(e.target.value)}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-full border-t border-[var(--border)]"></div>


                        <div className="sm:col-span-2">
                            <label htmlFor="vault-score" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Vault
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="vault-score"
                                        name="vault-score"
                                        type="number"
                                        value={vaultScore}
                                        onChange={(e) => setVaultScore(e.target.value)}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="bars-score" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Bars
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="bars-score"
                                        name="bars-score"
                                        type="number"
                                        value={barsScore}
                                        onChange={(e) => setBarsScore(e.target.value)}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="beam-score" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Beam
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="beam-score"
                                        name="beam-score"
                                        type="number"
                                        value={beamScore}
                                        onChange={(e) => setBeamScore(e.target.value)}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="floor-score" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Floor
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="floor-score"
                                        name="floor-score"
                                        type="number"
                                        value={floorScore}
                                        onChange={(e) => setFloorScore(e.target.value)}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="overall-score" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Overall
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-[var(--border)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <input
                                        id="overall-score"
                                        name="overall-score"
                                        type="number"
                                        value={overallScore}
                                        onChange={(e) => setOverallScore(e.target.value)}
                                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[#161616] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>
                        

                        

                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button 
                    type="button" 
                    className="text-sm/6 font-semibold text-[var(--foreground)] hover:text-red-600 cursor-pointer"
                    onClick={() => setModalEnable?.(false)}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)]"
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    )
}