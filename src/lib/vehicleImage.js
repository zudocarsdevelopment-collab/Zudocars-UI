import { API_BASE_URL } from './apiConfig'

export const FALLBACK_VEHICLE_IMAGE = 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&h=400&fit=crop'

export function vehicleImageUrl(vehicle) {
  const source = vehicle.vehicle_image || vehicle.photo_url || vehicle.image
  if (!source || typeof source !== 'string') return FALLBACK_VEHICLE_IMAGE

  const url = new URL(source, `${new URL(API_BASE_URL).origin}/`)
  // Uploaded files belong to the API server. A proxy may serialize their
  // absolute URLs with its internal hostname or HTTP scheme.
  if (url.pathname.startsWith('/media/')) {
    const apiOrigin = new URL(API_BASE_URL).origin
    return `${apiOrigin}${url.pathname}${url.search}${url.hash}`
  }
  return url.href
}
