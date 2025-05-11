'use client'

export default function LoadingTable() {
    return (
        <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)] animate-pulse opacity-50">
            {[...Array(5)].map((_, i) => (
                <tr key={i}>
                <td className="pl-3 pr-3 sm:pl-6 py-4">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--muted)]" />
                    <div className="h-4 bg-[var(--muted)] rounded w-24" />
                    </div>
                </td>
                <td className="px-3 py-4">
                    <div className="h-4 bg-[var(--muted)] rounded w-32" />
                </td>
                <td className="px-3 py-4">
                    <div className="h-4 bg-[var(--muted)] rounded w-16" />
                </td>
                <td className="pl-3 pr-4 sm:pr-6 py-4 text-right">
                    <div className="h-6 bg-[var(--muted)] rounded w-14 ml-auto" />
                </td>
                </tr>
            ))}
        </tbody>
    )}