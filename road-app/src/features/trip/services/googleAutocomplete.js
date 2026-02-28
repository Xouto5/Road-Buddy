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

// TODO: Read more about sessionToken and calling the correct API once the user selects an address from autocomplete.
// Google only bills 1 time per session, instead charging every single API calls each request without sessionToken.
// Need to find the endpoint to "CONFIRM" location using placeId for the billing to only be charged per session.

const getGoogleAutocomplete = async (userInput) => {
  console.log("userinput in getgoogleautocomplete", userInput);
  try {
    const response = await fetch(GOOGLE_AUTOCOMPLETE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": returnFields.join(","),
      },
      body: JSON.stringify({
        input: userInput,
        includedRegionCodes: "us", // currently restrict to US. We can update it in the future.
      }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export default getGoogleAutocomplete;
