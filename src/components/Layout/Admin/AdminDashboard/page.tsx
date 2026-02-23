'use client'

import Link from 'next/link'
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

type Coach = {
    id: number
    name: string
    isSeniorStaff: boolean | null
}

type User = {
    id: number
    isActive: boolean | null
    isAthlete: boolean | null
}

type RegistrationImage = {
    id: number
    imageUrl: string | null
    title: string | null
    slot: string | null
}

export default function AdminDashboard() {

    // ── S3 ──
    const [s3Data, setS3Data] = useState<S3BucketData | null>(null)
    const [s3Loading, setS3Loading] = useState(true)
    const [s3Error, setS3Error] = useState<string | null>(null)

    // ── Tryouts ──
    const [unreadTryouts, setUnreadTryouts] = useState(0)
    const [tryoutsLoading, setTryoutsLoading] = useState(true)

    // ── Gallery ──
    const [galleryTotal, setGalleryTotal] = useState(0)
    const [galleryLoading, setGalleryLoading] = useState(true)

    // ── Team ──
    const [coachCount, setCoachCount] = useState(0)
    const [seniorStaffCount, setSeniorStaffCount] = useState(0)
    const [athleteCount, setAthleteCount] = useState(0)
    const [teamLoading, setTeamLoading] = useState(true)

    // ── Programs ──
    const [recreationalPrograms, setRecreationalPrograms] = useState<ProgramWithClassCount[]>([])
    const [programsLoading, setProgramsLoading] = useState(true)

    // ── Registration ──
    const [sessionImages, setSessionImages] = useState<RegistrationImage[]>([])
    const [campImages, setCampImages] = useState<RegistrationImage[]>([])
    const [registrationLoading, setRegistrationLoading] = useState(true)

    useEffect(() => {
        fetchS3Data()
        fetchUnreadTryouts()
        fetchGalleryStats()
        fetchTeamStats()
        fetchRecreationalPrograms()
        fetchRegistrationImages()
    }, [])

    const fetchS3Data = async () => {
        try {
            setS3Loading(true)
            setS3Error(null)
            const res = await fetch('/api/analytics/s3-bucket')
            if (!res.ok) {
                let msg = 'Failed to fetch S3 data'
                try { msg = (await res.json()).error || msg } catch { msg = res.statusText || msg }
                setS3Error(msg)
                return
            }
            const data = await res.json()
            if (data.error) setS3Error(data.error)
            else setS3Data(data)
        } catch (error) {
            setS3Error(error instanceof Error ? error.message : 'Failed to load S3 data')
        } finally {
            setS3Loading(false)
        }
    }

    const fetchUnreadTryouts = async () => {
        try {
            const res = await fetch('/api/tryouts')
            if (!res.ok) throw new Error('Failed to fetch tryouts')
            const data = await res.json()
            setUnreadTryouts(data.body.filter((t: Tryout) => !t.readStatus).length)
        } catch (error) {
            console.error(error)
        } finally {
            setTryoutsLoading(false)
        }
    }

    const fetchGalleryStats = async () => {
        try {
            const res = await fetch('/api/gallery?page=1&limit=1')
            if (!res.ok) throw new Error('Failed to fetch gallery')
            const data = await res.json()
            setGalleryTotal(data.pagination?.totalCount || 0)
        } catch (error) {
            console.error(error)
        } finally {
            setGalleryLoading(false)
        }
    }

    const fetchTeamStats = async () => {
        try {
            const [coachRes, usersRes] = await Promise.all([
                fetch('/api/coach'),
                fetch('/api/users'),
            ])
            if (coachRes.ok) {
                const coachData = await coachRes.json()
                const list: Coach[] = coachData.body || []
                setCoachCount(list.length)
                setSeniorStaffCount(list.filter(c => c.isSeniorStaff).length)
            }
            if (usersRes.ok) {
                const usersData = await usersRes.json()
                const list: User[] = usersData.data || []
                setAthleteCount(list.filter(u => u.isAthlete && u.isActive).length)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setTeamLoading(false)
        }
    }

    const fetchRecreationalPrograms = async () => {
        try {
            const res = await fetch('/api/programs')
            if (!res.ok) throw new Error('Failed to fetch programs')
            const data = await res.json()
            const recPrograms = data.body.filter((p: Program) => p.category === 'recreational')
            const withCounts = await Promise.all(
                recPrograms.map(async (program: Program) => {
                    try {
                        const groupsRes = await fetch(`/api/groups/${program.id}`)
                        const groupsData = groupsRes.ok ? await groupsRes.json() : { body: [] }
                        return { id: program.id, name: program.name, classCount: groupsData.body?.length || 0 }
                    } catch {
                        return { id: program.id, name: program.name, classCount: 0 }
                    }
                })
            )
            setRecreationalPrograms(withCounts)
        } catch (error) {
            console.error(error)
        } finally {
            setProgramsLoading(false)
        }
    }

    const fetchRegistrationImages = async () => {
        try {
            const res = await fetch('/api/register/session-image')
            if (!res.ok) throw new Error('Failed to fetch registration images')
            const data = await res.json()
            if (data.success && data.body) {
                const sessions: RegistrationImage[] = []
                const camps: RegistrationImage[] = []
                for (const img of data.body as RegistrationImage[]) {
                    if (!img.imageUrl) continue
                    if (img.slot === 'session' || img.slot === 'current' || img.slot === 'next') sessions.push(img)
                    else if (img.slot === 'camp') camps.push(img)
                }
                setSessionImages(sessions.sort((a, b) => a.id - b.id))
                setCampImages(camps.sort((a, b) => a.id - b.id))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setRegistrationLoading(false)
        }
    }

    const maxSizeGB = 400
    const recommendationGB = 250
    const currentSizeGB = s3Data?.gb || 0
    const currentPercent = (currentSizeGB / maxSizeGB) * 100
    const recommendationPercent = (recommendationGB / maxSizeGB) * 100

    return (
        <div className="px-4 sm:px-6 lg:px-8">

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-[var(--foreground)]">Dashboard</h1>
                </div>
            </div>

            <div className="mt-8 space-y-6">

                {/* ══════════ Row 1 ══════════ */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Media Storage */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-md">
                        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Media Storage</h2>
                        {s3Loading ? (
                            <p className="text-sm text-[var(--muted)]">Loading...</p>
                        ) : s3Error || !s3Data ? (
                            <div className="space-y-1">
                                <p className="text-sm text-red-600 dark:text-red-400">Error loading data</p>
                                {s3Error && <p className="text-xs text-[var(--muted)]">{s3Error}</p>}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                                        {s3Data.gb >= 1
                                            ? `${s3Data.gb.toFixed(2)} GB`
                                            : s3Data.mb !== undefined
                                            ? `${s3Data.mb.toFixed(2)} MB`
                                            : `${(s3Data.bytes / 1024 ** 2).toFixed(2)} MB`}
                                    </span>
                                    <span className="text-sm text-[var(--muted)]">/ {maxSizeGB} GB</span>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-[var(--muted)]">Recommended max: {recommendationGB} GB</p>
                                    <div className="relative w-full h-5 bg-[var(--progress-bg)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-300 bg-[var(--primary)]"
                                            style={{ width: `${Math.min(currentPercent, 100)}%` }}
                                        />
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

                    {/* Unread Tryouts */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-md flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Unread Tryouts</h2>
                            {tryoutsLoading ? (
                                <p className="text-sm text-[var(--muted)]">Loading...</p>
                            ) : (
                                <>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-semibold tracking-tight ${unreadTryouts > 0 ? 'text-amber-500' : 'text-[var(--foreground)]'}`}>
                                            {unreadTryouts}
                                        </span>
                                        {unreadTryouts > 0 && (
                                            <span className="text-xs font-medium text-amber-500">pending</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--muted)] mt-2">
                                        {unreadTryouts === 0
                                            ? 'All submissions reviewed'
                                            : `${unreadTryouts} submission${unreadTryouts !== 1 ? 's' : ''} awaiting review`}
                                    </p>
                                </>
                            )}
                        </div>
                        <Link href="/admin/tryouts" className="mt-4 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
                            View tryouts →
                        </Link>
                    </div>

                    {/* Gallery */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-md flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Gallery</h2>
                            {galleryLoading ? (
                                <p className="text-sm text-[var(--muted)]">Loading...</p>
                            ) : (
                                <>
                                    <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                                        {galleryTotal.toLocaleString()}
                                    </span>
                                    <p className="text-xs text-[var(--muted)] mt-2">
                                        {galleryTotal === 1 ? '1 media item' : `${galleryTotal.toLocaleString()} media items`} in the gallery
                                    </p>
                                </>
                            )}
                        </div>
                        <Link href="/admin/gallery" className="mt-4 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
                            Manage gallery →
                        </Link>
                    </div>
                </div>

                {/* ══════════ Row 2 ══════════ */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Team Overview */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-md flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Team</h2>
                            {teamLoading ? (
                                <p className="text-sm text-[var(--muted)]">Loading...</p>
                            ) : (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[var(--muted)]">Total Staff</span>
                                        <span className="text-sm font-semibold text-[var(--foreground)]">{coachCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[var(--muted)]">Senior Staff</span>
                                        <span className="text-sm font-semibold text-[var(--foreground)]">{seniorStaffCount}</span>
                                    </div>
                                    <div className="h-px bg-[var(--border)]" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[var(--muted)]">Active Athletes</span>
                                        <span className="text-sm font-semibold text-[var(--foreground)]">{athleteCount}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href="/admin/users" className="mt-4 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
                            Manage team →
                        </Link>
                    </div>

                    {/* Recreational Programs */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-md flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Recreational Programs</h2>
                            {programsLoading ? (
                                <p className="text-sm text-[var(--muted)]">Loading...</p>
                            ) : recreationalPrograms.length === 0 ? (
                                <p className="text-sm text-[var(--muted)]">No programs found</p>
                            ) : (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[var(--muted)]">Programs</span>
                                        <span className="text-sm font-semibold text-[var(--foreground)]">{recreationalPrograms.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[var(--muted)]">Total Classes</span>
                                        <span className="text-sm font-semibold text-[var(--foreground)]">
                                            {recreationalPrograms.reduce((sum, p) => sum + p.classCount, 0)}
                                        </span>
                                    </div>
                                    <div className="h-px bg-[var(--border)]" />
                                    <div className="space-y-1">
                                        {recreationalPrograms.map(program => (
                                            <div key={program.id} className="flex items-center justify-between">
                                                <span className="text-xs text-[var(--foreground)] truncate max-w-[65%]">{program.name}</span>
                                                <span className="text-xs text-[var(--muted)]">
                                                    {program.classCount} class{program.classCount !== 1 ? 'es' : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href="/admin/programs" className="mt-4 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
                            Manage programs →
                        </Link>
                    </div>

                    {/* Registration Schedules */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-md flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Registration Schedules</h2>
                            {registrationLoading ? (
                                <p className="text-sm text-[var(--muted)]">Loading...</p>
                            ) : (
                                <div className="space-y-3">
                                    {/* Sessions */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Rec Sessions</span>
                                            <span className="text-xs font-semibold text-[var(--foreground)]">{sessionImages.length}</span>
                                        </div>
                                        {sessionImages.length > 0 ? (
                                            <ul className="space-y-1">
                                                {sessionImages.map(img => (
                                                    <li key={img.id} className="text-xs text-[var(--foreground)] truncate pl-2 border-l-2 border-[var(--primary)]">
                                                        {img.title || 'Untitled'}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-[var(--muted)] pl-2">No sessions uploaded</p>
                                        )}
                                    </div>
                                    <div className="h-px bg-[var(--border)]" />
                                    {/* Camps */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Camps</span>
                                            <span className="text-xs font-semibold text-[var(--foreground)]">{campImages.length}</span>
                                        </div>
                                        {campImages.length > 0 ? (
                                            <ul className="space-y-1">
                                                {campImages.map(img => (
                                                    <li key={img.id} className="text-xs text-[var(--foreground)] truncate pl-2 border-l-2 border-[var(--primary)]">
                                                        {img.title || 'Untitled'}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-[var(--muted)] pl-2">No camps uploaded</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href="/admin/registration" className="mt-4 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
                            Manage registration →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
