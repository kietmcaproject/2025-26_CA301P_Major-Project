// Geolocation Service for Pulse Bank
// Handles location-based donor-recipient matching

export interface Location {
  latitude: number
  longitude: number
  address?: string
}

export interface DonorWithDistance extends Location {
  id: string
  name: string
  bloodType: string
  distance: number
  matchScore: number
}

/**
 * Get user's current location with permission
 * Returns latitude and longitude
 */
export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  })
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Find donors near recipient location
 * Filters by blood type and distance radius
 */
export async function findNearbyDonors(
  recipientLocation: Location,
  bloodType: string,
  radiusKm = 10,
  donors: any[] = [],
): Promise<DonorWithDistance[]> {
  const nearbyDonors: DonorWithDistance[] = []

  donors.forEach((donor) => {
    const distance = calculateDistance(
      recipientLocation.latitude,
      recipientLocation.longitude,
      donor.location.latitude,
      donor.location.longitude,
    )

    if (distance <= radiusKm && donor.bloodType === bloodType && donor.isActive) {
      nearbyDonors.push({
        ...donor,
        distance,
        matchScore: calculateMatchScore(bloodType, donor.bloodType, distance),
      })
    }
  })

  return nearbyDonors.sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Calculate AI match score based on multiple factors
 */
export function calculateMatchScore(
  requiredBloodType: string,
  donorBloodType: string,
  distanceKm: number,
  lastDonationDays = 0,
): number {
  let score = 0

  // Blood type compatibility (40% weight)
  const bloodTypeScore = donorBloodType === requiredBloodType ? 100 : 0
  score += bloodTypeScore * 0.4

  // Distance proximity (30% weight)
  let distanceScore = 0
  if (distanceKm <= 2) distanceScore = 100
  else if (distanceKm <= 5) distanceScore = 80
  else if (distanceKm <= 10) distanceScore = 60
  else distanceScore = 40
  score += distanceScore * 0.3

  // Donor availability (20% weight)
  let availabilityScore = 100
  if (lastDonationDays < 30) availabilityScore = 60
  else if (lastDonationDays < 60) availabilityScore = 80
  score += availabilityScore * 0.2

  // Additional factors (10% weight)
  const otherScore = 75 // Base score for rating, verification, etc.
  score += otherScore * 0.1

  return Math.round(score)
}

/**
 * Get multiple donors sorted by match score
 */
export async function getTopMatchedDonors(
  recipientLocation: Location,
  bloodType: string,
  radiusKm = 10,
  limit = 5,
  donors: any[] = [],
): Promise<DonorWithDistance[]> {
  const matched = await findNearbyDonors(recipientLocation, bloodType, radiusKm, donors)
  return matched.slice(0, limit)
}
