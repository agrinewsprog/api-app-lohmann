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
    const hensHoused = flock.hens_housed;

    // Track the last valid standard for carry-forward strategy
    let lastValidStandard: StandardGrowthRow | null = null;

    // Generate rows from startWeek to startWeek + productionPeriod (inclusive)
    for (let i = 0; i <= productionPeriod; i++) {
      const rowWeek = startWeek + i;

      // Get standard for this week, or use carry-forward
      let standard = standardsMap.get(rowWeek);

      if (standard) {
        lastValidStandard = standard;
      } else if (lastValidStandard) {
        // Carry-forward: use last available standard
        standard = lastValidStandard;
      }

      // Calculate the period date based on offset from hatch date
      // rowWeek is the standard week, i is the period index (0-based)
      const periodStartDate = addDays(hatchDate, rowWeek * 7);
      const period = formatISOWeekPeriod(periodStartDate);

      // Calculate values
      const hdPct = standard?.hd_pct_production ?? null;
      const hhPct = standard?.hh_pct_production ?? null;
      const heWeek = standard?.he_week ?? null;
      const heCum = standard?.he_cum ?? null;
      const saleableChicksWeekVal = standard?.saleable_chicks_week ?? null;
      const saleableChicksCumVal = standard?.saleable_chicks_cum ?? null;

      // eggsWeek = hensHoused * (hd_pct_production / 100) * 7
      // If hd_pct_production is null, use hh_pct_production. If both null, 0
      const pctProduction = hdPct ?? hhPct ?? 0;
      const eggs = Math.round(hensHoused * (pctProduction / 100) * 7);

      // hatchingEggsWeek = hensHoused * he_week (he_week is already a per-hen value)
      const hatchingEggs =
        heWeek !== null ? Math.round(hensHoused * heWeek) : 0;

      // saleableChicksWeek = hensHoused * saleable_chicks_week
      const saleableChicks =
        saleableChicksWeekVal !== null
          ? Math.round(hensHoused * saleableChicksWeekVal)
          : 0;

      // Cumulative values
      const hatchingEggsCum =
        heCum !== null ? Math.round(hensHoused * heCum) : 0;
      const saleableChicksCum =
        saleableChicksCumVal !== null
          ? Math.round(hensHoused * saleableChicksCumVal)
          : 0;

      rows.push({
        period,
        weekIndex: i,
        standardWeek: rowWeek,
        hensHoused,
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
        hatchDate: flock.hatch_date.toISOString().split("T")[0],
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
