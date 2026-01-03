"use client"

import ErrorModal from "@/components/UI/ErrorModal/page";
import Modal from "@/components/UI/Modal/page";
import { TrashIcon } from "@heroicons/react/24/outline";
import imageCompression from 'browser-image-compression';
import Image from "next/image";
import { useEffect, useState } from "react";

interface Policy {
    id?: number;
    policy: string;
    order: number;
}

interface RegistrationImage {
    id: number;
    imageUrl: string | null;
    title: string | null;
}

export default function Registration() {

    // Page Data
    const [isLoading, setIsLoading] = useState(true);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [enabledStates, setEnabledStates] = useState<{ [key: number]: boolean }>({});
    const [registrationImage, setRegistrationImage] = useState<RegistrationImage | null>(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [sessionTitle, setSessionTitle] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);
    const placeholderSession = `Fall ${new Date().getFullYear()}`;

    // Click outside handler to reset delete confirmations
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.confirm-delete-button')) {
                setEnabledStates((prev) => {
                    const updated = { ...prev };
                    for (const key in updated) {
                        updated[key] = false;
                    }
                    return updated;
                });
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Fetch registration image and policies on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [policiesResponse, imageResponse] = await Promise.all([
                    fetch('/api/register/policies'),
                    fetch('/api/register/session-image')
                ]);
                
                const policiesData = await policiesResponse.json();
                if (policiesData.success) {
                    setPolicies(policiesData.body || []);
                } else {
                    setPolicies([]);
                }

                const imageData = await imageResponse.json();
                if (imageData.success && imageData.body) {
                    setRegistrationImage(imageData.body);
                    setSessionTitle(imageData.body.title || placeholderSession);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setPolicies([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle policy text change
    const handlePolicyChange = (index: number, value: string) => {
        const updatedPolicies = [...policies];
        updatedPolicies[index] = { ...updatedPolicies[index], policy: value };
        setPolicies(updatedPolicies);
    };

    // Add new policy
    const handleAddPolicy = () => {
        const newPolicy: Policy = {
            policy: "",
            order: policies.length,
        };
        setPolicies([...policies, newPolicy]);
    };

    // Toggle enabled state for delete confirmation
    const toggleEnabled = (index: number) => {
        setEnabledStates(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Delete policy
    const handleDeletePolicy = (index: number) => {
        const updatedPolicies = policies.filter((_, i) => i !== index);
        // Reorder remaining policies
        const reorderedPolicies = updatedPolicies.map((policy, i) => ({
            ...policy,
            order: i,
        }));
        setPolicies(reorderedPolicies);
        // Reset the enabled state for this index
        setEnabledStates(prev => {
            const updated = { ...prev };
            delete updated[index];
            return updated;
        });
    };

    // Save all policies
    const handleSave = async () => {
        try {
            setIsSaving(true);
            // Filter out empty policies
            const validPolicies = policies
                .map((policy, index) => ({
                    ...policy,
                    order: index,
                }))
                .filter(p => p.policy.trim() !== "");

            const response = await fetch('/api/register/policies', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ policies: validPolicies }),
            });

            const data = await response.json();
            if (data.success) {
                setPolicies(data.body || []);
                setMessage({ type: 'success', text: 'Policies saved successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Error saving policies: ' + (data.error || 'Unknown error') });
                setTimeout(() => setMessage(null), 5000);
            }
        } catch (error) {
            console.error("Error saving policies:", error);
            setMessage({ type: 'error', text: 'Error saving policies. Please try again.' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle image file selection
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                setFormErrors([{ msg: 'File too large (max 100MB)' }]);
                return;
            }
            let processedFile = file;
            if (file.type.startsWith('image/')) {
                try {
                    processedFile = await imageCompression(file, { 
                        maxSizeMB: 0.8, 
                        maxWidthOrHeight: 1024, 
                        useWebWorker: true 
                    });
                } catch (error) {
                    console.error("Image compression error:", error);
                }
            }
            setImageFile(processedFile);
            const previewUrl = URL.createObjectURL(processedFile);
            setImagePreview(previewUrl);
            setFormErrors([]);
        }
    };

    // Handle image upload
    const handleImageUpload = async () => {
        const errors: { msg: string }[] = [];
        
        if (!imageFile) {
            errors.push({ msg: 'Image file is required' });
        }
        if (!sessionTitle.trim()) {
            errors.push({ msg: 'Title is required' });
        }

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setIsUploading(true);
            setFormErrors([]);

            const formData = new FormData();
            formData.append('image', imageFile!);
            formData.append('title', sessionTitle);

            const response = await fetch('/api/register/session-image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setRegistrationImage(data.body);
                setImageModalOpen(false);
                setImageFile(null);
                setImagePreview(null);
                setSessionTitle("");
                setMessage({ type: 'success', text: 'Registration schedule image updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setFormErrors([{ msg: data.error || 'Failed to upload image' }]);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            setFormErrors([{ msg: 'Error uploading image. Please try again.' }]);
        } finally {
            setIsUploading(false);
        }
    };

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-0">

            {/* Registration Schedule Title */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-[var(--foreground)]">Recreational Class Schedule</h1>
                <p className="text-sm text-[var(--muted)] mt-2">Edit the recreational class schedule for the gym.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => {
                            setImageModalOpen(true);
                            if (registrationImage) {
                                setSessionTitle(registrationImage.title || placeholderSession);
                            }
                        }}
                        className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                        Change Schedule
                    </button>
                </div>
            </div>

            {/* Registration Schedule Content */}
            {isLoading ? (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">Loading...</div>
            ) : (
                <>
                    {/* Registration Schedule Image */}
                    {registrationImage?.imageUrl ? (
                        <div className="mt-6 flex justify-center">
                            <Image
                                src={registrationImage.imageUrl}
                                alt={registrationImage.title || "Registration Schedule"}
                                width={1200}
                                height={800}
                                className="w-full h-auto max-w-4xl rounded-lg border border-[var(--border)]"
                            />
                        </div>
                    ) : (
                        <div className="mt-6 p-6 text-sm text-[var(--muted)] text-center border border-[var(--border)] rounded-lg">
                            No recreational class schedule image uploaded. Click "Change Schedule" to upload one.
                        </div>
                    )}
                </>
            )}

            {/* Image Upload Modal */}
            {imageModalOpen && (
                <Modal title="Change Recreational Class Schedule" setModalEnable={setImageModalOpen}>
                    <div>
                        {formErrors.length > 0 && (
                            <div className="mb-4">
                                <ErrorModal errors={formErrors} />
                            </div>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); handleImageUpload(); }}>
                            <div className="space-y-6">
                                {/* Title Input */}
                                <div>
                                    <label htmlFor="session-title" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                        Session
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            id="session-title"
                                            value={sessionTitle}
                                            onChange={(e) => setSessionTitle(e.target.value)}
                                            className="block w-full rounded-md border-0 py-1.5 px-3 text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--border)] focus:ring-2 focus:ring-inset focus:ring-[var(--primary)] sm:text-sm/6 bg-[var(--background)]"
                                            placeholder={placeholderSession}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Image Input */}
                                <div>
                                    <label htmlFor="schedule-image" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                        Image
                                    </label>
                                    <div className="mt-2 flex items-center gap-x-3">
                                        {imagePreview ? (
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                width={300}
                                                height={200}
                                                className="h-32 w-auto rounded-md object-cover border border-[var(--border)]"
                                            />
                                        ) : registrationImage?.imageUrl ? (
                                            <Image
                                                src={registrationImage.imageUrl}
                                                alt="Current"
                                                width={300}
                                                height={200}
                                                className="h-32 w-auto rounded-md object-cover border border-[var(--border)]"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-32 w-48 bg-[var(--border)] rounded-md">
                                                <span className="text-sm text-[var(--muted)]">No image</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="schedule-image"
                                            onChange={handleImageChange}
                                        />
                                        <label
                                            htmlFor="schedule-image"
                                            className="cursor-pointer rounded-md bg-[var(--background)] px-2.5 py-1.5 text-sm font-bold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--muted)] hover:bg-[var(--primary)] hover:ring-[var(--primary-hover)]"
                                        >
                                            {imageFile ? 'Change' : 'Select Image'}
                                        </label>
                                    </div>
                                    <p className="mt-2 text-sm text-[var(--muted)]">
                                        Image. 100MB max.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageModalOpen(false);
                                        setImageFile(null);
                                        setImagePreview(null);
                                        setFormErrors([]);
                                    }}
                                    className="rounded-md py-2 text-sm font-semibold text-red-600 hover:text-red-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? 'Uploading...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}


            {/* Policies Title */}
            <div className="sm:flex sm:items-center mt-10">
                <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-[var(--foreground)]">Registration Policies</h1>
                <p className="text-sm text-[var(--muted)] mt-2">Edit the registration policies for the gym.</p>
                </div>
            </div>

            {/* Policies Message Display */}
            {message && (
                <div className={`mt-4 rounded-md p-4 ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {/* Policies Content */}
            {isLoading ? (
                <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">Loading...</div>
            ) : (
                <>
                <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-visible shadow outline outline-1 outline-[var(--border)] sm:rounded-lg">
                      <div className="overflow-hidden sm:rounded-lg">
                        <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                        <thead className="bg-[var(--card-bg)]">
                          <tr>
                            <th
                              scope="col"
                              className="w-12 py-3.5 pl-4 pr-2 text-left text-sm font-semibold text-[var(--foreground)]"
                            >
                              Policy
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 px-3 text-left text-sm font-semibold text-[var(--foreground)]"
                            >
                              Description
                            </th>
                            <th scope="col" className="w-16 py-3.5 pl-3 pr-4 text-right">
                              <span className="sr-only">Edit</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                          {policies.length > 0 ? (
                            policies.map((policy, index) => (
                              <tr key={policy.id || `new-${index}`}>
                                <td className="w-12 whitespace-nowrap py-4 pl-4 pr-2 text-sm font-medium text-[var(--foreground)]">
                                  {index + 1}.
                                </td>
                                <td className="py-4 px-3 text-sm text-[var(--foreground)]">
                                  <input
                                    type="text"
                                    value={policy.policy}
                                    onChange={(e) => handlePolicyChange(index, e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="Enter policy description..."
                                  />
                                </td>
                                <td className="w-16 whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                  {(() => {
                                    const enabled = enabledStates[index] || false;
                                    const handleDeleteClick = () => {
                                      if (!enabled) {
                                        toggleEnabled(index);
                                      } else {
                                        handleDeletePolicy(index);
                                      }
                                    };
                                    return (
                                      <button
                                        onClick={handleDeleteClick}
                                        className={`confirm-delete-button cursor-pointer group relative inline-flex p-1 items-center justify-center rounded-full ${enabled ? 'bg-red-600 hover:bg-red-500' : 'hover:bg-red-600'}`}
                                      >
                                        <span className="relative w-[60px] h-[20px] flex items-center justify-center">
                                          <span className={`absolute transition-opacity duration-150 text-xs text-white font-semibold ${enabled ? 'opacity-100' : 'opacity-0'}`}>
                                            Confirm
                                          </span>
                                          <span className={`absolute transition-opacity duration-150 text-xs text-[var(--foreground)] group-hover:text-white font-semibold ${enabled ? 'opacity-0' : 'opacity-100'}`}>
                                            <TrashIcon className="w-4 h-4" />
                                          </span>
                                        </span>
                                      </button>
                                    );
                                  })()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-3 py-4 text-sm text-center text-[var(--muted)]">
                                No policies found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Policies Add and Save Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddPolicy}
                  className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                >
                  + Add Another Policy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              </>
            )
        }
    </div>
    )
}