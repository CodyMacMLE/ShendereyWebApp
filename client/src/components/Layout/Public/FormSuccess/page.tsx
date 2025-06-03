import { DocumentCheckIcon } from "@heroicons/react/24/outline";

export default function FormSuccess() {
    return (
        <div className="overflow-hidden flex h-[calc(100vh-150px)] bg-white">
            <div className="text-center flex flex-col items-center justify-center w-screen">
                <p className="text-base font-semibold text-[var(--primary)]">
                    <DocumentCheckIcon className="w-10 h-10" />
                </p>
                <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-[var(--foreground)] sm:text-7xl">
                    Form Submitted
                </h1>
                <p className="mt-6 text-pretty text-lg font-medium text-[var(--muted)] sm:text-xl/8">
                    Thank you for submitting your tryout form. We will review your information and get back to you soon.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <a
                        href="/"
                        className="rounded-md bg-[var(--primary)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                        Go back to home
                    </a>
                </div>
            </div>
        </div>
    )
  }
  