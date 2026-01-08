"use client"

import ResourceTable from "@/components/UI/Tables/ResourcesTable/page";
import { Resource } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Resources() {

    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            const res = await fetch('/api/resources');
            const data = await res.json();
            setResources(data.body);
            setIsLoading(false);
        }
        fetchResources();
    }, []);

    return (
        <ResourceTable resources={resources} setResources={setResources} isLoading={isLoading} />
    )
}