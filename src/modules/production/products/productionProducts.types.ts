import { ProductRow, StandardGrowthRow } from "./productionProducts.repository";

export interface ProductResponse {
  id: number;
  breed: string;
}

export interface StandardResponse {
  week: number;
  sex: "female" | "male";
  hhPctProduction: number | null;
  hdPctProduction: number | null;
  heWeek: number | null;
  heCum: number | null;
  saleableChicksWeek: number | null;
  saleableChicksCum: number | null;
  eggWeightWeek: number | null;
  livability: number | null;
  saleablePctHatch: number | null;
  bodyWeightMin: number | null;
  bodyWeightAvg: number | null;
  bodyWeightMax: number | null;
}

export function sanitizeProduct(product: ProductRow): ProductResponse {
  return {
    id: product.id,
    breed: product.breed,
  };
}

export function sanitizeStandard(standard: StandardGrowthRow): StandardResponse {
  return {
    week: standard.week,
    sex: standard.sex,
    hhPctProduction: standard.hh_pct_production,
    hdPctProduction: standard.hd_pct_production,
    heWeek: standard.he_week,
    heCum: standard.he_cum,
    saleableChicksWeek: standard.saleable_chicks_week,
    saleableChicksCum: standard.saleable_chicks_cum,
    eggWeightWeek: standard.egg_weight_week,
    livability: standard.livability,
    saleablePctHatch: standard.saleable_pct_hatch,
    bodyWeightMin: standard.min_value,
    bodyWeightAvg: standard.avg_value,
    bodyWeightMax: standard.max_value,
  };
}
