'use client'

export default function ProductTableSkeleton() {
    return (
        <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)] animate-pulse opacity-50">
            {[...Array(5)].map((_, i) => (
                <tr key={i}>
                <td className="relative w-12 px-6 sm:w-16 sm:px-8 py-4">
                    <div className="h-4 w-4 bg-[var(--muted)] rounded" />
                </td>
                <td className="pl-3 pr-3 sm:pl-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[var(--muted)] rounded" />
                        <div className="h-4 bg-[var(--muted)] rounded w-24" />
                    </div>
                </td>
                <td className="px-3 py-4">
                    <div className="h-4 bg-[var(--muted)] rounded w-20" />
                </td>
                <td className="px-3 py-4">
                    <div className="h-4 bg-[var(--muted)] rounded w-16" />
                </td>
                <td className="px-3 py-4">
                    <div className="h-4 bg-[var(--muted)] rounded w-24" />
                </td>
                <td className="pl-3 pr-4 sm:pr-6 py-4 text-right">
                    <div className="h-6 bg-[var(--muted)] rounded w-14 ml-auto" />
                </td>
                </tr>
            ))}
        </tbody>
    )}
