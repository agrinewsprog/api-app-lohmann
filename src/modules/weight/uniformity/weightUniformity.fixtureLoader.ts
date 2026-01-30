import { readFileSync } from "fs";
import { resolve } from "path";
import { env } from "../../../config/env";
import { logger } from "../../../utils/logger";
import {
  UniformityEntry,
  IndexedUniformityEntry,
  Uniformity,
  UniformitySetup,
} from "./weightUniformity.types";

/**
 * In-memory cache and indexes for the weight uniformity fixture data.
 *
 * The fixture is loaded once at startup (or first request) and cached.
 * Indexes are built for fast lookups by:
 * - triplet key: `${userId}:${flockId}:${productId}`
 * - uuid
 */
class WeightUniformityFixtureLoader {
  private loaded = false;

  // Index by triplet key: `${userId}:${flockId}:${productId}` -> entry
  private tripletIndex: Map<string, IndexedUniformityEntry> = new Map();

  // Index by uuid -> entry
  private uuidIndex: Map<string, IndexedUniformityEntry> = new Map();

  /**
   * Build the triplet key for indexing
   */
  private buildTripletKey(
    userId: string,
    flockId: number,
    productId: string,
  ): string {
    return `${userId}:${flockId}:${productId}`;
  }

  /**
   * Load and parse the fixture file, building indexes for fast lookups.
   * This method is idempotent - subsequent calls are no-ops.
   */
  load(): void {
    if (this.loaded) {
      return;
    }

    const filePath = resolve(
      process.cwd(),
      env.BETA_WEIGHT_UNIFORMITY_JSON_PATH,
    );
    logger.info(`Loading weight uniformity fixture from: ${filePath}`);

    const startTime = Date.now();

    try {
      const rawData = readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(rawData);

      // Handle both single entry and array formats
      const entries: UniformityEntry[] = Array.isArray(parsed)
        ? parsed
        : [parsed];

      for (const entry of entries) {
        const { uniformity, uniformitySetup } = entry;

        // Build week map for fast week lookups
        const weekMap = new Map<number, UniformitySetup>();
        for (const setup of uniformitySetup) {
          weekMap.set(setup.week, setup);
        }

        const indexedEntry: IndexedUniformityEntry = {
          uniformity,
          uniformitySetup,
          weekMap,
        };

        // Build triplet index
        const flockId = uniformity.flockId ?? 0;
        const tripletKey = this.buildTripletKey(
          uniformity.userId,
          flockId,
          uniformity.productId,
        );
        this.tripletIndex.set(tripletKey, indexedEntry);

        // Build uuid index
        this.uuidIndex.set(uniformity.uuid, indexedEntry);
      }

      this.loaded = true;

      const loadTime = Date.now() - startTime;
      logger.info(`Weight uniformity fixture loaded successfully`, {
        entryCount: entries.length,
        loadTimeMs: loadTime,
      });
    } catch (error) {
      logger.error("Failed to load weight uniformity fixture", error);
      throw error;
    }
  }

  /**
   * Ensure the fixture is loaded. Call this before any data access.
   */
  ensureLoaded(): void {
    if (!this.loaded) {
      this.load();
    }
  }

  /**
   * Get entry by triplet key (userId, flockId, productId).
   * Returns undefined if not found.
   */
  getByTriplet(
    userId: string,
    flockId: number,
    productId: string,
  ): IndexedUniformityEntry | undefined {
    this.ensureLoaded();
    const key = this.buildTripletKey(userId, flockId, productId);
    return this.tripletIndex.get(key);
  }

  /**
   * Get entry by uuid.
   * Returns undefined if not found.
   */
  getByUuid(uuid: string): IndexedUniformityEntry | undefined {
    this.ensureLoaded();
    return this.uuidIndex.get(uuid);
  }

  /**
   * Get week setup from a specific entry.
   * Returns undefined if entry or week not found.
   */
  getWeekSetup(
    userId: string,
    flockId: number,
    productId: string,
    week: number,
  ): { uniformity: Uniformity; setup: UniformitySetup } | undefined {
    const entry = this.getByTriplet(userId, flockId, productId);

    if (!entry) {
      return undefined;
    }

    const setup = entry.weekMap.get(week);
    if (!setup) {
      return undefined;
    }

    return {
      uniformity: entry.uniformity,
      setup,
    };
  }

  /**
   * Get week setup by uniformityUuid.
   * Returns undefined if entry or week not found.
   */
  getWeekSetupByUuid(
    uuid: string,
    week: number,
  ): { uniformity: Uniformity; setup: UniformitySetup } | undefined {
    const entry = this.getByUuid(uuid);
    if (!entry) {
      return undefined;
    }

    const setup = entry.weekMap.get(week);
    if (!setup) {
      return undefined;
    }

    return {
      uniformity: entry.uniformity,
      setup,
    };
  }

  /**
   * Get all entries for a given userId.
   * Returns an array of indexed entries.
   */
  getEntriesByUserId(userId: string): IndexedUniformityEntry[] {
    this.ensureLoaded();
    const results: IndexedUniformityEntry[] = [];
    for (const entry of this.uuidIndex.values()) {
      if (entry.uniformity.userId === userId) {
        results.push(entry);
      }
    }
    return results;
  }

  /**
   * Get the "last/default" uniformityUuid for a user.
   * Rules:
   * - Filter by userId
   * - If productId provided, filter by productId
   * - Prefer entries with missing/0/null flockId as "default"
   * - If multiple candidates, pick the first deterministically
   */
  getLastUniformityUuid(
    userId: string,
    productId?: string,
  ): string | undefined {
    this.ensureLoaded();

    let candidates: IndexedUniformityEntry[] = this.getEntriesByUserId(userId);

    // Filter by productId if provided
    if (productId) {
      candidates = candidates.filter(
        (entry) => entry.uniformity.productId === productId,
      );
    }

    if (candidates.length === 0) {
      return undefined;
    }

    // Prefer entries with missing/0/null flockId as "default"
    const defaultEntries = candidates.filter(
      (entry) =>
        entry.uniformity.flockId === undefined ||
        entry.uniformity.flockId === null ||
        entry.uniformity.flockId === 0,
    );

    // Use default entries if available, otherwise use all candidates
    const finalCandidates =
      defaultEntries.length > 0 ? defaultEntries : candidates;

    // Pick the first deterministically (sorted by uuid for consistency)
    finalCandidates.sort((a, b) =>
      a.uniformity.uuid.localeCompare(b.uniformity.uuid),
    );

    return finalCandidates[0].uniformity.uuid;
  }
}

// Singleton instance
export const weightUniformityLoader = new WeightUniformityFixtureLoader();
