import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Escapes regex metacharacters so user-supplied search text is matched literally.
export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Strips common Markdown syntax for plain-text previews (card excerpts, etc).
export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/(\*\*|__|\*|_|`|~~)/g, '') // emphasis/inline code
    .replace(/^>\s?/gm, '') // blockquotes
    .replace(/^[-*+]\s+/gm, '') // list bullets
    .replace(/\n+/g, ' ')
    .trim()
}

// Estimates reading time in whole minutes from Markdown content (~200 wpm).
export function getReadingTime(markdown: string) {
  const words = stripMarkdown(markdown)
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
