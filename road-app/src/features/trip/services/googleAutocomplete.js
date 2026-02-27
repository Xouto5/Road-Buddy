/*
Google Places Autocomplete API.
Used in retrieving starting/destination address information, required to calculate cost/distance.

Author: Bryan Cardeno                               
Date: 02-26-2026 
*/

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;
const GOOGLE_AUTOCOMPLETE_ENDPOINT =
  "https://places.googleapis.com/v1/places:autocomplete";

// fields/properties returned by Google Place API. CSV format
// https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#fieldmask
const returnFields = [
  "suggestions.placePrediction.placeId",
  "suggestions.placePrediction.text.text",
];

// Refer to https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch for fetching API documentation.

const getGoogleAutocomplete = async () => {
  try {
    const response = await fetch(GOOGLE_AUTOCOMPLETE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": returnFields.join(","),
      },
      body: JSON.stringify({
        input: "28278",
        includedRegionCodes: "us",
      }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
};

export default getGoogleAutocomplete;
