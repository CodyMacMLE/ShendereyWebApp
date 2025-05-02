import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type Achievement =  {
    id: number,
    athlete: number,
    title: string,
    description: string,
    date: Date,
}

export default function AddAchievement({ athleteId, setAthleteAchievements, setModalEnable }: 
    {   athleteId: number,
        setAthleteAchievements: Dispatch<SetStateAction<Achievement[]>>
        setModalEnable?: Dispatch<SetStateAction<boolean>>;
    }
) {
    return (<></>)
}