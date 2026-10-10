import { API_BASE_URL } from './apiConfig'

export const FALLBACK_VEHICLE_IMAGE = 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&h=400&fit=crop'

function resolveImage(source) {
  if (!source || typeof source !== 'string' || !source.trim()) return null
  let url
  try {
    url = new URL(source.trim(), `${new URL(API_BASE_URL).origin}/`)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null
  // Uploaded files belong to the API server. A proxy may serialize their
  // absolute URLs with its internal hostname or HTTP scheme.
  if (url.pathname.startsWith('/media/')) {
    const apiOrigin = new URL(API_BASE_URL).origin
    return `${apiOrigin}${url.pathname}${url.search}${url.hash}`
  }
  return url.href
}

export function vehicleImageSources(vehicle) {
  const sources = vehicle.imageSources || [vehicle.vehicle_image, vehicle.photo_url, vehicle.image]
  return [...new Set([...sources.map(resolveImage).filter(Boolean), FALLBACK_VEHICLE_IMAGE])]
}

export function vehicleImageUrl(vehicle) {
  return vehicleImageSources(vehicle)[0]
}

export function handleVehicleImageError(event, vehicle) {
  const image = event.currentTarget
  const sources = vehicleImageSources(vehicle)
  const next = sources[sources.indexOf(image.src) + 1]
  if (next && next !== image.src) image.src = next
}
