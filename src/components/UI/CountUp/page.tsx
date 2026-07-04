'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Counts a numeric stat up from 0 when it scrolls into view.
 * Accepts strings like "40+", "127", "2,000+" — parses the number, keeps any
 * prefix/suffix, re-formats with locale commas. Non-numeric values render as-is.
 *
 * SSR / no-JS / reduced-motion all show the final value (rendered in markup);
 * the count-up only runs client-side when motion is allowed.
 */
export default function CountUp({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const match = value.match(/^(\D*)(\d[\d,]*)(.*)$/)
      if (!match) return // no number to animate — leave the static value

      const [, prefix, digits, suffix] = match
      const target = parseInt(digits.replace(/,/g, ''), 10)

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const proxy = { n: 0 }
        el.textContent = `${prefix}0${suffix}`
        gsap.to(proxy, {
          n: target,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(proxy.n).toLocaleString()}${suffix}`
          },
        })
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
