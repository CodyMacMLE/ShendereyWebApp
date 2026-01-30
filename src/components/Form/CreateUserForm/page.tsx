'use client';
 
import ErrorModal from '@/components/UI/ErrorModal/page';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function CreateUserForm() {

    // Roles
    const [isStaff, setIsStaff] = useState(true);
    const [isAthlete, setIsAthlete] = useState(false);
    const [isProspect, setIsProspect] = useState(false);
    const [isAlumni, setIsAlumni] = useState(false);
    const [isSeniorStaff, setIsSeniorStaff] = useState(false);

    // Photos
    const [staffPhotoFile, setStaffPhotoFile] = useState<File | null>(null);
    const [staffPhotoPreview, setStaffPhotoPreview] = useState<string | null>(null);
    const [athletePhotoFile, setAthletePhotoFile] = useState<File | null>(null);
    const [athletePhotoPreview, setAthletePhotoPreview] = useState<string | null>(null);
    const [prospectPhotoFile, setProspectPhotoFile] = useState<File | null>(null);
    const [prospectPhotoPreview, setProspectPhotoPreview] = useState<string | null>(null);
    const [alumniPhotoFile, setAlumniPhotoFile] = useState<File | null>(null);
    const [alumniPhotoPreview, setAlumniPhotoPreview] = useState<string | null>(null);

    // Form Inputs

    // User
    const [name, setName] = useState('');
    // Staff
    const [staffTitle, setStaffTitle] = useState('');
    const [staffAbout, setStaffAbout] = useState('');
    // Athlete
    const [athleteLevel, setAthleteLevel] = useState('');
    // Prospect
    const [prospectGPA, setProspectGPA] = useState('');
    const [prospectMajor, setProspectMajor] = useState('');
    const [prospectInstitution, setProspectInstitution] = useState('');
    const [prospectGraduationYear, setProspectGraduationYear] = useState('');
    const [prospectAbout, setProspectAbout] = useState('');
    const [prospectInstagram, setProspectInstagram] = useState('');
    const [prospectYoutube, setProspectYoutube] = useState('');
    // Alumni
    const [alumniSchool, setAlumniSchool] = useState('');
    const [alumniGraduationYear, setAlumniGraduationYear] = useState('');
    const [alumniDescription, setAlumniDescription] = useState('');

    // Form Errors
    const [formErrors, setFormErrors] = useState<{ msg: string }[]>([]);
    
    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addAnotherAfterSave, setAddAnotherAfterSave] = useState(false);

    const resetForm = () => {
      // Revoke object URLs to avoid memory leaks
      if (staffPhotoPreview) URL.revokeObjectURL(staffPhotoPreview);
      if (athletePhotoPreview) URL.revokeObjectURL(athletePhotoPreview);
      if (prospectPhotoPreview) URL.revokeObjectURL(prospectPhotoPreview);
      if (alumniPhotoPreview) URL.revokeObjectURL(alumniPhotoPreview);
      setIsStaff(true);
      setIsAthlete(false);
      setIsProspect(false);
      setIsAlumni(false);
      setIsSeniorStaff(false);
      setStaffPhotoFile(null);
      setStaffPhotoPreview(null);
      setAthletePhotoFile(null);
      setAthletePhotoPreview(null);
      setProspectPhotoFile(null);
      setProspectPhotoPreview(null);
      setAlumniPhotoFile(null);
      setAlumniPhotoPreview(null);
      setName('');
      setStaffTitle('');
      setStaffAbout('');
      setAthleteLevel('');
      setProspectGPA('');
      setProspectMajor('');
      setProspectInstitution('');
      setProspectGraduationYear('');
      setProspectAbout('');
      setProspectInstagram('');
      setProspectYoutube('');
      setAlumniSchool('');
      setAlumniGraduationYear('');
      setAlumniDescription('');
      setFormErrors([]);
    };

    const handleSubmit = async () => {
      // Prevent multiple submissions
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      const errors: { msg: string }[] = [];

      if (!name.trim()) errors.push({ msg: 'Name is required.' });
      if (isStaff && !staffTitle.trim()) errors.push({ msg: 'Staff title is required.' });
      if (isStaff && isSeniorStaff && !staffAbout.trim()) errors.push({ msg: 'Senior staff must have a description.' });
      if (isAthlete && !athleteLevel.trim()) errors.push({ msg: 'Athlete level is required.' });
      if (isProspect) {
        if (!prospectGPA.trim()) errors.push({ msg: 'Prospect GPA is required.' });
        if (!prospectGraduationYear.trim()) errors.push({ msg: 'Prospect graduation year is required.' });
        if (!prospectMajor.trim()) errors.push({ msg: 'Prospect major is required.' });
        if (!prospectInstitution.trim()) errors.push({ msg: 'Prospect institution is required.' });
        if (!prospectAbout.trim()) errors.push({ msg: 'Prospect description is required.' });
      }
      if (isAlumni) {
        if (!alumniSchool.trim()) errors.push({ msg: 'Alumni school is required.' });
        if (!alumniGraduationYear.trim()) errors.push({ msg: 'Alumni graduation year is required.' });
        if (!alumniDescription.trim()) errors.push({ msg: 'Alumni description is required.' });
      }

      if (errors.length > 0) {
        setFormErrors(errors);
        setIsSubmitting(false);
        return;
      }

      try {
        setFormErrors([]);
        const form = new FormData();

        // Basic user info
        form.append('name', name);

        // Role flags
        form.append('isCoach', isStaff.toString());
        form.append('isAthlete', isAthlete.toString());
        form.append('isProspect', isProspect.toString());
        form.append('isAlumni', isAlumni.toString());
        form.append('isSeniorStaff', isSeniorStaff.toString());

        // Coach fields
        if (isStaff) {
            form.append('coachTitle', staffTitle);
            form.append('coachDescription', staffAbout);
            if (staffPhotoFile) form.append('coachImg', staffPhotoFile);
        }

        // Athlete fields
        if (isAthlete) {
            form.append('athleteLevel', athleteLevel);
            if (athletePhotoFile) form.append('athleteImg', athletePhotoFile);
        }

        // Prospect fields
        if (isProspect) {
            form.append('prospectGPA', prospectGPA);
            form.append('prospectMajor', prospectMajor);
            form.append('prospectInstitution', prospectInstitution);
            form.append('prospectGraduationYear', prospectGraduationYear);
            form.append('prospectDescription', prospectAbout);
            form.append('prospectInstagram', prospectInstagram);
            form.append('prospectYoutube', prospectYoutube);
            if (prospectPhotoFile) form.append('prospectImg', prospectPhotoFile);
        }

        // Alumni fields
        if (isAlumni) {
          form.append('alumniSchool', alumniSchool);
          form.append('alumniGraduationYear', alumniGraduationYear);
          form.append('alumniDescription', alumniDescription);
          if (alumniPhotoFile) form.append('alumniImg', alumniPhotoFile);
        }

        const res = await fetch('/api/users', {
          method: 'POST',
          body: form
        });

        if (res.ok) {
          try {
            const data = await res.json();
            if (addAnotherAfterSave) {
              resetForm();
              setIsSubmitting(false);
            } else if (data.redirect) {
              window.location.href = data.redirect;
            } else {
              setIsSubmitting(false);
            }
          } catch (parseError) {
            console.error('Failed to parse success response:', parseError);
            setFormErrors([{ msg: 'User created but received an invalid response from server.' }]);
            setIsSubmitting(false);
          }
        } else {
          const contentType = res.headers.get('content-type');
          let errorMessage = `Server error (${res.status}): ${res.statusText || 'Unknown error'}`;
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await res.json();
              if (errorData && errorData.error && typeof errorData.error === 'string') {
                errorMessage = errorData.error;
              } else if (!errorData || (typeof errorData === 'object' && Object.keys(errorData).length === 0)) {
                errorMessage = `Server returned an empty response (${res.status})`;
              } else if (errorData && typeof errorData === 'object') {
                // If we have an object but no error field, stringify it for debugging
                errorMessage = `Server error (${res.status}): ${JSON.stringify(errorData)}`;
              }
            } catch (parseError) {
              console.error('Failed to parse error response:', parseError);
              // errorMessage already set above
            }
          }
          
          console.error('Error submitting form - Status:', res.status, 'StatusText:', res.statusText, 'Message:', errorMessage);
          setFormErrors([{ msg: errorMessage }]);
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error('Submission failed', err);
        setIsSubmitting(false);
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
          setFormErrors([{ msg: 'Authentication required. Please log in again.' }]);
        } else {
          setFormErrors([{ msg: 'An unexpected error occurred. Please try again.' }]);
        }
      }
    };

    // Photo Cleanup
    useEffect(() => {
        return () => {
          if (staffPhotoPreview) URL.revokeObjectURL(staffPhotoPreview);
        };
      }, [staffPhotoPreview]);

    useEffect(() => {
        return () => {
          if (athletePhotoPreview) URL.revokeObjectURL(athletePhotoPreview);
        };
      }, [athletePhotoPreview]);

    useEffect(() => {
        return () => {
          if (prospectPhotoPreview) URL.revokeObjectURL(prospectPhotoPreview);
        };
      }, [prospectPhotoPreview]);

    useEffect(() => {
        return () => {
          if (alumniPhotoPreview) URL.revokeObjectURL(alumniPhotoPreview);
        };
      }, [alumniPhotoPreview]);

    return (
        <div className="divide-y divide-[var(--foreground)]">
            {formErrors.length > 0 && (
              <div className="px-4 pt-6 sm:px-8">
                <ErrorModal errors={formErrors} />
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

            {/* User Tab */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
                <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-[var(--foreground)]">User</h2>
                <p className="mt-1 text-sm/6 text-[var(--muted)]">
                    This information will be displayed publicly so be careful what you share.
                </p>
            </div>

                <div className="bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)] sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="name" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Marilyn Hayes"
                                        className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Default Roles */}
                        <fieldset className='mt-8'>
                            <legend className="text-sm/6 font-medium text-[var(--foreground)]">Roles</legend>
                            <p id="Roles-description" className="text-[var(--muted)] text-sm">
                                Choose whether the user is an athlete, staff member or both.
                            </p>
                            
                            {/* Staff Role */}
                            <div className="flex gap-3 mt-4">
                                <div className="flex h-6 shrink-0 items-center">
                                    <div className="group grid size-4 grid-cols-1">
                                        <input
                                        id="staff"
                                        name="staff"
                                        type="checkbox"
                                        aria-describedby="staff-description"
                                        className="col-start-1 row-start-1 appearance-none rounded border border-[var(--border)] bg-[var(--background)] checked:border-[var(--primary)] checked:bg-[var(--primary)] indeterminate:border-[var(--primary)] indeterminate:bg-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:border-[var(--border)] disabled:[var(--muted)] disabled:checked:bg-[var(--muted)] forced-colors:appearance-auto"
                                        checked={isStaff}
                                        onChange={() => {
                                            if (isStaff && !isAthlete) return; // prevent unchecking if it would leave both unchecked
                                            setIsStaff(!isStaff);
                                        }}
                                        />
                                        <svg
                                        fill="none"
                                        viewBox="0 0 14 14"
                                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-[var(--background)] group-has-[:disabled]:stroke-gray-950/25"
                                        >
                                        <path
                                            d="M3 8L6 11L11 3.5"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-0 group-has-[:checked]:opacity-100"
                                        />
                                        <path
                                            d="M3 7H11"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                        />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-sm/6">
                                    <label htmlFor="staff" className="font-medium text-[var(--foreground)]">
                                        Staff
                                    </label>
                                </div>
                            </div>

                            {/* Athlete Role */}
                            <div className="mt-6 space-y-6">
                                <div className="flex gap-3">
                                    <div className="flex h-6 shrink-0 items-center">
                                        <div className="group grid size-4 grid-cols-1">
                                            <input
                                            id="Athlete"
                                            name="Athlete"
                                            type="checkbox"
                                            aria-describedby="athlete-description"
                                            className="col-start-1 row-start-1 appearance-none rounded border border-[var(--border)] bg-[var(--background)] checked:border-[var(--primary)] checked:bg-[var(--primary)] indeterminate:border-[var(--primary)] indeterminate:bg-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:border-[var(--border)] disabled:[var(--muted)] disabled:checked:bg-[var(--muted)] forced-colors:appearance-auto"
                                            checked={isAthlete}
                                            onChange={() => {
                                                if (isAthlete && !isStaff) return;
                                                const newIsAthlete = !isAthlete;
                                                setIsAthlete(newIsAthlete);
                                                if (!newIsAthlete) {
                                                    setIsProspect(false);
                                                    setIsAlumni(false);
                                                }
                                            }}
                                            />
                                            <svg
                                            fill="none"
                                            viewBox="0 0 14 14"
                                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-[var(--background)] group-has-[:disabled]:stroke-gray-950/25"
                                            >
                                            <path
                                                d="M3 8L6 11L11 3.5"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0 group-has-[:checked]:opacity-100"
                                            />
                                            <path
                                                d="M3 7H11"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                            />
                                            </svg>
                                        </div>
                                    </div>
                                <div className="text-sm/6">
                                    <label htmlFor="athlete" className="font-medium text-[var(--foreground)]">
                                        Athlete
                                    </label>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* Athlete Specific Roles */}
                    {isAthlete && (
                    <fieldset className='mt-8 pl-8'>
                            <legend className="text-sm/6 font-medium text-[var(--foreground)]">Athlete Roles</legend>
                            <p id="athlete-role-description" className="text-[var(--muted)] text-sm">
                                Choose whether the athlete is a prospect, alumni or neither.
                            </p>
                            {/* Prospect Role */}
                            <div className="mt-4 space-y-6">
                                <div className="flex gap-3">
                                    <div className="flex h-6 shrink-0 items-center">
                                        <div className="group grid size-4 grid-cols-1">
                                            <input
                                              id="prospect-athlete"
                                              name="prospect-athlete"
                                              type="checkbox"
                                              checked={isProspect}
                                              onChange={() => {
                                                setIsProspect(!isProspect);
                                                if (!isProspect) setIsAlumni(false);
                                              }}
                                              aria-describedby="prospect-athlete-description"
                                              className="col-start-1 row-start-1 appearance-none rounded border border-[var(--border)] bg-[var(--background)] checked:border-[var(--primary)] checked:bg-[var(--primary)] indeterminate:border-[var(--primary)] indeterminate:bg-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:border-[var(--border)] disabled:[var(--muted)] disabled:checked:bg-[var(--muted)] forced-colors:appearance-auto"
                                            />
                                            <svg
                                            fill="none"
                                            viewBox="0 0 14 14"
                                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-[var(--background)] group-has-[:disabled]:stroke-gray-950/25"
                                            >
                                            <path
                                                d="M3 8L6 11L11 3.5"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0 group-has-[:checked]:opacity-100"
                                            />
                                            <path
                                                d="M3 7H11"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                            />
                                            </svg>
                                        </div>
                                    </div>
                                <div className="text-sm/6">
                                    <label htmlFor="prospect-athlete" className="font-medium text-[var(--foreground)]">
                                        Prospect
                                    </label>
                                </div>
                            </div>
                            
                            {/* Alumni Role */}
                            <div className="flex gap-3">
                                <div className="flex h-6 shrink-0 items-center">
                                    <div className="group grid size-4 grid-cols-1">
                                        <input
                                          id="alumni"
                                          name="alumni"
                                          type="checkbox"
                                          checked={isAlumni}
                                          onChange={() => {
                                            setIsAlumni(!isAlumni);
                                            if (!isAlumni) setIsProspect(false);
                                          }}
                                          aria-describedby="alumni-description"
                                          className="col-start-1 row-start-1 appearance-none rounded border border-[var(--border)] bg-[var(--background)] checked:border-[var(--primary)] checked:bg-[var(--primary)] indeterminate:border-[var(--primary)] indeterminate:bg-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:border-[var(--border)] disabled:[var(--muted)] disabled:checked:bg-[var(--muted)] forced-colors:appearance-auto"
                                        />
                                        <svg
                                        fill="none"
                                        viewBox="0 0 14 14"
                                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-[var(--background)] group-has-[:disabled]:stroke-gray-950/25"
                                        >
                                        <path
                                            d="M3 8L6 11L11 3.5"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-0 group-has-[:checked]:opacity-100"
                                        />
                                        <path
                                            d="M3 7H11"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                        />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-sm/6">
                                    <label htmlFor="alumni" className="font-medium text-[var(--foreground)]">
                                        Alumni
                                    </label>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    )}   
                    </div>
                </div>
            </div>

            {/* Staff Tab */}
            {isStaff && (
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
                <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-[var(--foreground)]">Staff Information</h2>
                <p className="mt-1 text-sm/6 text-[var(--muted)]">Staff specific information.</p>
                </div>

                <div className="bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)] sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            {/* Staff Title */}
                            <div className="sm:col-span-4">
                                <label htmlFor="staff-title" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Staff Title
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="staff-title"
                                        name="staff-title"
                                        type="staff-title"
                                        value={staffTitle}
                                        onChange={(e) => setStaffTitle(e.target.value)}
                                        className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            {/* Senior Staff */}
                            <div className='col-span-full'>
                                <legend className="text-sm/6 font-medium text-[var(--foreground)]">Senior Staff</legend>    
                                <div className="flex gap-3 mt-4">
                                    <div className="flex h-6 shrink-0 items-center">
                                        <div className="group grid size-4 grid-cols-1">
                                            <input
                                            id="staff"
                                            name="staff"
                                            type="checkbox"
                                            aria-describedby="staff-description"
                                            className="col-start-1 row-start-1 appearance-none rounded border border-[var(--muted)] bg-[var(--background)] checked:border-[var(--primary)] checked:bg-[var(--primary)] indeterminate:border-[var(--primary)] indeterminate:bg-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:border-[var(--muted)] disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                            checked={isSeniorStaff}
                                            onChange={() => isSeniorStaff ? setIsSeniorStaff(false) : setIsSeniorStaff(true)}
                                            />
                                            <svg
                                            fill="none"
                                            viewBox="0 0 14 14"
                                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-[var(--background)] group-has-[:disabled]:stroke-gray-950/25"
                                            >
                                            <path
                                                d="M3 8L6 11L11 3.5"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0 group-has-[:checked]:opacity-100"
                                            />
                                            <path
                                                d="M3 7H11"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                            />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-sm/6">
                                        <label htmlFor="staff" className="font-medium text-[var(--foreground)]">
                                            Is this member a senior staff member?
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Photo */}
                            <div className="col-span-full">
                                <label htmlFor="staff-photo" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                    Staff Photo
                                </label>
                                <div className="mt-2 flex items-center gap-x-3">
                                    {!isSeniorStaff && (staffPhotoPreview ? (
                                    <Image src={staffPhotoPreview} alt="Staff" className="h-12 w-12 rounded-full object-cover" 
                                        width={1000}
                                        height={1000}
                                    />
                                    ) : (
                                    <div className='flex items-center justify-center h-12 w-12 rounded-full'>
                                        <UserCircleIcon aria-hidden="true" className="size-12 text-[var(--muted)]" />
                                    </div>
                                    ))}
                                    {isSeniorStaff && (staffPhotoPreview ? (
                                    <Image src={staffPhotoPreview} alt="Staff" className="h-[225px] w-[150px] rounded-md object-cover" 
                                        width={1000}
                                        height={1000}
                                    />
                                    ) : (
                                    <div className='flex items-center justify-center bg-[var(--border)] h-[225px] w-[150px] rounded-md'>
                                        <UserCircleIcon aria-hidden="true" className="size-12 text-[var(--muted)]" />
                                    </div>
                                    ))}
                                    <div>
                                        <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="upload-staff-photo"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            if (file.size > 100 * 1024 * 1024) {
                                              console.warn("File too large (max 10MB):", file.name);
                                              return;
                                            }
                                            const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1024, useWebWorker: true });
                                            setStaffPhotoFile(compressed);
                                            const previewUrl = URL.createObjectURL(compressed);
                                            setStaffPhotoPreview(previewUrl);
                                          }
                                        }}
                                        />
                                        <label
                                            htmlFor="upload-staff-photo"
                                            className="cursor-pointer rounded-md bg-[var(--background)] px-2.5 py-1.5 text-sm font-bold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--muted)] hover:bg-[var(--primary)] hover:ring-[var(--primary-hover)]"
                                        >
                                            Change
                                        </label>
                                    </div>
                                    
                            </div>
                            <p id="image-warning" className="text-[var(--muted)] text-sm mt-2">
                                JPG, or PNG. 10MB max.
                            </p>
                        </div>

                            {/* Staff Description */}
                            {isSeniorStaff && (
                            <div className="col-span-full">
                                <label htmlFor="staff-about" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                About
                                </label>
                                <div className="mt-2">
                                <textarea
                                    id="staff-about"
                                    name="staff-about"
                                    value={staffAbout}
                                    onChange={(e) => setStaffAbout(e.target.value)}
                                    rows={3}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                                <p className="mt-3 text-sm/6 text-[var(--muted)]">Write a few sentences about the staff member.</p>
                            </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            )}
            
            {/* Athlete Tab */}
            {isAthlete && (
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
                <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-[var(--foreground)]">Athlete Information</h2>
                <p className="mt-1 text-sm/6 text-[var(--muted)]">Default athlete specific information that is used for all versions of the athlete.</p>
                </div>

                <div className="bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)] sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            
                            {/* Athlete Photo */}
                            <div className="col-span-full">
                                <label htmlFor="athlete-photo" className="block text-sm/6 font-medium text-[var(--foreground)]">Athlete Photo</label>
                                <div className="mt-2 flex items-center gap-x-3">
                                    {athletePhotoPreview ? (
                                    <Image src={athletePhotoPreview} alt="Athlete" className="h-12 w-12 rounded-full object-cover" 
                                        width={1000}
                                        height={1000}
                                    />
                                    ) : (
                                    <div className='flex items-center justify-center h-12 w-12 rounded-full'>
                                        <UserCircleIcon aria-hidden="true" className="size-12 text-[var(--muted)]" />
                                    </div>
                                    )}
                                    <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="upload-athlete-photo"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                        if (file.size > 100 * 1024 * 1024) {
                                            console.warn("File too large (max 10MB):", file.name);
                                            return;
                                        }
                                        const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1024, useWebWorker: true });
                                        setAthletePhotoFile(compressed);
                                        const previewUrl = URL.createObjectURL(compressed);
                                        setAthletePhotoPreview(previewUrl);
                                        }
                                    }}
                                    />
                                    <label htmlFor="upload-athlete-photo" className="cursor-pointer rounded-md bg-[var(--background)] px-2.5 py-1.5 text-sm font-bold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--muted)] hover:bg-[var(--primary)] hover:ring-[var(--primary-hover)]">
                                        Change
                                    </label>
                                </div>
                                <p id="image-warning" className="text-[var(--muted)] text-sm mt-2">
                                    JPG, or PNG. 10MB max.
                                </p>
                            </div>

                            {/* Athlete Level */}
                            <div className="sm:col-span-4">
                                <label htmlFor="athlete-level" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Athlete Level
                                </label>
                                <div className="mt-2">
                                <input
                                    id="athlete-level"
                                    name="athlete-level"
                                    type="athlete-level"
                                    value={athleteLevel}
                                    onChange={(e) => setAthleteLevel(e.target.value)}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Prospect Tab */}
            {isProspect && (
                <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
                <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-[var(--foreground)]">Prospect Information</h2>
                <p className="mt-1 text-sm/6 text-[var(--muted)]">Prospect specific information for athletes looking for NCAA scholarships.</p>
                </div>

                <div className="bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)] sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            {/* Prospect Photo */}
                            <div className="col-span-full">
                              <label htmlFor="prospect-photo" className="block text-sm/6 font-medium text-[var(--foreground)]">Prospect Photo</label>
                              <div className="mt-2 flex items-center gap-x-3">
                              {prospectPhotoPreview ? (
                                <Image src={prospectPhotoPreview} alt="Prospect" className="h-[225px] w-[150px] rounded-md object-cover" 
                                    width={1000}
                                    height={1000}
                                />
                                ) : (
                                <div className='flex items-center justify-center h-[225px] w-[150px] bg-[var(--border)] rounded-md'>
                                    <UserCircleIcon aria-hidden="true" className="size-12 text-[var(--muted)]" />
                                </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id="upload-prospect-photo"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 100 * 1024 * 1024) {
                                        console.warn("File too large (max 10MB):", file.name);
                                        return;
                                      }
                                      const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1024, useWebWorker: true });
                                      setProspectPhotoFile(compressed);
                                      const previewUrl = URL.createObjectURL(compressed);
                                      setProspectPhotoPreview(previewUrl);
                                    }
                                  }}
                                />
                                <label 
                                    htmlFor="upload-prospect-photo" 
                                    className="cursor-pointer rounded-md bg-[var(--background)] px-2.5 py-1.5 text-sm font-bold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--muted)] hover:bg-[var(--primary)] hover:ring-[var(--primary-hover)]"
                                >
                                    Change
                                </label>
                                </div>
                                <p id="image-warning" className="text-[var(--muted)] text-sm mt-2">
                                    JPG, or PNG. 10MB max.
                                </p>
                            </div>

                            
                            {/* Prospect GPA */}
                            <div className="sm:col-span-2">
                                <label htmlFor="prospect-title" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Current GPA
                                </label>
                                <div className="mt-2">
                                <input
                                    id="prospect-title"
                                    name="prospect-title"
                                    type="number"
                                    value={prospectGPA}
                                    onChange={(e) => setProspectGPA(e.target.value)}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                            </div>

                            {/* Prospect Graduation Year */}
                            <div className="sm:col-span-2">
                                <label htmlFor="prospect-graduation-year" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Graduation Year
                                </label>
                                <div className="mt-2">
                                <input
                                    id="prospect-graduation-year"
                                    name="prospect-graduation-year"
                                    type="number"
                                    value={prospectGraduationYear}
                                    onChange={(e) => setProspectGraduationYear(e.target.value)}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                            </div>

                            {/* Prospect Majors of Interest */}
                            <div className="sm:col-span-3">
                                <label htmlFor="prospect-major" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Majors of Interest
                                </label>
                                <div className="mt-2">
                                <input
                                    id="prospect-major"
                                    name="prospect-major"
                                    type="text"
                                    value={prospectMajor}
                                    onChange={(e) => setProspectMajor(e.target.value)}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                            </div>

                            {/* Prospect Schools of Interest */}
                            <div className="col-span-full">
                                <label htmlFor="prospect-schools-of-interest" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Schools of Interest
                                </label>
                                <div className="mt-2">
                                <textarea
                                    id="prospect-schools-of-interest"
                                    name="prospect-schools-of-interest"
                                    value={prospectInstitution}
                                    onChange={(e) => setProspectInstitution(e.target.value)}
                                    rows={2}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                                <p className="mt-3 text-sm/6 text-[var(--muted)]">Insert the prospects schools of interest.</p>
                            </div>

                            {/* Prospect Description */}
                            <div className="col-span-full">
                                <label htmlFor="prospect-about" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                About
                                </label>
                                <div className="mt-2">
                                <textarea
                                    id="prospect-about"
                                    name="prospect-about"
                                    value={prospectAbout}
                                    onChange={(e) => setProspectAbout(e.target.value)}
                                    rows={3}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                                <p className="mt-3 text-sm/6 text-[var(--muted)]">Write a few sentences about the athlete prospect.</p>
                            </div>

                            {/* Instagram Link */}
                            <div className="sm:col-span-4">
                                <label htmlFor="instagram" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Instagram
                                </label>
                                <div className="mt-2">
                                <div className="flex items-center rounded-md bg-[var(--background)] pl-3 outline outline-1 -outline-offset-1 outline-[var(--muted)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <div className="shrink-0 select-none text-base text-[var(--muted)] sm:text-sm/6">www.instagram.com/</div>
                                    <input
                                    id="instagram"
                                    name="instagram"
                                    type="text"
                                    value={prospectInstagram}
                                    onChange={(e) => setProspectInstagram(e.target.value)}
                                    placeholder="shendereygymnastics"
                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                                </div>
                            </div>

                            {/* Youtube Link */}
                            <div className="sm:col-span-4">
                                <label htmlFor="youtube" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Youtube
                                </label>
                                <div className="mt-2">
                                <div className="flex items-center rounded-md bg-[var(--background)] pl-3 outline outline-1 -outline-offset-1 outline-[var(--muted)] focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--primary)]">
                                    <div className="shrink-0 select-none text-base text-[var(--muted)] sm:text-sm/6">www.youtube.com/</div>
                                    <input
                                    id="youtube"
                                    name="youtube"
                                    type="text"
                                    value={prospectYoutube}
                                    onChange={(e) => setProspectYoutube(e.target.value)}
                                    placeholder="shendereygymnastics"
                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Alumni Tab */}
            {isAlumni && (
                <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
                <div className="px-4 sm:px-0">
                <h2 className="text-base/7 font-semibold text-[var(--foreground)]">Alumni Information</h2>
                <p className="mt-1 text-sm/6 text-[var(--muted)]">Alumni specific information for athletes recieving a NCAA scholarship.</p>
                </div>

                <div className="bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)] sm:rounded-xl md:col-span-2">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            {/* Alumni Photo */}
                            <div className="col-span-full">
                                <label htmlFor="alumni-photo" className="block text-sm/6 font-medium text-[var(--foreground)]">Alumni Photo</label>
                                <div className="mt-2 flex items-center gap-x-3">
                                {alumniPhotoPreview ? (
                                    <Image src={alumniPhotoPreview} alt="Alumni" className="h-[225px] w-[150px] rounded-md object-cover" 
                                        width={1000}
                                        height={1000}
                                    />
                                    ) : (
                                    <div className='flex items-center justify-center h-[225px] w-[150px] bg-[var(--border)] rounded-md'>
                                        <UserCircleIcon aria-hidden="true" className="size-12 text-[var(--muted)]" />
                                    </div>
                                    )}
                                    <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="upload-alumni-photo"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                        if (file.size > 100 * 1024 * 1024) {
                                            console.warn("File too large (max 10MB):", file.name);
                                            return;
                                        }
                                        const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1024, useWebWorker: true });
                                        setAlumniPhotoFile(compressed);
                                        const previewUrl = URL.createObjectURL(compressed);
                                        setAlumniPhotoPreview(previewUrl);
                                        }
                                    }}
                                    />
                                    <label 
                                        htmlFor="upload-alumni-photo" 
                                        className="cursor-pointer rounded-md bg-[var(--background)] px-2.5 py-1.5 text-sm font-bold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--muted)] hover:bg-[var(--primary)] hover:ring-[var(--primary-hover)]"
                                    >
                                        Change
                                    </label>
                                </div>
                                <p id="image-warning" className="text-[var(--muted)] text-sm mt-2">
                                    JPG, or PNG. 10MB max.
                                </p>
                            </div>
                            

                            
                            {/* Alumni School */}
                            <div className="sm:col-span-3">
                                <label htmlFor="alumni-title" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                School
                                </label>
                                <div className="mt-2">
                                <input
                                    id="alumni-school"
                                    name="alumni-school"
                                    type="text"
                                    value={alumniSchool}
                                    onChange={(e) => setAlumniSchool(e.target.value)}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                            </div>

                            {/* Alumni Graduation Year */}
                            <div className="sm:col-span-2">
                                <label htmlFor="alumni-graduation-year" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                Graduation Year
                                </label>
                                <div className="mt-2">
                                <input
                                    id="alumni-graduation-year"
                                    name="alumni-graduation-year"
                                    type="number"
                                    value={alumniGraduationYear}
                                    onChange={(e) => setAlumniGraduationYear(e.target.value)}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                            </div>

                            {/* Alumni Description */}
                            <div className="col-span-full">
                                <label htmlFor="alumni-about" className="block text-sm/6 font-medium text-[var(--foreground)]">
                                About
                                </label>
                                <div className="mt-2">
                                <textarea
                                    id="alumni-about"
                                    name="alumni-about"
                                    value={alumniDescription}
                                    onChange={(e) => setAlumniDescription(e.target.value)}
                                    rows={3}
                                    className="block w-full rounded-md bg-[var(--background)] px-3 py-1.5 text-base text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--muted)] placeholder:text-[var(--muted)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
                                />
                                </div>
                                <p className="mt-3 text-sm/6 text-[var(--muted)]">Write a few sentences about the alumni.</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Submit Form */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div className="px-4 sm:px-0"></div>
                <div className="md:col-span-2">
                    <div className="flex flex-wrap items-center justify-end gap-x-6 px-4 py-4 sm:px-8">
                        <label className="flex items-center gap-2 cursor-pointer text-sm/6 text-[var(--foreground)] mt-4">
                            <input
                                type="checkbox"
                                checked={addAnotherAfterSave}
                                onChange={(e) => setAddAnotherAfterSave(e.target.checked)}
                                className="rounded border-[var(--border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span>Create Another User</span>
                        </label>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
                        <button 
                            type="button" 
                            className="text-sm/6 font-semibold text-[var(--foreground)] hover:text-red-600 cursor-pointer"
                            onClick={() => window.location.href = '/admin/users'}
                        >
                        Cancel
                        </button>
                        <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)]"
                        >
                            {isSubmitting ? 'Submitting...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            </form>
        </div>
    )
}