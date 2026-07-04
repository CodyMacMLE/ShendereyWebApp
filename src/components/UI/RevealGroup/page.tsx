'use client'

import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Wraps a section container and reveals its direct children (fade + rise) as
 * they scroll into view, staggered. Drop it in place of a plain container div.
 *
 * - Opt a child out with `data-reveal="off"` (e.g. an above-the-fold hero, to
 *   protect LCP). <script> children are skipped automatically.
 * - Honors prefers-reduced-motion: reduced-motion users see everything at rest,
 *   no hidden state — the animation branch simply never runs.
 * - SSR-safe: all GSAP runs client-side in useGSAP (layout effect), so there's
 *   no flash of hidden content and no server execution.
 */
export default function RevealGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils
          .toArray<HTMLElement>(':scope > *', root)
          .filter((el) => el.tagName !== 'SCRIPT' && el.dataset.reveal !== 'off')

        gsap.set(items, { opacity: 0, y: 28 })
        ScrollTrigger.batch(items, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              stagger: 0.12,
              overwrite: true,
            }),
        })
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
