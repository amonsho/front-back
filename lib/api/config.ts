const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname
    // If we're on a local network IP or localhost, use that same host for the API
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.")) {
      return `http://${hostname}:8000`
    }
  }
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  return "http://localhost:8000"
}

export const API_URL = getBaseUrl()

/**
 * Safely joins the API_URL with an image path.
 * Handles leading/trailing slashes and returns a default placeholder if path is missing.
 */
export function getImageUrl(path?: string | null, placeholder = "/placeholder-hotel.jpg"): string {
  if (!path) return placeholder
  
  // If it's already a full URL, return it
  if (path.startsWith("http")) return path
  
  // Ensure we don't have double slashes in base
  const cleanBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL
  
  // Clean the path: remove leading / and redundant media/ prefix (we will add it back consistently)
  let cleanPath = path.startsWith("/") ? path.slice(1) : path
  if (cleanPath.startsWith("media/")) {
    cleanPath = cleanPath.slice(6)
  }
  
  // Final URL construction
  return `${cleanBase}/media/${encodeURI(decodeURIComponent(cleanPath))}`
}
