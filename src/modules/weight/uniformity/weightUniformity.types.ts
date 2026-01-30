/**
 * Types for the Weight Uniformity beta provider.
 * This is a read-only fixture-based module for testing purposes.
 */

/**
 * Uniformity session metadata
 */
export interface Uniformity {
  productId: string;
  measureUnit: string;
  userId: string;
  flockId?: number;
  uuid: string;
}

/**
 * Per-week uniformity setup data
 */
export interface UniformitySetup {
  week: number;
  minWeight: number;
  interval: number;
  maxWeight: number;
  uniformityUuid: string;
  weights: string; // JSON string of weight counts
  totalChicken: number;
}

/**
 * A complete uniformity entry from the fixture file
 */
export interface UniformityEntry {
  uniformity: Uniformity;
  uniformitySetup: UniformitySetup[];
}

/**
 * Indexed uniformity entry with week lookup map
 */
export interface IndexedUniformityEntry extends UniformityEntry {
  weekMap: Map<number, UniformitySetup>;
}

/**
 * Response for GET /api/weight/uniformity
 */
export interface UniformityResponse {
  success: boolean;
  uniformity: Uniformity;
  uniformitySetup: UniformitySetup[];
}

/**
 * Response for GET /api/weight/uniformity/week
 */
export interface UniformityWeekResponse {
  success: boolean;
  uniformity: Uniformity;
  item: UniformitySetup;
}

/**
 * Response for GET /api/weight/uniformity/:uuid
 */
export interface UniformityByUuidResponse {
  success: boolean;
  uniformity: Uniformity;
  uniformitySetup: UniformitySetup[];
}

/**
 * Response for GET /api/weight/uniformity/last
 */
export interface UniformityLastResponse {
  success: boolean;
  uniformityUuid: string;
}

/**
 * Response for GET /api/weight/uniformity/:uniformityUuid/week
 */
export interface UniformityWeekByUuidResponse {
  success: boolean;
  uniformity: Uniformity;
  item: UniformitySetup;
}
