'use client'

export default function TryoutsTableSkeleton() {
    return (
        <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)] animate-pulse opacity-50">
            {[...Array(5)].map((_, i) => (
                <tr key={i}>
                    <td className="relative w-12 px-6 sm:w-16 sm:px-8 py-4">
                        <div className="h-4 w-4 rounded bg-[var(--muted)]" />
                    </td>
                    <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1 md:w-1">
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-4 bg-[var(--muted)] rounded" />
                        </div>
                    </td>
                    <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1 md:w-1/6">
                        <div className="flex items-center gap-3">
                            <div className="h-4 bg-[var(--muted)] rounded w-24" />
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                        <div className="flex items-center gap-3">
                            <div className="h-4 bg-[var(--muted)] rounded w-32" />
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/12">
                        <div className="h-4 bg-[var(--muted)] rounded w-16" />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                        <div className="flex items-center gap-3">
                            <div className="h-4 bg-[var(--muted)] rounded w-20" />
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/12">
                        <div className="flex items-center gap-3">
                            <div className="h-4 bg-[var(--muted)] rounded w-8" />
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                        <div className="flex items-center gap-3">
                            <div className="h-4 bg-[var(--muted)] rounded w-24" />
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] w-full sm:w-1 md:w-1/6">
                        <div className="flex items-center gap-3">
                            <div className="h-4 bg-[var(--muted)] rounded w-24" />
                        </div>
                    </td>
                    <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6">
                        <div className="h-6 bg-[var(--muted)] rounded w-16" />
                    </td>
                </tr>
            ))}
        </tbody>
    )
}