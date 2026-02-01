'use client'

import { useState, useEffect } from 'react'

type Announcement = {
    id: number;
    message: string;
    linkUrl: string | null;
    isActive: boolean | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export default function AnnouncementAdmin() {
    const [message, setMessage] = useState('')
    const [linkUrl, setLinkUrl] = useState('')
    const [isActive, setIsActive] = useState(false)
    const [hasExisting, setHasExisting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchAnnouncement()
    }, [])

    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [feedback])

    const fetchAnnouncement = async () => {
        try {
            const res = await fetch('/api/announcement')
            if (res.ok) {
                const data = await res.json()
                if (data.body) {
                    const a: Announcement = data.body
                    setMessage(a.message)
                    setLinkUrl(a.linkUrl || '')
                    setIsActive(a.isActive ?? false)
                    setHasExisting(true)
                }
            }
        } catch {
            setFeedback({ type: 'error', text: 'Failed to load announcement' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!message.trim()) {
            setFeedback({ type: 'error', text: 'Message is required' })
            return
        }
        try {
            const res = await fetch('/api/announcement', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, linkUrl, isActive }),
            })
            if (res.ok) {
                setHasExisting(true)
                setFeedback({ type: 'success', text: 'Announcement saved' })
            } else {
                setFeedback({ type: 'error', text: 'Failed to save announcement' })
            }
        } catch {
            setFeedback({ type: 'error', text: 'Failed to save announcement' })
        }
    }

    const handleToggle = async () => {
        const newActive = !isActive
        setIsActive(newActive)
        if (hasExisting) {
            try {
                const res = await fetch('/api/announcement', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, linkUrl, isActive: newActive }),
                })
                if (res.ok) {
                    setFeedback({ type: 'success', text: newActive ? 'Banner activated' : 'Banner deactivated' })
                } else {
                    setIsActive(!newActive)
                    setFeedback({ type: 'error', text: 'Failed to toggle' })
                }
            } catch {
                setIsActive(!newActive)
                setFeedback({ type: 'error', text: 'Failed to toggle' })
            }
        }
    }

    const handleDelete = async () => {
        try {
            const res = await fetch('/api/announcement', { method: 'DELETE' })
            if (res.ok) {
                setMessage('')
                setLinkUrl('')
                setIsActive(false)
                setHasExisting(false)
                setFeedback({ type: 'success', text: 'Announcement deleted' })
            } else {
                setFeedback({ type: 'error', text: 'Failed to delete announcement' })
            }
        } catch {
            setFeedback({ type: 'error', text: 'Failed to delete announcement' })
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Announcement Banner</h1>

            {feedback && (
                <div className={`mb-4 px-4 py-3 rounded-md text-sm font-medium ${
                    feedback.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {feedback.text}
                </div>
            )}

            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6 space-y-6">
                {/* Active Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Status</p>
                        <p className="text-xs text-gray-500">{isActive ? 'Banner is visible on the public site' : 'Banner is hidden'}</p>
                    </div>
                    <button
                        onClick={handleToggle}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </button>
                </div>

                <hr className="border-[var(--border)]" />

                {/* Message */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                        Message
                    </label>
                    <input
                        id="message"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter announcement message..."
                        className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                </div>

                {/* Link URL */}
                <div>
                    <label htmlFor="linkUrl" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                        Link URL <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                        id="linkUrl"
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <p className="mt-1 text-xs text-gray-500">If provided, the banner text will be clickable</p>
                </div>

                <hr className="border-[var(--border)]" />

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                    >
                        Save
                    </button>
                    {hasExisting && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
