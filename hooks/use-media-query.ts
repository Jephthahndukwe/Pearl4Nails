"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Create a media query list
    const mediaQuery = window.matchMedia(query)

    // Set the initial value
    setMatches(mediaQuery.matches)

    // Define a callback function to handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add the callback as a listener for changes to the media query
    mediaQuery.addEventListener("change", handleChange)

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

