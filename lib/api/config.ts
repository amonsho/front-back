export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Safely joins the API_URL with an image path.
 * Handles leading/trailing slashes and returns a default placeholder if path is missing.
 */
export function getImageUrl(path?: string | null, placeholder = "/placeholder-hotel.jpg"): string {
  if (!path) return placeholder
  
  // If it's already a full URL, return it
  if (path.startsWith("http")) return path
  
  // Ensure we don't have double slashes
  const cleanBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL
  
  // Backend stores paths inconsistently (sometimes with 'media/', sometimes without)
  // Strip any leading '/' or 'media/' to normalize the path and avoid duplication
  const relativePath = path.replace(/^\/?(media\/)?/, "")
  
  // Prepend /media/ and handle spaces/special chars in filenames
  // We use decodeURIComponent first in case it's already encoded, then encodeURI
  const safePath = encodeURI(decodeURIComponent(relativePath))
  
  return `${cleanBase}/media/${safePath}`
}
