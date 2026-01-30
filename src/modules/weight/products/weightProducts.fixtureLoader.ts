import { readFileSync } from 'fs';
import { resolve } from 'path';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';
import {
  WeightProductFixtureEntry,
  WeightProduct,
  WeightStandard,
  WeightProductWithStandards
} from './weightProducts.types';

/**
 * In-memory cache and indexes for the weight products fixture data.
 *
 * The fixture is loaded once at startup (or first request) and cached.
 * Indexes are built for fast lookups by productId and productId+week.
 */
class WeightProductsFixtureLoader {
  private loaded = false;
  private productIndex: Map<string, WeightProductWithStandards> = new Map();
  private weekIndex: Map<string, Map<number, WeightStandard>> = new Map();
  private productSummaries: WeightProduct[] = [];

  /**
   * Load and parse the fixture file, building indexes for fast lookups.
   * This method is idempotent - subsequent calls are no-ops.
   */
  load(): void {
    if (this.loaded) {
      return;
    }

    const filePath = resolve(process.cwd(), env.BETA_WEIGHT_PRODUCTS_JSON_PATH);
    logger.info(`Loading weight products fixture from: ${filePath}`);

    const startTime = Date.now();

    try {
      const rawData = readFileSync(filePath, 'utf-8');
      const entries: WeightProductFixtureEntry[] = JSON.parse(rawData);

      for (const entry of entries) {
        const { product, standards } = entry;

        // Build product index
        this.productIndex.set(product.id, { product, standards });

        // Build week index for fast standard lookups
        const weekMap = new Map<number, WeightStandard>();
        for (const standard of standards) {
          weekMap.set(standard.week, standard);
        }
        this.weekIndex.set(product.id, weekMap);

        // Store product summary
        this.productSummaries.push(product);
      }

      this.loaded = true;

      const loadTime = Date.now() - startTime;
      logger.info(`Weight products fixture loaded successfully`, {
        productCount: this.productSummaries.length,
        loadTimeMs: loadTime
      });
    } catch (error) {
      logger.error('Failed to load weight products fixture', error);
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
   * Get all product summaries (without standards arrays).
   */
  getProductSummaries(): WeightProduct[] {
    this.ensureLoaded();
    return this.productSummaries;
  }

  /**
   * Get a product by ID with its standards array.
   * Returns undefined if product not found.
   */
  getProductById(productId: string): WeightProductWithStandards | undefined {
    this.ensureLoaded();
    return this.productIndex.get(productId);
  }

  /**
   * Get a specific standard row by productId and week.
   * Returns undefined if product or week not found.
   */
  getStandardByWeek(productId: string, week: number): WeightStandard | undefined {
    this.ensureLoaded();
    const weekMap = this.weekIndex.get(productId);
    if (!weekMap) {
      return undefined;
    }
    return weekMap.get(week);
  }

  /**
   * Check if a product exists.
   */
  hasProduct(productId: string): boolean {
    this.ensureLoaded();
    return this.productIndex.has(productId);
  }

  /**
   * Check if a product has a specific week in its standards.
   */
  hasWeek(productId: string, week: number): boolean {
    this.ensureLoaded();
    const weekMap = this.weekIndex.get(productId);
    if (!weekMap) {
      return false;
    }
    return weekMap.has(week);
  }
}

// Singleton instance
export const weightProductsLoader = new WeightProductsFixtureLoader();
