// API DIRECTIONS SERVICE
// This file will contain functions to call the Google Maps Directions API to get route information (distance, duration, step-by-step directions) between two lat/lng points.
// We will use this in TripMapScreen to get the route info for the trip, which we can display on the map and in the trip info section.

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

function metersToMiles(meters) {
  return meters / 1609.344;
}

export async function getDirections({ origin, destination, stops = [] }) {
  if (!GOOGLE_API_KEY) throw new Error("Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env");
  if (!origin?.lat || !origin?.lng) throw new Error("Origin is required (lat/lng)");
  if (!destination?.lat || !destination?.lng) throw new Error("Destination is required (lat/lng)");

  const originStr = `${origin.lat},${origin.lng}`;
  const destinationStr = `${destination.lat},${destination.lng}`;

  // Waypoints (stops) format: lat,lng|lat,lng|...
  const waypoints =
    stops.length > 0
      ? `&waypoints=${encodeURIComponent(stops.map((s) => `${s.lat},${s.lng}`).join("|"))}`
      : "";

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${encodeURIComponent(originStr)}` +
    `&destination=${encodeURIComponent(destinationStr)}` +
    waypoints +
    `&mode=driving` +
    `&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions request failed (${res.status})`);

  const data = await res.json();

  if (data.status !== "OK" || !data.routes?.length) {
    const message = data.error_message
      ? `${data.status}: ${data.error_message}`
      : `Directions failed: ${data.status}`;
    throw new Error(message);
  }

  const route = data.routes[0];
  const legs = route.legs || [];

  // Sum all legs (important when using stops)
  const totalMeters = legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
  const totalSeconds = legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);

  return {
    distanceMiles: metersToMiles(totalMeters),
    durationMinutes: totalSeconds / 60,
    // useful later for drawing the route on a map
    polyline: route.overview_polyline?.points || null,
    raw: data, // optional debugging; remove later if you want
  };
}


/*
//TEMP DELETE THIS - I cant test this without connecting debit/credit card ;((
export async function getDirections({ origin, destination, stops = [] }) {
  // Fake data for testing
  return {
    distanceMiles: 12.4,
    durationMinutes: 18,
    polyline: null,
  };
}
  */