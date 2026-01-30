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
  sex: 'female' | 'male';
  min_value: number;
  avg_value: number;
  max_value: number;
  created_at: Date;
  updated_at: Date;
}

export interface GrowthPoint {
  week: number;
  min: number;
  avg: number;
  max: number;
}

export interface GrowthSingleResponse {
  productId: number;
  week: number;
  sex: 'female' | 'male';
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
  'Age in \nWeeks'?: string;
  'Min BW Female'?: string;
  'Avg BW Female'?: string;
  'Max BW Female'?: string;
  'Min BW Male'?: string;
  'Avg BW Male'?: string;
  'Max BW Male'?: string;
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

export function sanitizeProduct(product: StandardsProduct): StandardsProductResponse {
  return {
    id: product.id,
    breed: product.breed,
    color: product.color
  };
}
