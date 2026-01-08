'use client'

export default function ResourceTableSkeleton() {
    return (
        <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)] animate-pulse opacity-50">
            {[...Array(5)].map((_, i) => (
                <tr key={i}>
                    <td className="pl-3 pr-3 sm:pl-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-4 bg-[var(--muted)] rounded w-24" />
                        </div>
                    </td>
                    <td className="px-3 py-4">
                        <div className="h-4 bg-[var(--muted)] rounded w-16" />
                    </td>
                    <td className="px-3 py-4">
                        <div className="h-4 bg-[var(--muted)] rounded w-16" />
                    </td>
                    <td className="px-3 py-4 text-center">
                        <div className="flex items-center justify-center">
                            <div className="h-6 bg-[var(--muted)] rounded w-12" />
                        </div>
                    </td>
                    <td className="pr-6 py-4">
                        <div className="flex items-center justify-end gap-6">
                            <div className="h-6 bg-[var(--muted)] rounded w-16" />
                            <div className="h-6 bg-[var(--muted)] rounded w-12" />
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    )
}