export const metersToMiles = (m) => m / 1609.344;

export const secondsToMinutes = (s) => parseInt(s) / 60;

export const milesToMeters = (mi) => mi * 1609.344;

export const calcGasCost = (distance, mpg, gasPrice) =>
  ((distance / mpg) * gasPrice).toFixed(2);
