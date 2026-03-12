/*
Google API Service
Provides all Google Maps API require for the application:
  - Routes
  - Places

Author: Bryan Cardeno                               
Date: 02-26-2026 
*/

// Billing Information https://developers.google.com/maps/documentation/places/web-service/usage-and-billing

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;
const GOOGLE_PLACES_ENDPOINT = "https://places.googleapis.com/v1/places";

// fields/properties returned by Google Place API. CSV format
// https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#fieldmask
const AUTOCOMPLETE_FIELD_MASK = [
  "suggestions.placePrediction.placeId",
  "suggestions.placePrediction.text.text",
];

// Refer to https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch for fetching API documentation.

// TODO: Read more about sessionToken and calling the correct API once the user selects an address from autocomplete.
// Google only bills 1 time per session, instead charging every single API calls each request without sessionToken.
// Need to find the endpoint to "CONFIRM" location using placeId for the billing to only be charged per session.

export const getGoogleAutocomplete = async (userInput, sessToken) => {
  const url = `${GOOGLE_PLACES_ENDPOINT}:autocomplete`;
  const fieldMask = AUTOCOMPLETE_FIELD_MASK.join(",");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify({
        input: userInput,
        sessionToken: sessToken,
        includedRegionCodes: "us", // currently restrict to US. We can update it in the future.
      }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.log(error);
  }
};

//TODO: Fix to return response ok or something that needs to be verified by the using
export const completeGoogleAddress = async (placeId, sessToken) => {
  const url = `${GOOGLE_PLACES_ENDPOINT}/${placeId}?sessionToken=${sessToken}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "id,displayName,accessibilityOptions,businessStatus",
      },
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
  } catch (error) {
    console.log(error);
  }
};

export const getGooglePlaceLongLat = async (placeId) => {
  const url = `${GOOGLE_PLACES_ENDPOINT}/${placeId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "x-Goog-FieldMask": "location",
      },
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};

const GAS_NEARBY_FIELD_MASK = [
  "places.id",
  "places.fuelOptions",
  "places.displayName",
];

const SEARCH_RADIUS = 8000; // meters

export const getGoogleGasStationNearbyFromLocation = async ({
  longitude: long,
  latitude: lat,
}) => {
  const url = `${GOOGLE_PLACES_ENDPOINT}:searchNearby`;
  const fieldMask = GAS_NEARBY_FIELD_MASK.join(",");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify({
        includedTypes: ["gas_station"],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: long,
            },
            radius: SEARCH_RADIUS,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Response status: ${response.status} \t Response: ${response}`,
      );
    }

    const result = response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};

const GOOGLE_ROUTES_ENDPOINT =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

const ROUTES_FIELD_MASK = [
  "routes.duration",
  "routes.distanceMeters",
  "routes.polyline.encodedPolyline",
];

export const getGoogleDistance = async (originId, destinationId) => {
  try {
    const response = await fetch(GOOGLE_ROUTES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": ROUTES_FIELD_MASK.join(","),
      },
      body: JSON.stringify({
        origin: {
          placeId: originId,
        },
        destination: {
          placeId: destinationId,
        },
        travelMode: "DRIVE",
        regionCode: "us",
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};
