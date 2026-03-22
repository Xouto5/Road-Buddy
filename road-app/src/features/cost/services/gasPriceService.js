// dont worry about this yet, i still gotta find an API to get gas prices -jerry


const axios = require('axios');

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY; 

const getGasStationPrices = async (latitude, longitude, radius = 1500) => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

    try {
        const response = await axios.get(url, {
            params: {
                location: `${latitude},${longitude}`,
                radius: radius,
                type: 'gas_station',
                key: API_KEY
            }
        });

        const stations = response.data.results.map(station => ({
            name: station.name,
            address: station.vicinity,
            rating: station.rating,
            price_level: station.price_level // Price level (0-4)
        }));

        return stations;

    } catch (error) {
        console.error("Error fetching gas station prices:", error);
        throw error;
    }
};

// Export the function
module.exports = {
    getGasStationPrices
};



/*
import axios from 'axios';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY; // Replace with your actual Google API key
const BASE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

// Function to get gas stations near a location
const getGasStations = async (latitude, longitude) => {
  try {
    const url = `${BASE_PLACES_URL}?location=${latitude},${longitude}&radius=5000&type=gas_station&key=${GOOGLE_API_KEY}`;
    const response = await axios.get(url);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching gas stations:", error.message);
    return [];
  }
};

// Mock function to get gas prices (Replace with actual implementation)
const mockGetGasPrice = async (stationId) => {
  // This should ideally call a gas price API e.g., GasBuddy to get actual prices
  const mockPrices = {
    'station1': 3.00,
    'station2': 2.80,
    'station3': 3.20,
  };
  return mockPrices[stationId] || 3.00; // Default to $3.00 if not found
};

// Main function to get gas price
const getGasPrice = async (location) => {
  try {
    const [lat, lng] = location.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid location format. Use lat,lng.');

    const stations = await getGasStations(lat, lng);
    if (stations.length === 0) {
      throw new Error('No gas stations found nearby.');
    }

    const pricesPromises = stations.map(station => 
      mockGetGasPrice(station.place_id)  // Replace with actual price fetching logic
    );

    const prices = await Promise.all(pricesPromises);
    const averagePrice = prices.reduce((acc, price) => acc + price, 0) / prices.length;

    return averagePrice;

  } catch (error) {
    console.error("Error fetching gas price:", error.message);
    return 3.00; // Example fallback price
  }
};

export { getGasPrice };

*/