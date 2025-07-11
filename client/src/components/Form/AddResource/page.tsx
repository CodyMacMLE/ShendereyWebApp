import { Resource } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";

interface Props {
    setResources: Dispatch<SetStateAction<Resource[]>>;
    setModalEnable: Dispatch<SetStateAction<boolean>>;
}

export default function AddResource({ setResources, setModalEnable }: Props) {

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const resourceFile = formData.get('resourceFile') as File;
        const size = resourceFile.size;
        formData.append('name', formData.get('name') as string);
        formData.append('size', size.toString());
        formData.append('resourceFile', resourceFile);

        const res = await fetch('/api/resources', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            setResources(prev => [...prev, data.body]);
            setModalEnable(false);
        }
    }
    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" name="name" placeholder="Name" className="border border-gray-300 rounded-md p-2" />
                <input type="number" name="size" placeholder="Size" className="border border-gray-300 rounded-md p-2" />
                <input type="file" name="resourceFile" className="border border-gray-300 rounded-md p-2" />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Add Resource</button>
                <button onClick={() => setModalEnable(false)}>Cancel</button>
            </form>
        </div>
    )
}