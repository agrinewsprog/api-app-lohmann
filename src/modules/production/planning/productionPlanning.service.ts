import { ProductionFlocksRepository } from "../flocks/productionFlocks.repository";
import { AppError } from "../../../middlewares/errorHandler";
import {
  ProductionPlanningRepository,
  StandardGrowthRow,
} from "./productionPlanning.repository";
import {
  PlanningExecuteResponse,
  PlanningRow,
} from "./productionPlanning.types";
import { formatISOWeekPeriod, addDays } from "./productionPlanning.utils";
import { formatLocalDate } from "../../../utils/date";

export class ProductionPlanningService {
  private flocksRepository: ProductionFlocksRepository;
  private planningRepository: ProductionPlanningRepository;

  constructor() {
    this.flocksRepository = new ProductionFlocksRepository();
    this.planningRepository = new ProductionPlanningRepository();
  }

  async executePlan(
    flockId: number,
    userId: number,
  ): Promise<PlanningExecuteResponse> {
    // Load flock from DB
    const flock = await this.flocksRepository.findByIdAndUserId(
      flockId,
      userId,
    );

    if (!flock) {
      throw new AppError(404, "Flock not found");
    }

    if (!flock.hatch_date) {
      throw new AppError(400, "Flock does not have a hatch date set");
    }

    if (!flock.product_id) {
      throw new AppError(400, "Flock does not have a product assigned");
    }

    // Parse productId as integer (stored as string in flock but references int in DB)
    const productId = parseInt(flock.product_id, 10);
    if (isNaN(productId)) {
      throw new AppError(400, "Invalid product ID format");
    }

    // Fetch standards from DB (female by default)
    const standards = await this.planningRepository.findStandardsByProductId(
      productId,
      "female",
    );

    if (!standards || standards.length === 0) {
      throw new AppError(
        400,
        "Standards not found for the assigned product in the database",
      );
    }

    // Fetch product info
    const product = await this.planningRepository.findProductById(productId);

    // Create standards map for quick lookup by week
    const standardsMap = new Map<number, StandardGrowthRow>();
    for (const standard of standards) {
      standardsMap.set(standard.week, standard);
    }

    // Determine startWeek: first week where hd_pct_production > 0 (or hh_pct_production > 0)
    const startWeek = this.determineStartWeek(standards);

    // Generate planning rows
    const rows: PlanningRow[] = [];
    const hatchDate = new Date(flock.hatch_date);
    const productionPeriod = flock.production_period;

    // Advanced settings (null = use breed standard curve)
    const initialMortalityPct = flock.initial_mortality_pct ?? 0;
    const eggsPctFactor = (flock.eggs_pct ?? 100) / 100;
    const hatchingEggsPctOverride = flock.hatching_eggs_pct ?? null;
    const chicksPctOverride = flock.chicks_pct ?? null;

    // Apply initial mortality once to hens housed
    const hensAlive = Math.round(flock.hens_housed * (1 - initialMortalityPct / 100));

    // Track the last valid standard for carry-forward strategy
    let lastValidStandard: StandardGrowthRow | null = null;

    // Cumulative accumulators for advanced-settings mode (no standard cum values available)
    let hatchingEggsCumAcc = 0;
    let saleableChicksCumAcc = 0;

    // Generate rows from startWeek to productionPeriod (end week of life, inclusive)
    for (let rowWeek = startWeek; rowWeek <= productionPeriod; rowWeek++) {
      const i = rowWeek - startWeek; // weekIndex (0-based)

      // Get standard for this week, or use carry-forward
      let standard = standardsMap.get(rowWeek);

      if (standard) {
        lastValidStandard = standard;
      } else if (lastValidStandard) {
        standard = lastValidStandard;
      }

      // Calculate the period date based on offset from hatch date
      const periodStartDate = addDays(hatchDate, rowWeek * 7);
      const period = formatISOWeekPeriod(periodStartDate);

      const hdPct = standard?.hd_pct_production ?? null;
      const hhPct = standard?.hh_pct_production ?? null;

      // Total eggs: apply eggsPct multiplier on top of breed standard
      const pctProduction = hdPct ?? hhPct ?? 0;
      const eggs = Math.round(hensAlive * (pctProduction / 100) * 7 * eggsPctFactor);

      let hatchingEggs: number;
      let saleableChicks: number;
      let hatchingEggsCum: number;
      let saleableChicksCum: number;

      if (hatchingEggsPctOverride !== null || chicksPctOverride !== null) {
        // Advanced mode: flat % overrides replace per-week standard curves
        const hePct = hatchingEggsPctOverride ?? (standard?.pct_hatching_eggs ?? 0);
        const chPct = chicksPctOverride ?? (standard?.saleable_pct_hatch ?? 0);

        hatchingEggs = Math.round(eggs * (hePct / 100));
        saleableChicks = Math.round(hatchingEggs * (chPct / 100));

        hatchingEggsCumAcc += hatchingEggs;
        saleableChicksCumAcc += saleableChicks;
        hatchingEggsCum = hatchingEggsCumAcc;
        saleableChicksCum = saleableChicksCumAcc;
      } else {
        // Standard mode: use per-week values from breed standard
        const heWeek = standard?.he_week ?? null;
        const heCum = standard?.he_cum ?? null;
        const saleableChicksWeekVal = standard?.saleable_chicks_week ?? null;
        const saleableChicksCumVal = standard?.saleable_chicks_cum ?? null;

        hatchingEggs = heWeek !== null ? Math.round(hensAlive * heWeek) : 0;
        saleableChicks = saleableChicksWeekVal !== null ? Math.round(hensAlive * saleableChicksWeekVal) : 0;
        hatchingEggsCum = heCum !== null ? Math.round(hensAlive * heCum) : 0;
        saleableChicksCum = saleableChicksCumVal !== null ? Math.round(hensAlive * saleableChicksCumVal) : 0;
      }

      rows.push({
        period,
        weekIndex: i,
        standardWeek: rowWeek,
        hensHoused: hensAlive,
        eggs,
        hatchingEggs,
        saleableChicks,
        hatchingEggsCum,
        saleableChicksCum,
        hdPctProduction: hdPct,
        hhPctProduction: hhPct,
      });
    }

    return {
      flock: {
        id: flock.id,
        name: flock.name,
        hatchDate: formatLocalDate(flock.hatch_date),
        hensHoused: flock.hens_housed,
        productionPeriod: flock.production_period,
        farmId: flock.farm_id,
      },
      product: product
        ? {
            id: product.id,
            breed: product.breed,
          }
        : null,
      startWeek,
      rows,
    };
  }

  /**
   * Determines the startWeek: the first week where production begins.
   * This is the first week where hd_pct_production > 0 (or hh_pct_production > 0 if hd is null).
   * If no week has production > 0, returns 0.
   *
   * @param standards Array of standards sorted by week ASC
   * @returns The start week number
   */
  private determineStartWeek(standards: StandardGrowthRow[]): number {
    for (const standard of standards) {
      const hdPct = standard.hd_pct_production;
      const hhPct = standard.hh_pct_production;

      // Check if either production percentage is greater than 0
      if ((hdPct !== null && hdPct > 0) || (hhPct !== null && hhPct > 0)) {
        return standard.week;
      }
    }

    // If no production week found, default to 0
    return 0;
  }
}
