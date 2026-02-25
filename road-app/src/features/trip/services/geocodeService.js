// API GEOCODE SERVICE
// This file will contain functions to call the Google Maps Geocoding API to convert addresses to lat/lng and vice versa.
// We will use this in TripMapScreen to get lat/lng for the start and end locations entered by the user, so we can display them on the map and get directions.

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Converts an address/place string into coordinates using Google Geocoding API
/* export async function geocodeAddress(address) {
  if (!address || !address.trim()) {
    throw new Error("Address is required");
  }
  if (!GOOGLE_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env");
  }

  const encoded = encodeURIComponent(address.trim());
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding request failed (${res.status})`);
  }

  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) {
    // Examples: ZERO_RESULTS, REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST
    const message = data.error_message
      ? `${data.status}: ${data.error_message}`
      : `Geocoding failed: ${data.status}`;
    throw new Error(message);
  }

  const best = data.results[0];
  const { lat, lng } = best.geometry.location;

  return {
    lat,
    lng,
    formattedAddress: best.formatted_address,
    placeId: best.place_id,
  };
}
*/

//TEMP DELETE THIS - I cant test this without connecting debit/credit card ;((
export async function geocodeAddress(address) {
  // Fake coordinates for testing
  return {
    lat: 34.11111,
    lng: -117.11111,
    formattedAddress: address,
  };
}