/**
 * Ustaad.pk Smart Matching Engine
 * Implements weighted matching formula:
 * score = (rating_normalized * 0.4) + (proximity_score * 0.3) + (price_match_score * 0.3)
 */

/**
 * Calculates Haversine distance in kilometers between two coordinates
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 10; // Default fallback distance 10km if coordinates missing
  }

  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Rounded to 1 decimal place
};

/**
 * Calculates proximity score from distance
 * Range 0.0 to 1.0 (Closer = Higher score)
 */
const calculateProximityScore = (distanceKm) => {
  if (distanceKm <= 1) return 1.0;
  if (distanceKm <= 50) {
    // Linear decay up to 50 km
    return Math.max(0.05, 1 - distanceKm / 50);
  }
  // Smooth asymptotic falloff for distances > 50km
  return Math.max(0.01, 10 / (10 + distanceKm));
};

/**
 * Calculates price match score based on customer budget and provider price range
 * Range 0.0 to 1.0
 */
const calculatePriceMatchScore = (customerBudget, priceRange) => {
  if (!customerBudget || isNaN(customerBudget) || customerBudget <= 0) {
    return 0.85; // Neutral baseline when customer does not specify budget
  }

  const min = priceRange?.min || 500;
  const max = priceRange?.max || 2500;

  // Exact fit inside provider's price bracket
  if (customerBudget >= min && customerBudget <= max) {
    return 1.0;
  }

  // Budget is lower than provider's minimum
  if (customerBudget < min) {
    const diff = min - customerBudget;
    const penalty = diff / min;
    return Math.max(0.1, 1 - penalty);
  }

  // Budget is higher than provider's maximum (customer has plenty of budget)
  if (customerBudget > max) {
    const surplus = customerBudget - max;
    return Math.max(0.7, 1 - surplus / (2 * customerBudget));
  }

  return 0.8;
};

/**
 * Calculates normalized rating score
 * Range 0.0 to 1.0
 */
const calculateRatingScore = (avgRating, totalReviews) => {
  if (!avgRating || avgRating === 0) {
    // New provider baseline: 3.5 equivalent (0.7) so they are discoverable
    return 0.7;
  }
  return Math.min(1.0, Math.max(0, avgRating / 5.0));
};

/**
 * Main Smart Matching Function
 * Returns ranked array of providers with detailed score breakdown
 */
const rankProviders = (providers, options = {}) => {
  const { customerLat, customerLong, customerBudget, limit = 5 } = options;

  const scoredProviders = providers.map((provider) => {
    const providerLat = provider.location?.lat;
    const providerLong = provider.location?.long;

    // 1. Distance & Proximity
    const distanceKm = calculateDistanceKm(
      customerLat,
      customerLong,
      providerLat,
      providerLong
    );
    const proximityScore = calculateProximityScore(distanceKm);

    // 2. Rating Score
    const ratingScore = calculateRatingScore(
      provider.avgRating,
      provider.totalReviews
    );

    // 3. Price Match Score
    const priceScore = calculatePriceMatchScore(
      customerBudget,
      provider.priceRange
    );

    // Exact requested weighted formula:
    // score = (rating_normalized * 0.4) + (proximity_score * 0.3) + (price_match_score * 0.3)
    const rawScore =
      ratingScore * 0.4 + proximityScore * 0.3 + priceScore * 0.3;
    const finalScore = Math.min(1.0, Math.max(0, rawScore));
    const matchPercentage = Math.round(finalScore * 100);

    return {
      provider,
      distanceKm,
      scores: {
        total: Math.round(finalScore * 1000) / 1000,
        matchPercentage,
        ratingScore: Math.round(ratingScore * 100) / 100,
        proximityScore: Math.round(proximityScore * 100) / 100,
        priceScore: Math.round(priceScore * 100) / 100
      },
      matchHighlights: [
        `${matchPercentage}% Match Score`,
        `${distanceKm} km away`,
        provider.avgRating > 0
          ? `⭐ ${provider.avgRating.toFixed(1)} / 5.0 Rating`
          : '🌟 New Verified Provider',
        `PKR ${provider.priceRange?.min || 500} - ${provider.priceRange?.max || 2500}`
      ]
    };
  });

  // Sort descending by total score
  scoredProviders.sort((a, b) => b.scores.total - a.scores.total);

  return scoredProviders.slice(0, limit);
};

// Pakistani City Presets with Coordinates for quick lookup / fallback
const PAKISTAN_CITIES = [
  { name: 'Lahore', lat: 31.5204, long: 74.3587, province: 'Punjab' },
  { name: 'Karachi', lat: 24.8607, long: 67.0011, province: 'Sindh' },
  { name: 'Islamabad', lat: 33.6844, long: 73.0479, province: 'Federal' },
  { name: 'Rawalpindi', lat: 33.5651, long: 73.0169, province: 'Punjab' },
  { name: 'Faisalabad', lat: 31.4504, long: 73.135, province: 'Punjab' },
  { name: 'Multan', lat: 30.1575, long: 71.5249, province: 'Punjab' },
  { name: 'Peshawar', lat: 34.0151, long: 71.5249, province: 'KPK' },
  { name: 'Gujranwala', lat: 32.1877, long: 74.1945, province: 'Punjab' },
  { name: 'Sialkot', lat: 32.4945, long: 74.5229, province: 'Punjab' },
  { name: 'Quetta', lat: 30.1798, long: 66.975, province: 'Balochistan' }
];

module.exports = {
  calculateDistanceKm,
  calculateProximityScore,
  calculatePriceMatchScore,
  calculateRatingScore,
  rankProviders,
  PAKISTAN_CITIES
};
