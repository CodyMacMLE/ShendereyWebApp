import ErrorModal from "@/components/UI/ErrorModal/page";
import { Resource } from "@/lib/types";
import { Dispatch, SetStateAction, useState } from "react";

interface Props {
    resource: Resource;
    setResources: Dispatch<SetStateAction<Resource[]>>;
    setModalEnable: Dispatch<SetStateAction<boolean>>;
}

export default function EditResource({ resource, setResources, setModalEnable }: Props ) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const resourceFile = formData.get('resourceFile') as File;
        formData.append('id', resource.id.toString());
        formData.append('name', formData.get('name') as string);
        
        // Only add file-related data if a new file is selected
        if (resourceFile && resourceFile.size > 0) {
            formData.append('size', resourceFile.size.toString());
            formData.append('resourceFile', resourceFile);
        } else {
            // Use existing resource size if no new file
            formData.append('size', resource.size.toString());
        }

        setIsSubmitting(true);
        setFormErrors([]);
        try {
            const res = await fetch('/api/resources', {
                method: 'PUT',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setResources(prev => prev.map(r => r.id === resource.id ? data.body : r));
                setModalEnable(false);
            } else {
                setFormErrors([{ msg: data.error || 'Failed to update resource. Please try again.' }]);
            }
        } catch (err) {
            console.error('Error submitting form', err);
            setFormErrors([{ msg: 'An unexpected error occurred. Please try again.' }]);
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <div>
            {formErrors.length > 0 && (
                <div className="px-4 pt-6 sm:px-8">
                    <ErrorModal errors={formErrors} />
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" name="name" placeholder="Name" className="border border-gray-300 rounded-md p-2" />
                <input type="file" name="resourceFile" className="border border-gray-300 rounded-md p-2" />
                <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Saving...' : 'Edit Resource'}
                </button>
                <button onClick={() => setModalEnable(false)}>Cancel</button>
            </form>
        </div>
    )
}