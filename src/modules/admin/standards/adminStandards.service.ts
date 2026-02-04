import { AdminStandardsRepository } from "./adminStandards.repository";
import { StandardsRepository } from "../../standards/standards.repository";
import { AppError } from "../../../middlewares/errorHandler";
import {
  CreateStandardWeekDTO,
  UpdateStandardWeekDTO,
  StandardWeekResponse,
} from "./adminStandards.types";
import {
  GrowthCurveResponse,
  GrowthPoint,
} from "../../standards/standards.types";

export class AdminStandardsService {
  private repository: AdminStandardsRepository;
  private standardsRepository: StandardsRepository;

  constructor() {
    this.repository = new AdminStandardsRepository();
    this.standardsRepository = new StandardsRepository();
  }

  async getStandardWeek(id: number): Promise<StandardWeekResponse> {
    const week = await this.repository.findGrowthById(id);
    if (!week) {
      throw new AppError(404, "Standard week not found");
    }

    return this.mapToResponse(week);
  }

  async getStandardWeeksByProduct(
    productId: number,
  ): Promise<GrowthCurveResponse> {
    // Verify product exists
    const product = await this.standardsRepository.findProductById(productId);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    const allGrowthData =
      await this.standardsRepository.findGrowthByProduct(productId);

    const femalePoints: (GrowthPoint & { id: number })[] = [];
    const malePoints: (GrowthPoint & { id: number })[] = [];

    for (const g of allGrowthData) {
      const point: any = {
        id: g.id,
        week: g.week,
        min: g.min_value,
        avg: g.avg_value,
        max: g.max_value,
      };

      if (g.sex === "female") {
        // Add production standards data for females
        point.livability = g.livability;
        point.hhPctProduction = g.hh_pct_production;
        point.minHdPctProduction = g.min_hd_pct_production;
        point.hdPctProduction = g.hd_pct_production;
        point.maxHdPctProduction = g.max_hd_pct_production;
        point.ehhWeek = g.ehh_week;
        point.ehhCum = g.ehh_cum;
        point.pctHatchingEggs = g.pct_hatching_eggs;
        point.heWeek = g.he_week;
        point.heCum = g.he_cum;
        point.totalPctHatch = g.total_pct_hatch;
        point.saleablePctHatch = g.saleable_pct_hatch;
        point.saleableChicksWeek = g.saleable_chicks_week;
        point.saleableChicksCum = g.saleable_chicks_cum;
        point.eggWeightWeek = g.egg_weight_week;
        femalePoints.push(point);
      } else {
        malePoints.push(point);
      }
    }

    return {
      productId: product.id,
      breed: product.breed,
      color: product.color,
      female: femalePoints,
      male: malePoints,
    };
  }

  async createStandardWeek(
    dto: CreateStandardWeekDTO,
  ): Promise<StandardWeekResponse> {
    // Verify product exists
    const product = await this.standardsRepository.findProductById(
      dto.productId,
    );
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    // Check for duplicate week/sex combination
    const exists = await this.repository.checkDuplicateWeek(
      dto.productId,
      dto.week,
      dto.sex,
    );
    if (exists) {
      throw new AppError(
        400,
        `Week ${dto.week} for ${dto.sex} already exists for this product`,
      );
    }

    // Validate min <= avg <= max
    if (dto.min > dto.avg || dto.avg > dto.max) {
      throw new AppError(400, "Values must satisfy: min <= avg <= max");
    }

    const id = await this.repository.createGrowth(
      dto.productId,
      dto.week,
      dto.sex,
      dto.min,
      dto.avg,
      dto.max,
    );

    const created = await this.repository.findGrowthById(id);
    if (!created) {
      throw new AppError(500, "Failed to retrieve created standard week");
    }

    return this.mapToResponse(created);
  }

  async updateStandardWeek(
    id: number,
    dto: UpdateStandardWeekDTO,
  ): Promise<StandardWeekResponse> {
    const existing = await this.repository.findGrowthById(id);
    if (!existing) {
      throw new AppError(404, "Standard week not found");
    }

    // Validate the new values if all three are being updated or can be derived
    const newMin = dto.min ?? existing.min_value;
    const newAvg = dto.avg ?? existing.avg_value;
    const newMax = dto.max ?? existing.max_value;

    if (newMin > newAvg || newAvg > newMax) {
      throw new AppError(400, "Updated values must satisfy: min <= avg <= max");
    }

    await this.repository.updateGrowth(id, {
      minValue: dto.min,
      avgValue: dto.avg,
      maxValue: dto.max,
    });

    const updated = await this.repository.findGrowthById(id);
    if (!updated) {
      throw new AppError(500, "Failed to retrieve updated standard week");
    }

    return this.mapToResponse(updated);
  }

  async deleteStandardWeek(id: number): Promise<void> {
    const existing = await this.repository.findGrowthById(id);
    if (!existing) {
      throw new AppError(404, "Standard week not found");
    }

    const deleted = await this.repository.deleteGrowth(id);
    if (!deleted) {
      throw new AppError(500, "Failed to delete standard week");
    }
  }

  private mapToResponse(growth: any): StandardWeekResponse {
    return {
      id: growth.id,
      productId: growth.product_id,
      week: growth.week,
      sex: growth.sex,
      min: growth.min_value,
      avg: growth.avg_value,
      max: growth.max_value,
      createdAt: growth.created_at,
      updatedAt: growth.updated_at,
    };
  }
}
