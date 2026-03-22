// Pure math helpers for calculating fuel cost based on distance, MPG, and gas price. 

export function milesToGallons(miles, mpg) {
  if (!Number.isFinite(miles) || !Number.isFinite(mpg) || mpg <= 0) return null;
  return miles / mpg;
}

export function tripFuelCost(miles, mpg, pricePerGallon) {
  if (
    !Number.isFinite(miles) ||
    !Number.isFinite(mpg) ||
    !Number.isFinite(pricePerGallon) ||
    mpg <= 0 ||
    pricePerGallon < 0
  ) {
    return null;
  }
  const gallons = miles / mpg;
  return gallons * pricePerGallon;
}

export function costPerMile(mpg, pricePerGallon) {
  if (!Number.isFinite(mpg) || !Number.isFinite(pricePerGallon) || mpg <= 0 || pricePerGallon < 0) return null;
  return pricePerGallon / mpg;
}