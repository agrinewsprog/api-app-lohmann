export interface Product {
  id: string;
  name: string;
  productgroup: string;
  color: string;
  producttype?: string;
  client: string;
  kindofattitude: string;
  productImagePath?: string;
}

export interface Standard {
  id: string;
  week: number;
  eggs: number;
  hours: number;
  PS: boolean;
  CM: boolean;
  eggsNoComl: number;
  feedConsumptionDayG: number;
  bodyWeightMin: number;
  bodyWeightMax: number;
  bodyWeightAverage: number;
  hatchingEggsCumul: number;
  eggWeightWeek: number;
  eggWeightComl: number;
  hatchingEggsWeek: number;
  chicksWeek: number;
  eggsNoHDComl: number;
  eggsNoHD: number;
  feedConsumptionComl: number;
  eggsNoWeek: number;
  feedConsumptionDayKj: number;
  totalChicks: number;
  hatchingEggs: number;
  chicksComl: number;
  eggMassHH: number;
  eggMassHD: number;
  chicks: number;
}

export interface ProductWithStandards {
  product: Product;
  standards: Standard[];
}

export interface ProductResponse {
  id: string;
  name: string;
  productgroup: string;
  color: string;
  producttype: string | null;
  client: string;
  kindofattitude: string;
}

export interface StandardResponse {
  week: number;
  eggs: number;
  hours: number;
  bodyWeightAverage: number;
  bodyWeightMin: number;
  bodyWeightMax: number;
  feedConsumptionDayG: number;
  eggWeightWeek: number;
  eggMassHD: number;
  eggMassHH: number;
}

export function sanitizeProduct(product: Product): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    productgroup: product.productgroup,
    color: product.color,
    producttype: product.producttype || null,
    client: product.client,
    kindofattitude: product.kindofattitude,
  };
}

export function sanitizeStandard(standard: Standard): StandardResponse {
  return {
    week: standard.week,
    eggs: standard.eggs,
    hours: standard.hours,
    bodyWeightAverage: standard.bodyWeightAverage,
    bodyWeightMin: standard.bodyWeightMin,
    bodyWeightMax: standard.bodyWeightMax,
    feedConsumptionDayG: standard.feedConsumptionDayG,
    eggWeightWeek: standard.eggWeightWeek,
    eggMassHD: standard.eggMassHD,
    eggMassHH: standard.eggMassHH,
  };
}
