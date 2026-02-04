import { ProductionFlocksRepository } from "../flocks/productionFlocks.repository";
import { AppError } from "../../../middlewares/errorHandler";
import {
  getProductById,
  getStandardsByProductId,
} from "../products/productionProducts.loader";
import {
  PlanningExecuteResponse,
  PlanningRow,
} from "./productionPlanning.types";
import {
  formatISOWeekPeriod,
  addDays,
  calculateEggsPeriod,
} from "./productionPlanning.utils";

export class ProductionPlanningService {
  private flocksRepository: ProductionFlocksRepository;

  constructor() {
    this.flocksRepository = new ProductionFlocksRepository();
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

    // Load product and standards
    const product = getProductById(flock.product_id);
    if (!product) {
      throw new AppError(400, "Product not found for this flock");
    }

    const standards = getStandardsByProductId(flock.product_id);
    if (!standards) {
      throw new AppError(400, "Standards not found for the assigned product");
    }

    // Create standards map for quick lookup by week
    const standardsMap = new Map<number, number>();
    for (const standard of standards) {
      standardsMap.set(standard.week, standard.eggs);
    }

    // Generate planning rows
    const rows: PlanningRow[] = [];
    const hatchDate = new Date(flock.hatch_date);
    const productionPeriod = flock.production_period;
    const hensHoused = flock.hens_housed;

    // Generate rows for each week (0 to productionPeriod)
    for (let weekIndex = 0; weekIndex <= productionPeriod; weekIndex++) {
      // Calculate the start date of this period (week)
      const periodStartDate = addDays(hatchDate, weekIndex * 7);

      // Format as ISO week period
      const period = formatISOWeekPeriod(periodStartDate);

      // Get eggs percentage from standards for this age week
      const eggsPercentage = standardsMap.get(weekIndex) ?? 0;

      // Calculate eggs for this period
      const eggs = calculateEggsPeriod(hensHoused, eggsPercentage);

      // Only include rows where eggs > 0
      if (eggs > 0) {
        rows.push({
          period,
          weekIndex,
          hensHoused,
          eggs,
        });
      }
    }

    return {
      flock: {
        id: flock.id,
        name: flock.name,
        hatchDate: flock.hatch_date.toISOString().split("T")[0],
        hensHoused: flock.hens_housed,
        productionPeriod: flock.production_period,
      },
      product: {
        id: product.id,
        name: product.name,
      },
      rows,
    };
  }
}
