import { Resource } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";

interface Props {
    setResources: Dispatch<SetStateAction<Resource[]>>;
    setModalEnable: Dispatch<SetStateAction<boolean>>;
}

export default function AddResource({ setResources, setModalEnable }: Props) {
    return (
        <div>
            <h1>Add Resource</h1>
        </div>
    )
}