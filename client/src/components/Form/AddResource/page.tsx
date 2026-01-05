import { Resource } from "@/lib/types";
import { Dispatch, SetStateAction, useState } from "react";

interface Props {
    setResources: Dispatch<SetStateAction<Resource[]>>;
    setModalEnable: Dispatch<SetStateAction<boolean>>;
}

export default function AddResource({ setResources, setModalEnable }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const resourceFile = formData.get('resourceFile') as File;
        formData.append('name', formData.get('name') as string);
        formData.append('size', resourceFile.size.toString());
        formData.append('resourceFile', resourceFile);

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/resources', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setResources(prev => [...prev, data.body]);
                setModalEnable(false);
            }
        } catch (err) {
            console.error('Error submitting form', err);
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" name="name" placeholder="Name" className="border border-gray-300 rounded-md p-2" />
                <input type="file" name="resourceFile" className="border border-gray-300 rounded-md p-2" />
                <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Saving...' : 'Add Resource'}
                </button>
                <button onClick={() => setModalEnable(false)}>Cancel</button>
            </form>
        </div>
    )
}