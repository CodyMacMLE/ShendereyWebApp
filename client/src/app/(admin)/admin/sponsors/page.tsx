'use client'

import SponsorTable from "@/components/UI/Tables/SponsorTable/page";
import { useState, useEffect } from 'react';

type Sponsor = {
    id: number;
    organization: string;
    description: string;
    sponsorLevel: string;
    sponsorImgUrl: string;
    website: string;
  };

export default function Sponsors() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadSponsors = async () => {
            const data = await fetchSponsors();
            setSponsors(data);
            setIsLoading(false);
        };
        loadSponsors();
    }, []);

    useEffect(() => {
    }, [sponsors]);

    const fetchSponsors = async () => {
        try {
            let res = await fetch('/api/sponsors', {
                method: 'GET'
            })
        
            if (res.ok) {
                const parsedData = await res.json();
                return parsedData.body;
            }
        } catch (error) {
            return new Error('Error fetching sponsors');
        }
    }

    return (
        <SponsorTable sponsors={sponsors} setSponsors={setSponsors} isLoading={isLoading} />
    )
    
}