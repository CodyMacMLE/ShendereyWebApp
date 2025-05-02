"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import Modal from "@/components/UI/Modal/page"
import AddScore from "@/components/Form/AddScore/page";
import EditScore from "@/components/Form/EditScore/page";

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

type Images = {
    staffUrl: string,
    athleteUrl: string,
    prospectUrl: string,
    alumniUrl: string,
}

type Athlete = {
  id: number,
  name: string,
}

export default function ScoresTable({ athlete, images } : { athlete : Athlete, images : Images }) {
  // Add State
  const [addModalEnabled, setAddModalEnabled] = useState(false);
  // Edit State
  const [editModalEnabled, setEditModalEnabled] = useState(false);
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);

  const [enabledStates, setEnabledStates] = useState<{ [key: number]: boolean }>({});
  const [athleteScores, setAthleteScores] = useState<Score[] | []>([]);

  useEffect(() => {
    fetchScores();
  }, [])

  useEffect(() => {}, [athleteScores])

  // Global click detection for delete confirm button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.confirm-delete-button')) {
        setEnabledStates({});
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);


  // Create Score
  const addScore = ({ score }: { score: Score }) => {
    setAthleteScores(prev => [...prev, score]);
  }

  // Read Score
  const fetchScores = async () => {
    try {
      const res = await fetch(`/api/users/${athlete.id}/score`, {
        method: 'GET',
      })

      if (res.ok) {
        const data = await res.json();
        setAthleteScores(data.body || []);
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Add Update Here
  const updateScore = ({ updatedScore }: { updatedScore: Score }) => {
    setAthleteScores(prevScores =>
      prevScores.map(score =>
        score.id === updatedScore.id ? updatedScore : score
      )
    );
  };

  // Delete Score
  const deleteScore = async (athleteId : number, scoreId: number) => {
    try {
      const res = await fetch(`/api/users/${athlete.id}/score/${scoreId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        const data = await res.json();
        if (data.body) {
          const newArray = athleteScores.filter(score => score.id !== data.body.id);
          setAthleteScores(newArray);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }


  const toggleEnabled = (id: number) => {
    setEnabledStates(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {addModalEnabled && (
        <Modal title="Add Score" setModalEnable={setAddModalEnabled}>
          <AddScore athleteId={athlete.id} setModalEnable={setAddModalEnabled} refreshScores={addScore}/>
        </Modal>
      )} 

      {editModalEnabled && selectedScore && (
        <Modal title="Edit Score" setModalEnable={setEditModalEnabled}>
          <EditScore athleteId={athlete.id} score={selectedScore} setModalEnable={setEditModalEnabled} refreshScores={updateScore}/>
        </Modal>
      )} 

      <div className="px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header Display */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto flex items-center gap-5">
          {images.athleteUrl ? (
                <div className="h-[50px] w-[50px] rounded-full overflow-hidden ring-1 ring-[var(--border)]">
                    <Image
                        src={images.athleteUrl}
                        alt="Athlete Image"
                        width={100}
                        height={100}
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className='flex items-center justify-center bg-[var(--card-bg)] ring ring-[var(--border)] mt-8 h-[50px] w-[50px] rounded-full'>
                    <UserCircleIcon aria-hidden="true" className="size-20 text-[var(--muted)]" />
                </div> 
            )}
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">{athlete.name}'s Scores</h1>
          </div>
          <div className="mt-10 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setAddModalEnabled(true)}
              className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
            >
              Add Score
            </button>
          </div>
        </div>

        {/* Table */}
        {athleteScores.length > 0 ? (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-x-auto shadow ring-1 ring-[var(--border)] sm:rounded-lg">
                <table className="min-w-full divide-y divide-[var(--border)]">
                  <thead className="bg-[var(--card-bg)]">
                    <tr>
                      <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6">
                        Competition
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                        Category
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                        Vault
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                        Bars
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                        Beam
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                        Floor
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                        Overall
                      </th>
                      <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                    {athleteScores.map((score: Score) => { 
                        const enabled = enabledStates[score.id] || false;

                        const handleDeleteClick = async () => {
                          if (!enabled) {
                            toggleEnabled(score.id);
                          } else {
                            await deleteScore(athlete.id, score.id);
                          }
                        };

                        return (
                            <tr key={score.id} className="transition-colors duration-150">
                                <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6">
                                    {score.competition}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                    {new Date(score.date).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                    {score.category}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                    {score.vault}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                    {score.bars}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                    {score.beam}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                    {score.floor}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                    {score.overall}
                                </td>
                                <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6">
                                    <button
                                        onClick={handleDeleteClick}
                                        className={`confirm-delete-button cursor-pointer group relative inline-flex h-6 w-16 items-center justify-center rounded-full  ${enabled ? 'bg-red-600 hover:bg-red-500' : 'bg-[var(--background) hover:bg-[var(--muted)]/5'} ring-1 ring-[var(--border)]`}
                                    >
                                        <span className="text-xs text-white font-semibold">
                                            {enabled ? 'Confirm' : ''}
                                        </span>
                                        <span className="text-xs text-[var(--foreground)] group-hover:text-red-600 text-right-1 font-semibold">
                                            {!enabled ? 'Delete' : ''}
                                        </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedScore(score);
                                        setEditModalEnabled(true);
                                      }}
                                      className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold"
                                    >
                                      Edit
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No scores available.</div>
        )}
      </div>
      
    </>
  )
}