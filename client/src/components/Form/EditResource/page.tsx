import { Resource } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";

interface Props {
    resource: Resource;
    setResources: Dispatch<SetStateAction<Resource[]>>;
    setModalEnable: Dispatch<SetStateAction<boolean>>;
}

export default function EditResource({ resource, setResources, setModalEnable }: Props ) {
    return (
        <div>
            <h1>Edit Resource</h1>
        </div>
    )
}