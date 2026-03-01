'use client'

import { APIProvider } from '@vis.gl/react-google-maps'

export function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        Google Maps API key not configured
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      {children}
    </APIProvider>
  )
}
