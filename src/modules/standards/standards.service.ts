import { StandardsRepository } from "./standards.repository";
import { StandardsImporter } from "./standards.importer";
import { AppError } from "../../middlewares/errorHandler";
import {
  StandardsProductResponse,
  GrowthSingleResponse,
  GrowthCurveResponse,
  GrowthPoint,
  ImportSummary,
  ProductionStandardsResponse,
  ProductionStandardPoint,
  sanitizeProduct,
} from "./standards.types";

export class StandardsService {
  private repository: StandardsRepository;
  private importer: StandardsImporter;

  constructor() {
    this.repository = new StandardsRepository();
    this.importer = new StandardsImporter();
  }

  async getAllProducts(): Promise<StandardsProductResponse[]> {
    const products = await this.repository.findAllProducts();
    return products.map(sanitizeProduct);
  }

  async getGrowthData(
    productId: number,
    week?: number,
    sex?: "female" | "male",
  ): Promise<GrowthSingleResponse | GrowthCurveResponse> {
    const product = await this.repository.findProductById(productId);

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    if (week !== undefined && sex) {
      const growth = await this.repository.findGrowthByProductAndWeekAndSex(
        productId,
        week,
        sex,
      );

      if (!growth) {
        throw new AppError(
          404,
          "Growth data not found for specified week and sex",
        );
      }

      return {
        productId: growth.product_id,
        week: growth.week,
        sex: growth.sex,
        min: growth.min_value,
        avg: growth.avg_value,
        max: growth.max_value,
      };
    }

    if (sex) {
      const growthData = await this.repository.findGrowthByProductAndSex(
        productId,
        sex,
      );

      const points: GrowthPoint[] = growthData.map((g) => {
        const point: GrowthPoint = {
          week: g.week,
          // min: g.min_value,
          avg: g.avg_value,
          // max: g.max_value,
        };

        // Add production standards data for females
        if (sex === "female") {
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
        }

        return point;
      });

      const response: GrowthCurveResponse = {
        productId: product.id,
        breed: product.breed,
        color: product.color,
        female: sex === "female" ? points : [],
        male: sex === "male" ? points : [],
      };

      return response;
    }

    const allGrowthData = await this.repository.findGrowthByProduct(productId);

    const femalePoints: GrowthPoint[] = [];
    const malePoints: GrowthPoint[] = [];

    for (const g of allGrowthData) {
      const point: GrowthPoint = {
        week: g.week,
        // min: g.min_value,
        avg: g.avg_value,
        // max: g.max_value,
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

  async importGrowthStandards(csvPath: string): Promise<ImportSummary> {
    return this.importer.importFromCSV(csvPath);
  }

  async clearAllData(): Promise<{
    productsDeleted: number;
    growthDeleted: number;
  }> {
    return this.repository.deleteAllGrowthData();
  }

  async getProductionStandards(
    productId: number,
  ): Promise<ProductionStandardsResponse> {
    const product = await this.repository.findProductById(productId);

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    const growthData =
      await this.repository.findProductionStandardsByProduct(productId);
    const data: ProductionStandardPoint[] = growthData.map((g) => ({
      week: g.week,
      livability: g.livability,
      hhPctProduction: g.hh_pct_production,
      minHdPctProduction: g.min_hd_pct_production,
      hdPctProduction: g.hd_pct_production,
      maxHdPctProduction: g.max_hd_pct_production,
      ehhWeek: g.ehh_week,
      ehhCum: g.ehh_cum,
      pctHatchingEggs: g.pct_hatching_eggs,
      heWeek: g.he_week,
      heCum: g.he_cum,
      totalPctHatch: g.total_pct_hatch,
      saleablePctHatch: g.saleable_pct_hatch,
      saleableChicksWeek: g.saleable_chicks_week,
      saleableChicksCum: g.saleable_chicks_cum,
      eggWeightWeek: g.egg_weight_week,
    }));

    return {
      productId: product.id,
      breed: product.breed,
      color: product.color,
      data,
    };
  }
}
