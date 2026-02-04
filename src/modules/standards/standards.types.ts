export interface StandardsProduct {
  id: number;
  breed: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface StandardsProductResponse {
  id: number;
  breed: string;
  color: string;
}

export interface StandardsGrowth {
  id: number;
  product_id: number;
  week: number;
  sex: "female" | "male";
  min_value: number;
  avg_value: number;
  max_value: number;
  // Production standards columns
  livability: number | null;
  hh_pct_production: number | null;
  min_hd_pct_production: number | null;
  hd_pct_production: number | null;
  max_hd_pct_production: number | null;
  ehh_week: number | null;
  ehh_cum: number | null;
  pct_hatching_eggs: number | null;
  he_week: number | null;
  he_cum: number | null;
  total_pct_hatch: number | null;
  saleable_pct_hatch: number | null;
  saleable_chicks_week: number | null;
  saleable_chicks_cum: number | null;
  egg_weight_week: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface GrowthPoint {
  week: number;
  min?: number;
  avg: number;
  max?: number;
  // Production standards (only for females)
  livability?: number | null;
  hhPctProduction?: number | null;
  minHdPctProduction?: number | null;
  hdPctProduction?: number | null;
  maxHdPctProduction?: number | null;
  ehhWeek?: number | null;
  ehhCum?: number | null;
  pctHatchingEggs?: number | null;
  heWeek?: number | null;
  heCum?: number | null;
  totalPctHatch?: number | null;
  saleablePctHatch?: number | null;
  saleableChicksWeek?: number | null;
  saleableChicksCum?: number | null;
  eggWeightWeek?: number | null;
}

export interface ProductionStandardPoint {
  week: number;
  livability: number | null;
  hhPctProduction: number | null;
  minHdPctProduction: number | null;
  hdPctProduction: number | null;
  maxHdPctProduction: number | null;
  ehhWeek: number | null;
  ehhCum: number | null;
  pctHatchingEggs: number | null;
  heWeek: number | null;
  heCum: number | null;
  totalPctHatch: number | null;
  saleablePctHatch: number | null;
  saleableChicksWeek: number | null;
  saleableChicksCum: number | null;
  eggWeightWeek: number | null;
}

export interface ProductionStandardsResponse {
  productId: number;
  breed: string;
  color: string;
  data: ProductionStandardPoint[];
}

export interface GrowthSingleResponse {
  productId: number;
  week: number;
  sex: "female" | "male";
  min: number;
  avg: number;
  max: number;
}

export interface GrowthCurveResponse {
  productId: number;
  breed: string;
  color: string;
  female: GrowthPoint[];
  male: GrowthPoint[];
}

export interface ImportSummary {
  productsInserted: number;
  growthRowsInserted: number;
  rowsSkipped: number;
}

export interface CSVRow {
  Breed?: string;
  Color?: string;
  "Age in \nWeeks"?: string;
  "Min BW Female"?: string;
  "Avg BW Female"?: string;
  "Max BW Female"?: string;
  "Min BW Male"?: string;
  "Avg BW Male"?: string;
  "Max BW Male"?: string;
}

export interface CleanedCSVData {
  breed: string;
  color: string;
  week: number;
  minFemale: number;
  avgFemale: number;
  maxFemale: number;
  minMale: number;
  avgMale: number;
  maxMale: number;
}

export function sanitizeProduct(
  product: StandardsProduct,
): StandardsProductResponse {
  return {
    id: product.id,
    breed: product.breed,
    color: product.color,
  };
}
