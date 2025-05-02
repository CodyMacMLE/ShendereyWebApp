import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type Achievement =  {
    id: number,
    athlete: number,
    title: string,
    description: string,
    date: Date,
}

export default function EditAchievement({ athleteId, setAthleteAchievements, setModalEnable }: 
    {   athleteId: number,
        setAthleteAchievements: Dispatch<SetStateAction<boolean>>
        setModalEnable?: Dispatch<SetStateAction<boolean>>;
    }
) {
    return (<></>)
}