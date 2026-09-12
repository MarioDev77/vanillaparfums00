'use client'
import { useEffect, useState } from 'react'

const LETTERS = 'VANILLA'.split('')

// Tempos da sequência (ms), calibrados pra ficar cinematográfico sem ser lento:
// letras da VANILLA entram em cascata -> pausa -> PARFUMS entra -> segura ~1s -> fade out
const LETTER_STEP = 130
const LETTER_DURATION = 550
const PAUSE_BEFORE_SUBTITLE = 250
const HOLD_AFTER_COMPLETE = 1000
const FADE_OUT_DURATION = 650

const vanillaDoneAt = LETTERS.length * LETTER_STEP + LETTER_DURATION
const subtitleDelay = vanillaDoneAt + PAUSE_BEFORE_SUBTITLE
const subtitleDoneAt = subtitleDelay + LETTER_DURATION
const fadeStartAt = subtitleDoneAt + HOLD_AFTER_COMPLETE
const unmountAt = fadeStartAt + FADE_OUT_DURATION

export default function IntroAnimation() {
  const [shouldRender, setShouldRender] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)

    setShouldRender(true)
    // Trava o scroll enquanto a abertura roda, pra não deixar o catálogo "vazar" atrás
    document.body.style.overflow = 'hidden'

    const fadeTimer = setTimeout(() => setFadingOut(true), fadeStartAt)
    const unmountTimer = setTimeout(() => {
      setShouldRender(false)
      document.body.style.overflow = ''
    }, unmountAt)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(unmountTimer)
      document.body.style.overflow = ''
    }
  }, [])

  if (!ready || !shouldRender) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary transition-opacity ease-out ${fadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      style={{ transitionDuration: `${FADE_OUT_DURATION}ms` }}
    >
      <div className="flex">
        {LETTERS.map((letter, index) => (
          <span
            key={index}
            className="intro-letter font-serif text-4xl text-primary-foreground sm:text-6xl md:text-7xl"
            style={{ animationDelay: `${index * LETTER_STEP}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>
      <p
        className="intro-letter mt-4 text-[11px] tracking-[0.6em] text-accent sm:text-sm"
        style={{ animationDelay: `${subtitleDelay}ms` }}
      >
        PARFUMS
      </p>
    </div>
  )
}
