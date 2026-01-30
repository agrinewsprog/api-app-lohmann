/**
 * Weight Uniformity Provider
 *
 * This module provides access to weight uniformity data loaded from a JSON fixture file.
 * It's a read-only beta provider for testing purposes before database persistence is implemented.
 *
 * Usage:
 * - Set BETA_WEIGHT_UNIFORMITY_JSON_PATH environment variable to the fixture file path
 * - The fixture is loaded once on first request and cached in memory
 * - Data is indexed for fast lookups by userId:flockId:productId triplet and by uuid
 */

export { weightUniformityLoader } from './weightUniformity.fixtureLoader';
export * from './weightUniformity.types';
