/**
 * Weight Products Beta Data Provider Types
 *
 * These types define the structure for the beta weight products fixture data.
 * The data is loaded from a JSON file and cached in memory for performance.
 */

export interface WeightProduct {
  id: string;
  name: string;
  productgroup: string;
  color: string;
  kindofattitude: string;
  producttype: string;
}

export interface WeightStandard {
  id: string;
  week: number;
  bodyWeightMin: number;
  bodyWeightMax: number;
  bodyWeightAverage: number;
  hours: number;
  eggs: number;
  eggsNoHD: number;
  eggsNoComl: number;
  eggsNoHDComl: number;
  eggsNoWeek: number;
  eggWeightWeek: number;
  eggWeightComl: number;
  eggMassHH: number;
  eggMassHD: number;
  feedConsumptionDayG: number;
  feedConsumptionDayKj: number;
  feedConsumptionComl: number;
  hatchingEggs: number;
  hatchingEggsWeek: number;
  hatchingEggsCumul: number;
  chicks: number;
  chicksWeek: number;
  chicksComl: number;
  totalChicks: number;
  PS: boolean;
  CM: boolean;
}

export interface WeightProductWithStandards {
  product: WeightProduct;
  standards: WeightStandard[];
}

export interface WeightProductFixtureEntry {
  product: WeightProduct;
  standards: WeightStandard[];
}

// Response types for API endpoints
export interface ProductSummaryResponse {
  id: string;
  name: string;
  productgroup: string;
  color: string;
  kindofattitude: string;
  producttype: string;
}

export interface ProductsListResponse {
  items: ProductSummaryResponse[];
}

export interface ProductDetailResponse {
  product: WeightProduct;
  standards: WeightStandard[];
}

export interface StandardByWeekResponse {
  item: WeightStandard;
}
