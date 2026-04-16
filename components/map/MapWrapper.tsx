"use client"

import dynamic from "next/dynamic"

interface MapWrapperProps {
  latitude?: number
  longitude?: number
  hotelName?: string
  hotels?: any[] // Using any here to avoid cyclic dependency/complex imports in common wrapper if needed, but Hotel[] is better
  locale?: string
}

const Map = dynamic(
  () => import("./HotelMap"),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded-lg flex items-center justify-center text-muted-foreground">Loading map...</div>
  }
)

export default function MapWrapper(props: MapWrapperProps) {
  return <Map {...props} />
}
