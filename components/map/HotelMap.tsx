import Link from "next/link"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"
import type { Hotel } from "@/lib/types"
import { getImageUrl } from "@/lib/api/config"

interface HotelMapProps {
  latitude?: number
  longitude?: number
  hotelName?: string
  hotels?: Hotel[]
  locale?: string
}

// Component to handle map bounds when multiple markers are present
function ChangeView({ hotels }: { hotels: Hotel[] }) {
  const map = useMap()
  if (hotels.length > 0) {
    const points = hotels
      .filter(h => h.latitude && h.longitude)
      .map(h => [h.latitude!, h.longitude!] as L.LatLngExpression)
    
    if (points.length > 0) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }
  return null
}

export default function HotelMap({ latitude, longitude, hotelName, hotels, locale = "ru" }: HotelMapProps) {
  const isSingle = latitude && longitude
  const mapHotels = hotels || []
  
  // Center is either the single hotel or the first hotel in the list that has coordinates
  const defaultCenter = isSingle 
    ? [latitude, longitude] as L.LatLngExpression
    : (mapHotels.find(h => h.latitude && h.longitude) 
        ? [mapHotels.find(h => h.latitude && h.longitude)!.latitude!, mapHotels.find(h => h.latitude && h.longitude)!.longitude!] as L.LatLngExpression
        : [51.505, -0.09] as L.LatLngExpression) // Default to London if nothing found

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={isSingle ? 14 : 12} 
      scrollWheelZoom={false}
      style={{ height: "100%", minHeight: "400px", width: "100%", borderRadius: "0.5rem", zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {isSingle ? (
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="font-semibold text-sm">{hotelName}</div>
          </Popup>
        </Marker>
      ) : (
        <>
          <ChangeView hotels={mapHotels} />
          {mapHotels.map((hotel) => {
            if (!hotel.latitude || !hotel.longitude) return null
            return (
              <Marker key={hotel.id} position={[hotel.latitude, hotel.longitude]}>
                <Popup className="hotel-popup">
                  <div className="flex flex-col gap-2 p-1 min-w-[200px]">
                    {hotel.photo && (
                      <div className="relative h-24 w-full overflow-hidden rounded-md">
                        <img 
                          src={hotel.photo.startsWith('http') ? hotel.photo : getImageUrl(hotel.photo)} 
                          alt={hotel.name}
                          className="object-cover h-full w-full"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="font-bold text-sm leading-tight text-primary">{hotel.name}</div>
                      <div className="text-xs text-muted-foreground">{hotel.city}, {hotel.country}</div>
                      <Link 
                        href={`/${locale}/hotels/${hotel.id}`}
                        className="mt-2 block w-full rounded bg-primary py-1.5 text-center text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </>
      )}
    </MapContainer>
  )
}
