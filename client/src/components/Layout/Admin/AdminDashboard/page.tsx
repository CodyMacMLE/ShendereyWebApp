'use client'

import { useEffect, useState } from 'react'

type S3BucketData = {
    bucket: string
    storageType: string
    bytes: number
    mb?: number
    gb: number
    timestamp: string
    error?: string
}

type Tryout = {
    id: number
    readStatus: boolean
}

type Program = {
    id: number
    name: string
    category: string
}

type ProgramWithClassCount = {
    id: number
    name: string
    classCount: number
}

// Calculate estimated monthly storage costs
const estimateMonthlyCosts = (s3Data: S3BucketData): number => {
    // AWS S3 Standard Storage pricing: $0.023 per GB per month (as of 2024)
    // Using a slightly higher rate to account for potential variations
    const storageCostPerGB = 0.025 // $0.025 per GB per month
    const lightsailCost = 3.50 // $3.50 per month
    const s3RequestCost = 1.00 // $1.00 per month
    const s3DataTransferCost = 8.00 // $8.00 per month

    const USDtoCAD = 1.37;

    const totalCost = ((s3Data.bytes / (1024 ** 3)) * storageCostPerGB + lightsailCost + s3RequestCost + s3DataTransferCost) * USDtoCAD
    
    // Round up to the nearest 2 decimal places
    return Math.ceil(totalCost * 100) / 100
}

export default function AdminDashboard() {
    const [s3Data, setS3Data] = useState<S3BucketData | null>(null)
    const [s3Loading, setS3Loading] = useState(true)
    const [s3Error, setS3Error] = useState<string | null>(null)
    const [unreadTryouts, setUnreadTryouts] = useState<number>(0)
    const [tryoutsLoading, setTryoutsLoading] = useState(true)
    const [estimatedCosts, setEstimatedCosts] = useState<number>(0)
    const [costsLoading, setCostsLoading] = useState(true)
    const [recreationalPrograms, setRecreationalPrograms] = useState<ProgramWithClassCount[]>([])
    const [programsLoading, setProgramsLoading] = useState(true)
    const [scheduleTitle, setScheduleTitle] = useState<string | null>(null)
    const [scheduleLoading, setScheduleLoading] = useState(true)

    useEffect(() => {
        fetchS3Data()
        fetchUnreadTryouts()
        fetchRecreationalPrograms()
        fetchScheduleTitle()
    }, [])

    const fetchS3Data = async () => {
        try {
            setS3Loading(true)
            setS3Error(null)
            const res = await fetch('/api/analytics/s3-bucket')
            if (!res.ok) {
                let errorMessage = 'Failed to fetch S3 data'
                try {
                    const errorData = await res.json()
                    errorMessage = errorData.error || errorData.message || errorMessage
                    // Log the full error for debugging
                    console.error('S3 API error response:', errorData)
                } catch (_parseError) {
                    errorMessage = res.statusText || errorMessage
                }
                setS3Error(errorMessage)
                console.error('S3 data fetch failed:', errorMessage, 'Status:', res.status)
                return
            }
            const data = await res.json()
            console.log('S3 data received:', data) // Debug log
            if (data.error) {
                setS3Error(data.error)
                // Still set costs to 0 if there's an error
                setEstimatedCosts(0)
                setCostsLoading(false)
            } else {
                setS3Data(data)
                const costs = estimateMonthlyCosts(data)
                setEstimatedCosts(costs)
                setCostsLoading(false)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load S3 data'
            setS3Error(errorMessage)
            console.error('Error fetching S3 data:', error)
            // Set costs to 0 on error and stop loading
            setEstimatedCosts(0)
            setCostsLoading(false)
        } finally {
            setS3Loading(false)
        }
    }

    const fetchUnreadTryouts = async () => {
        try {
            setTryoutsLoading(true)
            const res = await fetch('/api/tryouts')
            if (!res.ok) {
                throw new Error('Failed to fetch tryouts')
            }
            const data = await res.json()
            const unreadCount = data.body.filter((tryout: Tryout) => !tryout.readStatus).length
            setUnreadTryouts(unreadCount)
        } catch (error) {
            console.error(error)
        } finally {
            setTryoutsLoading(false)
        }
    }

    const fetchRecreationalPrograms = async () => {
        try {
            setProgramsLoading(true)
            const res = await fetch('/api/programs')
            if (!res.ok) {
                throw new Error('Failed to fetch programs')
            }
            const data = await res.json()
            const recreationalProgramsList = data.body.filter((program: Program) => program.category === 'recreational')
            
            // Fetch class counts for each program
            const programsWithCounts = await Promise.all(
                recreationalProgramsList.map(async (program: Program) => {
                    try {
                        const groupsRes = await fetch(`/api/groups/${program.id}`)
                        if (groupsRes.ok) {
                            const groupsData = await groupsRes.json()
                            return {
                                id: program.id,
                                name: program.name,
                                classCount: groupsData.body?.length || 0
                            }
                        }
                        return {
                            id: program.id,
                            name: program.name,
                            classCount: 0
                        }
                    } catch (_error) {
                        return {
                            id: program.id,
                            name: program.name,
                            classCount: 0
                        }
                    }
                })
            )
            setRecreationalPrograms(programsWithCounts)
        } catch (error) {
            console.error(error)
        } finally {
            setProgramsLoading(false)
        }
    }

    const fetchScheduleTitle = async () => {
        try {
            setScheduleLoading(true)
            const res = await fetch('/api/register/session-image')
            if (!res.ok) {
                throw new Error('Failed to fetch schedule title')
            }
            const data = await res.json()
            if (data.success && data.body) {
                setScheduleTitle(data.body.title)
            } else {
                setScheduleTitle(null)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setScheduleLoading(false)
        }
    }

    // Calculate progress bar percentages
    const maxSizeGB = 400
    const recommendationGB = 250
    const currentSizeGB = s3Data?.gb || 0
    const currentPercent = (currentSizeGB / maxSizeGB) * 100
    const recommendationPercent = (recommendationGB / maxSizeGB) * 100

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-[var(--foreground)]">Dashboard</h1>
                </div>
            </div>

            {/* Content */}
            <div className="mt-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* S3 Bucket Size Card */}
                    <div className="col-span-1 bg-[var(--card-bg)] rounded-lg p-6 shadow-md">
                        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Media Storage</h2>
                        {s3Loading ? (
                            <p className="text-sm text-[var(--muted)]">Loading...</p>
                        ) : s3Error || !s3Data ? (
                            <div className="space-y-2">
                                <p className="text-sm text-red-600 dark:text-red-400">Error loading data</p>
                                {s3Error && (
                                    <p className="text-xs text-[var(--muted)]">{s3Error}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                                            {s3Data.gb >= 1 
                                                ? `${s3Data.gb.toFixed(2)} GB`
                                                : s3Data.mb !== undefined
                                                ? `${s3Data.mb.toFixed(2)} MB`
                                                : `${(s3Data.bytes / 1024 ** 2).toFixed(2)} MB`
                                            }
                                        </span>
                                        <span className="text-sm text-[var(--muted)]">/ {maxSizeGB} GB</span>
                                    </div>
                                </div>
                                
                                {/* Progress Bar Container */}
                                <div className="relative">
                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="text-xs text-[var(--muted)]">Recommended max: {recommendationGB} GB</span>
                                    </div>
                                    <div className="relative w-full h-6 bg-[var(--progress-bg)] rounded-full overflow-hidden">
                                        {/* Current usage bar */}
                                        <div
                                            className="h-full transition-all duration-300 bg-[var(--primary)]"
                                            style={{ width: `${Math.min(currentPercent, 100)}%` }}
                                        />
                                        
                                        {/* Recommendation line */}
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-[var(--progress-line)] z-10"
                                            style={{ left: `${recommendationPercent}%` }}
                                        />
                                    </div>
                                </div>
                                
                                <p className="text-xs text-[var(--muted)]">
                                    Last updated: {new Date(s3Data.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Estimated Costs Card */}
                    <div className="col-span-1 bg-[var(--card-bg)] rounded-lg p-6 shadow-md">
                        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Estimated Monthly Costs</h2>
                        {costsLoading ? (
                            <p className="text-sm text-[var(--muted)]">Loading...</p>
                        ) : (
                            <div className="flex items-baseline gap-x-2">
                                <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                                    {estimatedCosts.toLocaleString('en-US', { 
                                        style: 'currency', 
                                        currency: 'CAD',
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Unread Tryouts Card */}
                    <div className="col-span-1 bg-[var(--card-bg)] rounded-lg p-6 shadow-md">
                        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Unread Tryouts</h2>
                        {tryoutsLoading ? (
                            <p className="text-sm text-[var(--muted)]">Loading...</p>
                        ) : (
                            <div className="flex items-baseline gap-x-2">
                                <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                                    {unreadTryouts}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Second Row - Recreational Programs Card (full width or larger) */}
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recreational Programs Card */}
                    <div className="col-span-1 bg-[var(--card-bg)] rounded-lg p-6 shadow-md">
                        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recreational Programs & Classes</h2>
                        {programsLoading ? (
                            <p className="text-sm text-[var(--muted)]">Loading...</p>
                        ) : recreationalPrograms.length === 0 ? (
                            <p className="text-sm text-[var(--muted)]">No recreational programs found</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="mb-4">
                                    <p className="text-sm text-[var(--muted)]">Total Programs: <span className="font-semibold text-[var(--foreground)]">{recreationalPrograms.length}</span></p>
                                    <p className="text-sm text-[var(--muted)]">Total Classes: <span className="font-semibold text-[var(--foreground)]">{recreationalPrograms.reduce((sum, prog) => sum + prog.classCount, 0)}</span></p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-[var(--border)]">
                                        <thead>
                                            <tr>
                                                <th className="py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Program</th>
                                                <th className="py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Classes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {recreationalPrograms.map((program) => (
                                                <tr key={program.id}>
                                                    <td className="py-3 text-sm text-[var(--foreground)]">{program.name}</td>
                                                    <td className="py-3 text-sm text-[var(--foreground)] text-right">{program.classCount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Current Schedule Title Card */}
                    <div className="col-span-1 bg-[var(--card-bg)] rounded-lg p-6 shadow-md">
                        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Current Recreational Schedule</h2>
                        {scheduleLoading ? (
                            <p className="text-sm text-[var(--muted)]">Loading...</p>
                        ) : scheduleTitle ? (
                            <div className="space-y-2">
                                <p className="text-xl font-semibold text-[var(--foreground)]">{scheduleTitle}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--muted)]">No schedule title set</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}