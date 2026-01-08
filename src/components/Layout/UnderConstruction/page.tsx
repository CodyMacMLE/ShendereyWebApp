export default function UnderConstruction() {
    return (
        <div className="overflow-hidden flex h-[calc(100vh-150px)]">
            <div className="text-center flex flex-col items-center justify-center w-screen">
                <p className="text-base font-semibold text-[var(--primary)]">404</p>
                <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-[var(--foreground)] sm:text-7xl">
                    Under Construction
                </h1>
                <p className="mt-6 text-pretty text-lg font-medium text-[var(--muted)] sm:text-xl/8">
                    This page is currently under construction.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <a
                        href="/admin"
                        className="rounded-md bg-[var(--primary)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                        Go back to dashboard
                    </a>
                </div>
            </div>
        </div>
    )
  }
  