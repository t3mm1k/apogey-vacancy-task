"use client"

import { useEffect } from "react"

export default function GlobalClientScripts() {

  useEffect(() => {
    let cancelled = false
    let osInstance: { destroy: () => void } | undefined

    void import("overlayscrollbars").then(({ OverlayScrollbars }) => {
      if (cancelled) return
      osInstance = OverlayScrollbars(document.getElementById('main-container')!, {
        scrollbars: {
          autoHide: "move",
        },
      })
    })

    return () => {
      cancelled = true
      osInstance?.destroy()
    }
  }, [])

  useEffect(() => {
    void document.fonts.ready.then(() => {
      document.body.classList.add("fonts-loaded")
    })
  }, [])

  return null
}
