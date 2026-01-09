"use client"

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import AddResource from '@/components/Form/AddResource/page';
import EditResource from '@/components/Form/EditResource/page';
import Modal from "@/components/UI/Modal/page";
import { Resource } from '@/lib/types';
import ResourceTableSkeleton from './ResourceTableSkeleton';

// Helper function to convert bytes to human-readable format
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface Props {
    resources: Resource[];
    setResources: Dispatch<SetStateAction<Resource[]>>;
    isLoading?: boolean
}

export default function ResourceTable({ resources, setResources, isLoading }: Props) {

    const [editModal, setEditModal] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [enabledStates, setEnabledStates] = useState<{ [key: string]: boolean }>({});
    const [deletingStates, setDeletingStates] = useState<{ [key: string]: boolean }>({});

    // Toggle enabled state for delete confirmation
    const toggleEnabled = (resourceId: number) => {
        setEnabledStates(prev => ({
            ...prev,
            [resourceId.toString()]: !prev[resourceId.toString()]
        }));
    };

    // Global click detection for delete confirm button
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.confirm-delete-button')) {
                setEnabledStates({});
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Delete Resource
    const deleteResource = async (resourceId : number) => {
        const resourceIdStr = resourceId.toString();
        setDeletingStates(prev => ({ ...prev, [resourceIdStr]: true }));
        try {
            const res = await fetch(`/api/resources/${resourceId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                const data = await res.json();
                if (data.body) {
                    const newArray = resources.filter(resource => resource.id !== data.body);
                    setResources(newArray);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingStates(prev => {
                const newState = { ...prev };
                delete newState[resourceIdStr];
                return newState;
            });
            setEnabledStates(prev => {
                const newState = { ...prev };
                delete newState[resourceIdStr];
                return newState;
            });
        }
    }



    return (
      <>
        {editModal && selectedResource !== null && selectedResource ? (
          <Modal title="Edit Resource" setModalEnable={setEditModal}>
            <EditResource resource={selectedResource} setResources={setResources} setModalEnable={setEditModal} />
          </Modal>
        ) : null}

        {addModal && (
          <Modal title="Add Resource" setModalEnable={setAddModal}>
            <AddResource setResources={setResources} setModalEnable={setAddModal} />
          </Modal>
        )}

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold text-[var(--foreground)]">Resources</h1>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
                type="button"
                className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                onClick={() => setAddModal(true)}
              >
                Add Resource
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-[var(--border)]">
                      <thead className="bg-[var(--card-bg)]">
                        <tr>
                          <th className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4 sm:w-1/3 md:w-1/4">Name</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Size</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Views</th>
                            <th className="px-3 py-3.5 text-center text-sm font-semibold text-[var(--foreground)]">View</th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                        </tr>
                      </thead>
                      <ResourceTableSkeleton />
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : resources.length > 0 && resources ? (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--card-bg)]">
                      <tr>
                        <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4 sm:w-1/3 md:w-1/4">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Size
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Views
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-[var(--foreground)]">
                          View
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                      {resources.map((resource: Resource, idx: number) => {
                        // Skip resources without an ID or with invalid data
                        if (!resource || typeof resource.id === 'undefined' || resource.id === null) {
                          console.warn('Invalid resource:', resource);
                          return null;
                        }
                        
                        const enabled = enabledStates[resource.id.toString()] || false;
                        const isDeleting = deletingStates[resource.id.toString()] || false;

                        const handleDeleteClick = async () => {
                          if (isDeleting) return;
                          if (!enabled) {
                            toggleEnabled(resource.id);
                          } else {
                            await deleteResource(resource.id);
                          }
                        };

                        return (
                          <tr
                            key={resource.id ?? idx}
                            className="transition-colors duration-150"
                          >
                            <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1/3 md:w-1/4 max-w-[220px]">
                              <div className="flex items-center gap-3">
                                <span>{resource.name}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1/3 md:w-1/4 min-w-[160px]">
                              <div className="flex items-center gap-3">
                                {formatFileSize(resource.size)}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] max-w-xs truncate">
                                {resource.views}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] text-center w-full sm:w-1/3 md:w-1/4 min-w-[160px]">
                              <div className="flex items-center justify-center gap-3">
                                <button 
                                    onClick={() => {
                                        // Open PDF directly in Google Docs Viewer
                                        window.open(`https://docs.google.com/viewer?url=${resource.resourceUrl}`, '_blank');
                                    }}
                                    className="text-[var(--primary)] bg-[var(--card-bg)] hover:text-[var(--background)] hover:bg-[var(--primary)] cursor-pointer rounded-full ring-1 ring-[var(--border)] py-1 px-3">
                                    Open<span className="sr-only">, {resource.name}</span>
                                </button>
                              </div>
                            </td>
                            <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6">
                                <button
                                    onClick={() => {
                                        handleDeleteClick();
                                    }}
                                    disabled={isDeleting}
                                    className={`confirm-delete-button relative inline-flex h-6 w-16 items-center justify-center rounded-full ${isDeleting ? 'bg-gray-400 cursor-not-allowed opacity-60' : enabled ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-[var(--background) hover:bg-[var(--muted)]/5 cursor-pointer'} ring-1 ring-[var(--border)]`}
                                >
                                    {isDeleting ? (
                                        <span className="text-xs text-white font-semibold">...</span>
                                    ) : (
                                        <>
                                            <span className="text-xs text-white font-semibold">
                                                {enabled ? 'Confirm' : ''}
                                            </span>
                                            <span className="text-xs text-[var(--foreground)] group-hover:text-red-600 text-right-1 font-semibold">
                                                {!enabled ? 'Delete' : ''}
                                            </span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                    setSelectedResource(resource);
                                    setEditModal(true);
                                    }}
                                    className="text-[var(--primary)] bg-[var(--card-bg)] hover:text-[var(--background)] hover:bg-[var(--primary)] cursor-pointer rounded-full ring-1 ring-[var(--border)] py-1 px-3">
                                    Edit<span className="sr-only">, {resource.name}</span>
                                </button>
                            </td>
                          </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No resources available.</div>
          )}
        </div>
      </>
    )
  }