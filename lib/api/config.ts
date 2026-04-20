const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname
    if (hostname === "127.0.0.1" || hostname === "localhost") {
      return `http://${hostname}:8000`
    }
  }
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
