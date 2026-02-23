'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type S3BucketData = {
    bucket: string
    storageType: string
    bytes: number
    mb?: number
    gb: number
    timestamp: string
    error?: string
}

type StorageCategoryTally = { bytes: number; count: number }

type StorageBreakdown = {
    totalBytes: number
    totalCount: number
    breakdown: {
        gallery:   StorageCategoryTally
        team:      StorageCategoryTally
        content:   StorageCategoryTally
        resources: StorageCategoryTally
    }
}

type Tryout = { id: number; readStatus: boolean }
type Program = { id: number; name: string; category: string }
type ProgramWithClassCount = { id: number; name: string; classCount: number }
type Coach = { id: number; name: string; isSeniorStaff: boolean | null }
type User = { id: number; isActive: boolean | null; isAthlete: boolean | null }
type RegistrationImage = { id: number; imageUrl: string | null; title: string | null; slot: string | null }

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_GB = 200
const MAX_BYTES = MAX_GB * 1024 ** 3

// Threshold percentages of MAX_GB
const WARN_PCT  = 70   // 140 GB → yellow
const ALERT_PCT = 85   // 170 GB → orange
const CRIT_PCT  = 95   // 190 GB → red

const CATEGORY_META = [
    { key: 'gallery',   label: 'Gallery',    color: 'bg-indigo-500',  hex: '#6366f1' },
    { key: 'team',      label: 'Team',       color: 'bg-emerald-500', hex: '#10b981' },
    { key: 'content',   label: 'Content',    color: 'bg-amber-400',   hex: '#fbbf24' },
    { key: 'resources', label: 'Resources',  color: 'bg-slate-400',   hex: '#94a3b8' },
] as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBytes(bytes: number): string {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(0)} KB`
}

function storageStatus(pct: number): { label: string; classes: string } {
    if (pct >= 100)       return { label: 'Over Limit', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    if (pct >= CRIT_PCT)  return { label: 'Critical',   classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    if (pct >= ALERT_PCT) return { label: 'Warning',    classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }
    if (pct >= WARN_PCT)  return { label: 'Moderate',   classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
    return                       { label: 'Healthy',    classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {

    // S3 totals (CloudWatch — daily snapshot)
    const [s3Data, setS3Data]     = useState<S3BucketData | null>(null)
    const [s3Loading, setS3Loading] = useState(true)
    const [s3Error, setS3Error]   = useState<string | null>(null)

    // S3 breakdown (ListObjectsV2 — real-time, ~1h cache)
    const [breakdown, setBreakdown]           = useState<StorageBreakdown | null>(null)
    const [breakdownLoading, setBreakdownLoading] = useState(true)

    // Other stats
    const [unreadTryouts, setUnreadTryouts]   = useState(0)
    const [tryoutsLoading, setTryoutsLoading] = useState(true)

    const [galleryTotal, setGalleryTotal]     = useState(0)
    const [galleryLoading, setGalleryLoading] = useState(true)

    const [coachCount, setCoachCount]         = useState(0)
    const [seniorStaffCount, setSeniorStaffCount] = useState(0)
    const [athleteCount, setAthleteCount]     = useState(0)
    const [teamLoading, setTeamLoading]       = useState(true)

    const [recreationalPrograms, setRecreationalPrograms] = useState<ProgramWithClassCount[]>([])
    const [programsLoading, setProgramsLoading] = useState(true)

    const [sessionImages, setSessionImages]   = useState<RegistrationImage[]>([])
    const [campImages, setCampImages]         = useState<RegistrationImage[]>([])
    const [registrationLoading, setRegistrationLoading] = useState(true)

    useEffect(() => {
        fetchS3Data()
        fetchS3Breakdown()
        fetchUnreadTryouts()
        fetchGalleryStats()
        fetchTeamStats()
        fetchRecreationalPrograms()
        fetchRegistrationImages()
    }, [])

    // ── Fetchers ──────────────────────────────────────────────────────────────

    const fetchS3Data = async () => {
        try {
            setS3Loading(true); setS3Error(null)
            const res = await fetch('/api/analytics/s3-bucket')
            if (!res.ok) {
                let msg = 'Failed to fetch S3 data'
                try { msg = (await res.json()).error || msg } catch { msg = res.statusText || msg }
                setS3Error(msg); return
            }
            const data = await res.json()
            if (data.error) setS3Error(data.error)
            else setS3Data(data)
        } catch (err) {
            setS3Error(err instanceof Error ? err.message : 'Failed to load S3 data')
        } finally {
            setS3Loading(false)
        }
    }

    const fetchS3Breakdown = async () => {
        try {
            const res = await fetch('/api/analytics/s3-breakdown')
            if (res.ok) setBreakdown(await res.json())
        } catch (err) {
            console.error('Breakdown fetch failed:', err)
        } finally {
            setBreakdownLoading(false)
        }
    }

    const fetchUnreadTryouts = async () => {
        try {
            const res = await fetch('/api/tryouts')
            if (!res.ok) throw new Error()
            const data = await res.json()
            setUnreadTryouts(data.body.filter((t: Tryout) => !t.readStatus).length)
        } catch { /* silent */ } finally { setTryoutsLoading(false) }
    }

    const fetchGalleryStats = async () => {
        try {
            const res = await fetch('/api/gallery?page=1&limit=1')
            if (!res.ok) throw new Error()
            const data = await res.json()
            setGalleryTotal(data.pagination?.totalCount || 0)
        } catch { /* silent */ } finally { setGalleryLoading(false) }
    }

    const fetchTeamStats = async () => {
        try {
            const [coachRes, usersRes] = await Promise.all([fetch('/api/coach'), fetch('/api/users')])
            if (coachRes.ok) {
                const list: Coach[] = (await coachRes.json()).body || []
                setCoachCount(list.length)
                setSeniorStaffCount(list.filter(c => c.isSeniorStaff).length)
            }
            if (usersRes.ok) {
                const list: User[] = (await usersRes.json()).data || []
                setAthleteCount(list.filter(u => u.isAthlete && u.isActive).length)
            }
        } catch { /* silent */ } finally { setTeamLoading(false) }
    }

    const fetchRecreationalPrograms = async () => {
        try {
            const res = await fetch('/api/programs')
            if (!res.ok) throw new Error()
            const recPrograms: Program[] = (await res.json()).body.filter((p: Program) => p.category === 'recreational')
            const withCounts = await Promise.all(
                recPrograms.map(async p => {
                    try {
                        const gr = await fetch(`/api/groups/${p.id}`)
                        return { id: p.id, name: p.name, classCount: gr.ok ? ((await gr.json()).body?.length || 0) : 0 }
                    } catch { return { id: p.id, name: p.name, classCount: 0 } }
                })
            )
            setRecreationalPrograms(withCounts)
        } catch { /* silent */ } finally { setProgramsLoading(false) }
    }

    const fetchRegistrationImages = async () => {
        try {
            const res = await fetch('/api/register/session-image')
            if (!res.ok) throw new Error()
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
        } catch { /* silent */ } finally { setRegistrationLoading(false) }
    }

    // ── Storage card derived values ───────────────────────────────────────────

    // Use CloudWatch total if available, fall back to breakdown total
    const totalBytes     = s3Data?.bytes ?? breakdown?.totalBytes ?? 0
    const totalGB        = totalBytes / 1024 ** 3
    const totalPct       = Math.min((totalBytes / MAX_BYTES) * 100, 100)
    const status         = storageStatus(totalPct)
    const isOverLimit    = totalBytes >= MAX_BYTES

    // Segment widths as % of MAX_BYTES (clamped to 100% total)
    const segments = breakdown
        ? CATEGORY_META.map(cat => ({
              ...cat,
              bytes: breakdown.breakdown[cat.key].bytes,
              pct: Math.min((breakdown.breakdown[cat.key].bytes / MAX_BYTES) * 100, 100),
          }))
        : null

    // ── Render ────────────────────────────────────────────────────────────────

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

                    {/* ── Media Storage ── */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-md">

                        {/* Header row */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-[var(--foreground)]">Media Storage</h2>
                            {!s3Loading && !s3Error && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.classes}`}>
                                    {status.label}
                                </span>
                            )}
                        </div>

                        {s3Loading && breakdownLoading ? (
                            <p className="text-sm text-[var(--muted)]">Loading...</p>
                        ) : s3Error && !breakdown ? (
                            <div className="space-y-1">
                                <p className="text-sm text-red-600 dark:text-red-400">Error loading data</p>
                                <p className="text-xs text-[var(--muted)]">{s3Error}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">

                                {/* Headline number */}
                                <div className="flex items-baseline justify-between">
                                    <span className={`text-3xl font-semibold tracking-tight ${isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-[var(--foreground)]'}`}>
                                        {fmtBytes(totalBytes)}
                                    </span>
                                    <span className="text-sm text-[var(--muted)]">/ {MAX_GB} GB</span>
                                </div>

                                {/* Over-limit banner */}
                                {isOverLimit && (
                                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
                                        <p className="text-xs font-medium text-red-700 dark:text-red-400">
                                            Storage limit reached. Delete unused files before uploading more.
                                        </p>
                                    </div>
                                )}

                                {/* Stacked progress bar */}
                                <div>
                                    {/* Threshold labels */}
                                    <div className="relative h-4 mb-0.5 text-[10px]">
                                        <span
                                            className="absolute text-yellow-500 -translate-x-1/2"
                                            style={{ left: `${WARN_PCT}%` }}
                                        >
                                            {Math.round(MAX_GB * WARN_PCT / 100)} GB
                                        </span>
                                        <span
                                            className="absolute text-red-500 -translate-x-1/2"
                                            style={{ left: `${ALERT_PCT}%` }}
                                        >
                                            {Math.round(MAX_GB * ALERT_PCT / 100)} GB
                                        </span>
                                    </div>

                                    {/* Bar */}
                                    <div className="relative w-full h-5 bg-[var(--progress-bg)] rounded-full overflow-hidden">
                                        {/* Colored segments */}
                                        {segments ? (
                                            <div className="flex h-full absolute inset-0">
                                                {segments.map(seg => (
                                                    <div
                                                        key={seg.key}
                                                        className={`h-full ${seg.color} transition-all duration-500`}
                                                        style={{ width: `${seg.pct}%` }}
                                                        title={`${seg.label}: ${fmtBytes(seg.bytes)}`}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            /* Fallback solid bar while breakdown loads */
                                            <div
                                                className="h-full bg-[var(--primary)] transition-all duration-300 absolute inset-y-0 left-0"
                                                style={{ width: `${totalPct}%` }}
                                            />
                                        )}

                                        {/* Threshold markers */}
                                        <div
                                            className="absolute top-0 bottom-0 w-px bg-yellow-400 z-10 opacity-80"
                                            style={{ left: `${WARN_PCT}%` }}
                                        />
                                        <div
                                            className="absolute top-0 bottom-0 w-px bg-red-500 z-10 opacity-80"
                                            style={{ left: `${ALERT_PCT}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Category legend */}
                                {segments && (
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                        {segments.map(seg => (
                                            <div key={seg.key} className="flex items-center gap-1.5 min-w-0">
                                                <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${seg.color}`} />
                                                <span className="text-xs text-[var(--muted)] truncate">{seg.label}</span>
                                                <span className="text-xs font-medium text-[var(--foreground)] ml-auto flex-shrink-0">
                                                    {fmtBytes(seg.bytes)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div className="space-y-0.5">
                                    {s3Data && (
                                        <p className="text-xs text-[var(--muted)]">
                                            CloudWatch snapshot: {new Date(s3Data.timestamp).toLocaleDateString()}
                                        </p>
                                    )}
                                    {breakdown && (
                                        <p className="text-xs text-[var(--muted)]">
                                            Breakdown: {breakdown.totalCount.toLocaleString()} files scanned
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Unread Tryouts ── */}
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

                    {/* ── Gallery ── */}
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

                    {/* ── Team ── */}
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

                    {/* ── Recreational Programs ── */}
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

                    {/* ── Registration Schedules ── */}
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 shadow-md flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Registration Schedules</h2>
                            {registrationLoading ? (
                                <p className="text-sm text-[var(--muted)]">Loading...</p>
                            ) : (
                                <div className="space-y-3">
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
